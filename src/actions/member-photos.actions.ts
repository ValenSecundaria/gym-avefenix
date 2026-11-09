"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActionSession } from "@/lib/auth/require-session";
import { normalizeMemberPhoto, storeMemberPhoto } from "@/lib/photo-storage";
import { resolveSafePhotoPath } from "@/lib/security/safe-path";
import type { ActionResponse } from "@/types";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
// Fotos sacadas sin internet pueden llegar días después; más viejas que esto se consideran corruptas.
const MAX_PHOTO_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

export type MemberPhotoUploadStatus =
  | "applied" // quedó como foto del socio
  | "superseded" // guardada, pero el socio ya tiene una foto más nueva: no se reemplaza
  | "cloud_pending" // guardada en la notebook, Supabase no respondió: el dispositivo reintenta
  | "member_missing" // el socio ya no existe (eliminado)
  | "invalid"; // archivo o datos rechazados: no tiene sentido reintentar

export interface MemberPhotoUploadResult {
  status: MemberPhotoUploadStatus;
  photoFilename?: string;
  message?: string;
}

/** Fecha que trae el nombre de una foto (member-DNI-<ms>.webp), para fotos anteriores a photoUpdatedAt. */
function timestampFromFilename(filename: string | null): number | null {
  const match = filename?.match(/-(\d{10,})\.webp$/);
  return match ? Number(match[1]) : null;
}

/**
 * Recibe una foto guardada en el dispositivo y la asocia al socio. Es idempotente: el nombre del
 * archivo sale del DNI y del momento en que se sacó la foto, así que un reintento (respuesta perdida,
 * dos pestañas) reescribe el mismo archivo y deja la base igual: nunca hay duplicados.
 */
export async function uploadMemberPhoto(formData: FormData): Promise<ActionResponse<MemberPhotoUploadResult>> {
  try {
    const session = await getActionSession();
    if (!session) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." };

    const memberId = String(formData.get("memberId") ?? "").trim().slice(0, 64);
    const capturedAt = Number(formData.get("capturedAt"));
    const file = formData.get("photo");

    const now = Date.now();
    if (!memberId || !Number.isInteger(capturedAt) || capturedAt > now + MAX_CLOCK_SKEW_MS || capturedAt < now - MAX_PHOTO_AGE_MS) {
      return { success: true, data: { status: "invalid", message: "Datos de la foto inválidos" } };
    }
    if (!(file instanceof Blob) || file.size === 0 || file.size > MAX_PHOTO_BYTES) {
      return { success: true, data: { status: "invalid", message: "Archivo de foto inválido o demasiado grande" } };
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, dni: true, photoFilename: true, },
    });
    if (!member) return { success: true, data: { status: "member_missing", message: "El socio ya no existe" } };

    const photoFilename = `member-${member.dni.replace(/\D/g, "")}-${capturedAt}.webp`;
    if (!resolveSafePhotoPath(photoFilename)) {
      return { success: true, data: { status: "invalid", message: "Nombre de foto inválido" } };
    }

    let webp: Buffer;
    try {
      webp = await normalizeMemberPhoto(Buffer.from(await file.arrayBuffer()));
    } catch {
      return { success: true, data: { status: "invalid", message: "La imagen está dañada o no es una foto" } };
    }

    const stored = await storeMemberPhoto(photoFilename, webp);

    // Solo reemplaza si esta foto es más nueva que la actual (una foto vieja que se subió tarde no pisa).
    const currentMs = timestampFromFilename(member.photoFilename);
    let status: MemberPhotoUploadStatus = "superseded";
    if (member.photoFilename === photoFilename) {
      status = "applied";
    } else if (currentMs === null || currentMs < capturedAt) {
      const capturedDate = new Date(capturedAt);
      const updated = await prisma.member.updateMany({
        where: {
          id: member.id
        },
        data: { photoFilename },
      });
      status = updated.count > 0 ? "applied" : "superseded";
    }

    if (status === "applied") revalidatePath("/admin");
    if (!stored.cloudSynced) {
      return { success: true, data: { status: "cloud_pending", photoFilename, message: "Falta subirla a Supabase" } };
    }
    return { success: true, data: { status, photoFilename } };
  } catch (error) {
    console.error("[uploadMemberPhoto] Error:", error);
    return { success: false, error: "No se pudo guardar la foto en el servidor" };
  }
}
