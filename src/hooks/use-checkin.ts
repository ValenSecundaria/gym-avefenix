"use client";

import { useEffect, useCallback } from "react";
import {
  getMemberFromCache,
  saveMembersToCache,
  updateMemberInCache,
  enqueuePendingCheckIn,
  getMembersCacheCount,
} from "@/lib/db/indexed-db";
import { fetchSingleMemberAction, getFullMembersCacheAction } from "@/actions/sync.actions";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { getMemberPhotoUrl } from "@/lib/utils";
import type { AccessStatusType, CheckInVerificationResult, LiveCheckInItem } from "@/types";

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
      let status: AccessStatusType = "HABILITADO";

      if (!member.validUntil || new Date(member.validUntil) < now) {
        status = "CUOTA_VENCIDA";
      } else if (
        member.allowedDays !== null &&
        member.allowedDays !== undefined &&
        member.weeklyCheckIns >= member.allowedDays
      ) {
        status = "LIMITE_ALCANZADO";
      }

      let weeklyCheckIns = member.weeklyCheckIns;
      if (status === "HABILITADO") {
        weeklyCheckIns += 1;
        member = { ...member, weeklyCheckIns };
        await updateMemberInCache(dni, { weeklyCheckIns });
      }

      const createdAt = new Date().toISOString();
      const pendingId = await enqueuePendingCheckIn({
        memberId: member.id,
        dni: member.dni,
        status,
        createdAt,
      });

      const photoUrl = getMemberPhotoUrl(member.dni, member.photoFilename);
      const liveCheckIn: LiveCheckInItem = {
        id: `pending_${pendingId}_${Date.now()}`,
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
