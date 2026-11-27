import type { CachedMember, DebtorMemberItem, PaymentMethodType, PlanOption } from "@/types";
import type { NewMemberFormValues } from "./NewMemberModal";
import { enqueuePendingMember, PendingDniError } from "@/lib/offline/pending-members-store";
import {
  attachStashedPhotoToMember,
  attachStashedPhotoToPendingMember,
  discardStashedPhoto,
  stashNewMemberPhoto,
} from "@/lib/offline/new-member-photo";
import { createMember } from "@/actions/members.actions";
import { registerPayment } from "@/actions/payments.actions";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { saveMembersToCache, updateMemberInCache, getMemberFromCache } from "@/lib/db/indexed-db";

export async function createAdminMemberFlow({
  values,
  plans,
  showToast,
  refreshAllData,
}: {
  values: NewMemberFormValues;
  plans: PlanOption[];
  showToast: (msg: string) => void;
  refreshAllData: () => Promise<void>;
}): Promise<{ success: boolean; error?: string }> {
  const stash = await stashNewMemberPhoto(values.photoBase64, values.dni);
  const input = { ...values, photoBase64: stash.inlinePhoto };

  const saveOffline = async () => {
    try {
      const pending = await enqueuePendingMember(input);
      await attachStashedPhotoToPendingMember(stash, pending.clientId);
      showToast(`Sin conexión: ${values.fullName} quedó guardado en esta PC y se subirá solo al volver internet.`);
      return { success: true };
    } catch (error) {
      await discardStashedPhoto(stash);
      return {
        success: false,
        error: error instanceof PendingDniError ? error.message : "No se pudo guardar el alta en esta PC.",
      };
    }
  };

  if (typeof navigator !== "undefined" && navigator.onLine === false) return saveOffline();

  let res;
  try {
    res = await createMember(input);
  } catch {
    return saveOffline();
  }
  if (!res.success) await discardStashedPhoto(stash);
  if (res.success && res.data) {
    const createdItem = res.data;
    await attachStashedPhotoToMember(stash, createdItem.id, createdItem.dni);
    const cached: CachedMember = {
      id: createdItem.id,
      dni: createdItem.dni,
      fullName: createdItem.fullName,
      photoFilename: createdItem.photoFilename,
      planName: createdItem.planName,
      allowedDays: plans.find((p) => p.id === values.planId)?.allowedDaysPerWeek ?? null,
      validUntil: createdItem.validUntil,
      weeklyCheckIns: 0,
      lastCheckInAt: null,
    };
    saveMembersToCache([cached]).catch(() => {});
    gymBroadcast.postMessage({ type: "MEMBER_UPDATED", member: cached });
    showToast(
      values.planId
        ? `Socio ${values.fullName} registrado y habilitado con éxito.`
        : `Socio ${values.fullName} registrado sin plan: cobrale desde Deudores para habilitarlo.`
    );
    await refreshAllData();
  }
  return { success: res.success, error: res.error };
}

export async function confirmAdminPaymentFlow({
  payload,
  selectedDebtor,
  plans,
  showToast,
  refreshAllData,
}: {
  payload: { memberId: string; planId: string; amount: number; method: PaymentMethodType; notes?: string };
  selectedDebtor: DebtorMemberItem | null;
  plans: PlanOption[];
  showToast: (msg: string) => void;
  refreshAllData: () => Promise<void>;
}): Promise<{ success: boolean; error?: string }> {
  const res = await registerPayment(payload);
  if (res.success && res.data) {
    if (selectedDebtor) {
      updateMemberInCache(selectedDebtor.dni, {
        validUntil: res.data.validUntil,
        planName: res.data.planName,
        allowedDays: plans.find((p) => p.id === payload.planId)?.allowedDaysPerWeek ?? null,
      })
        .then(() => getMemberFromCache(selectedDebtor.dni))
        .then((updated) => {
          if (updated) gymBroadcast.postMessage({ type: "MEMBER_UPDATED", member: updated });
        })
        .catch(() => {});
    }
    showToast(`Pago registrado (${res.data.planName}). Membresía renovada.`);
    await refreshAllData();
  }
  return { success: res.success, error: res.error };
}
