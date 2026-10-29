"use client";

import { useEffect, useCallback } from "react";
import {
  getMemberFromCache,
  saveMembersToCache,
  updateMemberInCache,
  enqueuePendingCheckIn,
  getMembersCacheCount,
  getPendingCheckIns,
} from "@/lib/db/indexed-db";
import { fetchSingleMemberAction, getFullMembersCacheAction } from "@/actions/sync.actions";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { getMemberPhotoUrl } from "@/lib/utils";
import type { AccessStatusType, CheckInVerificationResult, LiveCheckInItem } from "@/types";

function isSameLocalDay(iso: string, now: Date): boolean {
  return new Date(iso).toDateString() === now.toDateString();
}

// Mira el caché y también la cola sin subir: si el caché se refrescó desde el servidor antes de
// sincronizar el lote, el ingreso de hoy todavía solo está en la cola.
async function hasEnteredToday(memberId: string, lastCheckInAt: string | null | undefined, now: Date) {
  if (lastCheckInAt && isSameLocalDay(lastCheckInAt, now)) return true;
  const pending = await getPendingCheckIns();
  return pending.some(
    (p) => p.memberId === memberId && p.status === "HABILITADO" && isSameLocalDay(p.createdAt, now)
  );
}

export function useCheckIn() {
  useEffect(() => {
    async function initCache() {
      try {
        const count = await getMembersCacheCount();
        if (count === 0) {
          const res = await getFullMembersCacheAction();
          if (res.success && res.data) {
            await saveMembersToCache(res.data);
          }
        }
      } catch (err) {
        console.warn("[useCheckIn] Error inicializando caché local:", err);
      }
    }
    initCache();

    const unsubscribe = gymBroadcast.subscribe((msg) => {
      if (msg.type === "MEMBER_UPDATED" && msg.member) {
        saveMembersToCache([msg.member]).catch(() => {});
      }
    });
    return unsubscribe;
  }, []);

  const verifyAndLogCheckIn = useCallback(
    async (dniInput: string): Promise<{
      success: boolean;
      data?: CheckInVerificationResult;
      error?: string;
    }> => {
      const dni = dniInput.trim();
      let member = await getMemberFromCache(dni);

      if (!member) {
        const remoteRes = await fetchSingleMemberAction(dni);
        if (!remoteRes.success || !remoteRes.data) {
          return {
            success: false,
            error: remoteRes.error || `No se encontró ningún socio registrado con el DNI ${dni}`,
          };
        }
        member = remoteRes.data;
        await saveMembersToCache([member]);
      }

      const now = new Date();
      const createdAt = now.toISOString();
      let status: AccessStatusType = "HABILITADO";
      let limitReason: CheckInVerificationResult["limitReason"];
      // Solo el pase libre (allowedDays = null) puede entrar varias veces en el mismo día.
      const hasDayLimit = member.allowedDays !== null && member.allowedDays !== undefined;

      if (!member.validUntil || new Date(member.validUntil) < now) {
        status = "CUOTA_VENCIDA";
      } else if (hasDayLimit && (await hasEnteredToday(member.id, member.lastCheckInAt, now))) {
        status = "LIMITE_ALCANZADO";
        limitReason = "DIARIO";
      } else if (hasDayLimit && member.weeklyCheckIns >= member.allowedDays!) {
        status = "LIMITE_ALCANZADO";
        limitReason = "SEMANAL";
      }

      let weeklyCheckIns = member.weeklyCheckIns;
      if (status === "HABILITADO") {
        weeklyCheckIns += 1;
        member = { ...member, weeklyCheckIns, lastCheckInAt: createdAt };
        await updateMemberInCache(dni, { weeklyCheckIns, lastCheckInAt: createdAt });
      }

      const pendingId = await enqueuePendingCheckIn({
        memberId: member.id,
        dni: member.dni,
        status,
        createdAt,
        fullName: member.fullName,
        planName: member.planName,
        photoFilename: member.photoFilename,
      });

      const photoUrl = getMemberPhotoUrl(member.dni, member.photoFilename);
      const liveCheckIn: LiveCheckInItem = {
        id: `pending_${pendingId}`,
        memberId: member.id,
        dni: member.dni,
        fullName: member.fullName,
        photoUrl,
        planName: member.planName,
        status,
        createdAt,
      };

      const verificationResult: CheckInVerificationResult = {
        memberId: member.id,
        dni: member.dni,
        fullName: member.fullName,
        photoUrl,
        status,
        planName: member.planName,
        validUntil: member.validUntil,
        daysUsedThisWeek: weeklyCheckIns,
        allowedDaysPerWeek: member.allowedDays,
        limitReason,
        checkedInAt: createdAt,
      };

      gymBroadcast.postMessage({ type: "CHECKIN_LOGGED", checkIn: liveCheckIn });
      gymBroadcast.postMessage({ type: "CHECKIN_EVENT", payload: verificationResult });

      return { success: true, data: verificationResult };
    },
    []
  );

  return { verifyAndLogCheckIn };
}
