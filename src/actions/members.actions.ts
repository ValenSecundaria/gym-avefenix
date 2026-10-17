"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveMemberPhotoToDisk } from "@/lib/photo-storage";
import { getMemberPhotoUrl } from "@/lib/utils";
import { createMemberSchema, type CreateMemberInput } from "@/lib/validations/member.schema";
import type { ActionResponse, MemberListItem, MembershipStatusType, PlanOption } from "@/types";

export async function ensureDefaultPlansExist(): Promise<void> {
  const count = await prisma.plan.count();
  if (count > 0) return;
  await prisma.plan.createMany({
    data: [
      { name: "Pase Libre Mensual", category: "MENSUAL_LIBRE", allowedDaysPerWeek: null, durationDays: 30, price: 18500, isActive: true },
      { name: "Plan 3 Días por Semana", category: "MENSUAL_DIAS", allowedDaysPerWeek: 3, durationDays: 30, price: 14500, isActive: true },
      { name: "Pase Diario", category: "DIARIO", allowedDaysPerWeek: 1, durationDays: 1, price: 3500, isActive: true },
    ],
  });
}

export async function getPlans(): Promise<ActionResponse<PlanOption[]>> {
  try {
    await ensureDefaultPlansExist();
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "desc" },
    });
    return {
      success: true,
      data: plans.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        allowedDaysPerWeek: p.allowedDaysPerWeek,
        durationDays: p.durationDays,
        price: Number(p.price),
      })),
    };
  } catch (error) {
    console.error("[getPlans] Error:", error);
    return { success: false, error: "No se pudieron obtener los planes del gimnasio" };
  }
}

export async function createMember(
  input: CreateMemberInput
): Promise<ActionResponse<MemberListItem>> {
  try {
    const parsed = createMemberSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Datos del socio inválidos" };
    }

    const { fullName, dni, phone, planId, paymentMethod, photoBase64, notes } = parsed.data;
    const existing = await prisma.member.findUnique({ where: { dni } });
    if (existing) return { success: false, error: `Ya existe un socio registrado con el DNI ${dni}` };

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return { success: false, error: "El plan seleccionado no existe" };

    let photoFilename: string | null = null;
    if (photoBase64 && photoBase64.trim().length > 0) {
      photoFilename = await saveMemberPhotoToDisk(dni, photoBase64);
    }

    const startDate = new Date();
    const validUntil = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const created = await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: { dni, fullName, phone: phone || null, photoFilename, notes: notes || null, isActive: true },
      });
      const membership = await tx.membership.create({
        data: { memberId: member.id, planId: plan.id, startDate, validUntil, status: "ACTIVA" },
      });
      await tx.payment.create({
        data: {
          memberId: member.id,
          membershipId: membership.id,
          amount: plan.price,
          method: paymentMethod,
          notes: notes || `Alta inicial - ${plan.name}`,
        },
      });
      return { member, membership };
    });

    revalidatePath("/admin");
    return {
      success: true,
      data: {
        id: created.member.id,
        dni: created.member.dni,
        fullName: created.member.fullName,
        phone: created.member.phone,
        photoFilename: created.member.photoFilename,
        photoUrl: getMemberPhotoUrl(created.member.dni, created.member.photoFilename),
        isActive: created.member.isActive,
        planName: plan.name,
        membershipStatus: "ACTIVA",
        validUntil: created.membership.validUntil.toISOString(),
      },
    };
  } catch (error) {
    console.error("[createMember] Error:", error);
    return { success: false, error: "No se pudo registrar el socio. Verifique los datos e intente nuevamente." };
  }
}

export async function getMembers(search?: string): Promise<ActionResponse<MemberListItem[]>> {
  try {
    const cleanSearch = search?.trim();
    const members = await prisma.member.findMany({
      where: cleanSearch
        ? { OR: [{ fullName: { contains: cleanSearch, mode: "insensitive" } }, { dni: { contains: cleanSearch } }] }
        : undefined,
      include: { memberships: { orderBy: { validUntil: "desc" }, take: 1, include: { plan: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const now = new Date();
    const data: MemberListItem[] = members.map((m) => {
      const latest = m.memberships[0];
      const status: MembershipStatusType | "SIN_MEMBRESIA" = latest
        ? latest.status === "ACTIVA" && latest.validUntil >= now ? "ACTIVA" : "VENCIDA"
        : "SIN_MEMBRESIA";
      return {
        id: m.id,
        dni: m.dni,
        fullName: m.fullName,
        phone: m.phone,
        photoFilename: m.photoFilename,
        photoUrl: getMemberPhotoUrl(m.dni, m.photoFilename),
        isActive: m.isActive,
        planName: latest?.plan.name || "Sin plan",
        membershipStatus: status,
        validUntil: latest ? latest.validUntil.toISOString() : null,
      };
    });
    return { success: true, data };
  } catch (error) {
    console.error("[getMembers] Error:", error);
    return { success: false, error: "No se pudo cargar el listado de socios" };
  }
}
