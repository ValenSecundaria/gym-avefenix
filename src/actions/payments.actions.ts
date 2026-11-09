"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sellablePlanWhere } from "@/lib/plans";
import { computeQuickRenewal, computeRenewal, QUICK_RENEWAL_DAYS } from "@/lib/membership-renewal";
import { getActionSession } from "@/lib/auth/require-session";
import { fetchSingleMemberAction } from "@/actions/sync.actions";
import {
  createPaymentSchema,
  quickRenewalSchema,
  type CreatePaymentInput,
  type QuickRenewalInput,
} from "@/lib/validations/payment.schema";
import type { ActionResponse, CachedMember, PaymentMethodType } from "@/types";

export interface PaymentRegistrationResult {
  paymentId: string;
  membershipId: string;
  memberId: string;
  planName: string;
  amount: number;
  method: PaymentMethodType;
  validUntil: string;
  paidAt: string;
}


export async function registerPayment(
  input: CreatePaymentInput
): Promise<ActionResponse<PaymentRegistrationResult>> {
  try {
    const session = await getActionSession();
    if (!session) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." };

    const parsed = createPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de pago inválidos",
      };
    }

    const { memberId, planId, method, notes } = parsed.data;

    const [member, plan] = await Promise.all([
      prisma.member.findUnique({
        where: { id: memberId },
        include: {
          memberships: {
            orderBy: { validUntil: "desc" },
            take: 1,
          },
        },
      }),
      prisma.plan.findFirst({
        where: { id: planId, ...sellablePlanWhere },
      }),
    ]);

    if (!member) {
      return {
        success: false,
        error: "El socio indicado no existe en la base de datos",
      };
    }

    if (!plan) {
      return {
        success: false,
        error: "El plan seleccionado no existe o ya no está disponible",
      };
    }

    // La cuenta de profesor no ve ni elige montos: se cobra el precio del plan.
    const amount = session.role === "ADMIN" && parsed.data.amount ? parsed.data.amount : Number(plan.price);

    const now = new Date();
    const currentMembership = member.memberships[0];
    const { validUntil: nextValidUntil } = computeRenewal(
      currentMembership?.validUntil ?? null,
      now,
      plan.durationDays
    );

    const result = await prisma.$transaction(async (tx) => {
      const membership = currentMembership
        ? await tx.membership.update({
            where: { id: currentMembership.id },
            data: {
              planId: plan.id,
              status: "ACTIVA",
              validUntil: nextValidUntil,
            },
          })
        : await tx.membership.create({
            data: {
              memberId: member.id,
              planId: plan.id,
              startDate: now,
              validUntil: nextValidUntil,
              status: "ACTIVA",
            },
          });

      const payment = await tx.payment.create({
        data: {
          memberId: member.id,
          membershipId: membership.id,
          amount,
          method,
          notes: notes || `Renovación - ${plan.name}`,
          paidAt: now,
          registeredById: session.id,
          registeredByName: session.name,
        },
      });

      return { membership, payment };
    });

    revalidatePath("/admin");

    return {
      success: true,
      data: {
        paymentId: result.payment.id,
        membershipId: result.membership.id,
        memberId: member.id,
        planName: plan.name,
        amount: Number(result.payment.amount),
        method: result.payment.method,
        validUntil: result.membership.validUntil.toISOString(),
        paidAt: result.payment.paidAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[registerPayment] Error:", error);
    return {
      success: false,
      error: "No se pudo registrar el cobro. Intente nuevamente.",
    };
  }
}

export interface QuickRenewalResult extends PaymentRegistrationResult {
  /** Socio tal como lo guarda la caché del molinete (null si no se pudo armar). */
  cached: CachedMember | null;
}

/**
 * Renovación rápida (+30 días desde hoy) para regularizar los desfasajes de la carga inicial.
 * Deja la membresía ACTIVA hasta hoy + 30 días (aunque antes venciera más adelante), reactiva al
 * socio si estaba dado de baja y asienta el cobro en el historial de pagos.
 */
export async function quickRenewMembership(
  input: QuickRenewalInput
): Promise<ActionResponse<QuickRenewalResult>> {
  try {
    const session = await getActionSession();
    if (!session) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." };
    if (session.role !== "ADMIN") return { success: false, error: "Solo la administración puede renovar cuotas." };

    const parsed = quickRenewalSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Datos de renovación inválidos" };
    }
    const { memberId, method } = parsed.data;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { memberships: { orderBy: { validUntil: "desc" }, take: 1 } },
    });
    if (!member) return { success: false, error: "El socio indicado no existe en la base de datos" };

    const currentMembership = member.memberships[0];
    const planId = parsed.data.planId ?? currentMembership?.planId;
    if (!planId) return { success: false, error: "El socio no tiene plan: elegí uno para renovar." };

    const plan = await prisma.plan.findFirst({ where: { id: planId, ...sellablePlanWhere } });
    if (!plan) {
      return { success: false, error: "El plan ya no está a la venta: elegí otro plan para renovar." };
    }

    const amount = parsed.data.amount ?? Number(plan.price);
    const now = new Date();
    const { validUntil } = computeQuickRenewal(currentMembership?.validUntil ?? null, now);

    const result = await prisma.$transaction(async (tx) => {
      const membership = currentMembership
        ? await tx.membership.update({
            where: { id: currentMembership.id },
            data: { planId: plan.id, status: "ACTIVA", startDate: now, validUntil },
          })
        : await tx.membership.create({
            data: { memberId: member.id, planId: plan.id, startDate: now, validUntil, status: "ACTIVA" },
          });

      if (!member.isActive) {
        await tx.member.update({ where: { id: member.id }, data: { isActive: true } });
      }

      const payment = await tx.payment.create({
        data: {
          memberId: member.id,
          membershipId: membership.id,
          amount,
          method,
          notes: `Renovación rápida (+${QUICK_RENEWAL_DAYS} días) - ${plan.name}`,
          paidAt: now,
          registeredById: session.id,
          registeredByName: session.name,
        },
      });

      return { membership, payment };
    });

    // Foto actualizada del socio para la caché local del molinete (incluye los ingresos de la semana).
    const cachedRes = await fetchSingleMemberAction(member.dni);

    revalidatePath("/admin");

    return {
      success: true,
      data: {
        paymentId: result.payment.id,
        membershipId: result.membership.id,
        memberId: member.id,
        planName: plan.name,
        amount: Number(result.payment.amount),
        method: result.payment.method,
        validUntil: result.membership.validUntil.toISOString(),
        paidAt: result.payment.paidAt.toISOString(),
        cached: cachedRes.success && cachedRes.data ? cachedRes.data : null,
      },
    };
  } catch (error) {
    console.error("[quickRenewMembership] Error:", error);
    return { success: false, error: "No se pudo renovar la cuota. Intente nuevamente." };
  }
}
