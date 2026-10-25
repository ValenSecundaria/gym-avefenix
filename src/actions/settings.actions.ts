"use server";

import { prisma } from "@/lib/prisma";
import { getSessionCookie, issueSessionCookies } from "@/lib/auth/session-cookie";
import { verifySessionToken } from "@/lib/auth/session-token";
import { gymPhoneSchema } from "@/lib/validations/settings.schema";

export type UpdateGymPhoneInput = string | { userId?: string; gymPhone: string };

export type UpdateGymPhoneResult =
  | { success: true; updatedPhone: string }
  | { success: false; error: string };

/**
 * Server Action para actualizar el teléfono institucional de WhatsApp del gimnasio.
 * Sanitiza dígitos, fuerza el prefijo 549 y persiste en la base de datos con soporte para fallback admin.
 */
export async function updateGymPhoneAction(
  input: UpdateGymPhoneInput
): Promise<UpdateGymPhoneResult> {
  try {
    const rawPhone = typeof input === "string" ? input : input?.gymPhone;
    const providedUserId = typeof input === "object" ? input.userId : undefined;

    const validation = gymPhoneSchema.safeParse(rawPhone);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Número de WhatsApp inválido",
      };
    }

    const formattedPhone = validation.data;

    // Obtener sesión activa si no se especificó un userId
    const cookieToken = await getSessionCookie();
    const sessionPayload = cookieToken ? await verifySessionToken(cookieToken) : null;
    const targetUserId = providedUserId || sessionPayload?.id;

    try {
      if (targetUserId && targetUserId !== "admin-master-id") {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { gymPhone: formattedPhone },
        });
      } else {
        const adminUser = await prisma.user.findFirst({
          where: { username: { equals: "admin", mode: "insensitive" } },
        });
        if (adminUser) {
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { gymPhone: formattedPhone },
          });
        }
      }
    } catch (dbError) {
      console.warn("[updateGymPhoneAction] No se pudo persistir en DB, aplicando fallback:", dbError);
      if (process.env.NODE_ENV !== "development" && targetUserId !== "admin-master-id") {
        return { success: false, error: "Error al actualizar el teléfono en la base de datos" };
      }
    }

    // Si hay una sesión activa, re-emitimos la cookie para reflejar gymPhone actualizado en tiempo real
    if (sessionPayload) {
      await issueSessionCookies({
        ...sessionPayload,
        gymPhone: formattedPhone,
      });
    }

    return { success: true, updatedPhone: formattedPhone };
  } catch (error) {
    console.error("[updateGymPhoneAction] Error inesperado:", error);
    return { success: false, error: "Ocurrió un error inesperado al actualizar el teléfono" };
  }
}
