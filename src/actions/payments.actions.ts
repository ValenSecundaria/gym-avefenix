"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createPaymentSchema,
  type CreatePaymentInput,
} from "@/lib/validations/payment.schema";
import type { ActionResponse, PaymentMethodType } from "@/types";

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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export async function registerPayment(
  input: CreatePaymentInput
): Promise<ActionResponse<PaymentRegistrationResult>> {
  try {
    const parsed = createPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de pago inválidos",
      };
    }

    const { memberId, planId, amount, method, notes } = parsed.data;

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
      prisma.plan.findUnique({
        where: { id: planId },
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
        error: "El plan seleccionado no existe",
      };
    }

    const now = new Date();
    const currentMembership = member.memberships[0];
    const baseDate =
      currentMembership && currentMembership.validUntil > now
        ? currentMembership.validUntil
        : now;
    const nextValidUntil = new Date(
      baseDate.getTime() + plan.durationDays * MS_PER_DAY
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
