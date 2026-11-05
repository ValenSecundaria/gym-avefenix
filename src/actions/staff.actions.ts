"use server";

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasActionSession } from "@/lib/auth/require-session";
import type { ActionResponse, StaffMemberItem, StaffMembersPage, StaffMemberStatus } from "@/types";

// -------------------------------------------------------------
// LISTADO DE CLIENTES PARA LA CUENTA DE PROFESOR
// Solo nombre, DNI y estado de la cuota: nada de teléfonos, notas, fechas, montos ni historial.
// -------------------------------------------------------------

const NO_SESSION_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const PAGE_SIZE = 25;

const staffMembersSchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(["ALL", "AL_DIA", "VENCIDA", "SIN_PLAN"]).default("ALL"),
  page: z.number().int().min(1).max(10000).default(1),
});

function statusWhere(status: StaffMemberStatus | "ALL", now: Date): Prisma.MemberWhereInput {
  const current: Prisma.MembershipWhereInput = { status: "ACTIVA", validUntil: { gte: now } };
  if (status === "AL_DIA") return { memberships: { some: current } };
  if (status === "VENCIDA") return { memberships: { some: {}, none: current } };
  if (status === "SIN_PLAN") return { memberships: { none: {} } };
  return {};
}

function searchWhere(search: string | undefined): Prisma.MemberWhereInput {
  if (!search) return {};
  const digits = search.replace(/\D/g, "");
  return {
    OR: [
      { fullName: { contains: search, mode: "insensitive" } },
      ...(digits ? [{ dni: { contains: digits } }] : []),
    ],
  };
}

export async function getStaffMembersPage(
  input: { search?: string; status?: StaffMemberStatus | "ALL"; page?: number } = {}
): Promise<ActionResponse<StaffMembersPage>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const parsed = staffMembersSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Filtros inválidos" };
    const { search, status, page } = parsed.data;

    const now = new Date();
    const where: Prisma.MemberWhereInput = { isActive: true, ...statusWhere(status, now), ...searchWhere(search) };
    const total = await prisma.member.count({ where });
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, lastPage);

    const members = await prisma.member.findMany({
      where,
      select: {
        id: true,
        dni: true,
        fullName: true,
        memberships: {
          orderBy: { validUntil: "desc" },
          take: 1,
          select: { status: true, validUntil: true, planId: true, plan: { select: { isActive: true, deletedAt: true } } },
        },
      },
      orderBy: [{ fullName: "asc" }, { id: "asc" }],
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    const items: StaffMemberItem[] = members.map((m) => {
      const latest = m.memberships[0];
      const memberStatus: StaffMemberStatus = !latest
        ? "SIN_PLAN"
        : latest.status === "ACTIVA" && latest.validUntil >= now
          ? "AL_DIA"
          : "VENCIDA";
      // Plan sugerido para el cobro (solo si todavía se ofrece).
      const planStillSold = Boolean(latest && latest.plan.isActive && !latest.plan.deletedAt);
      return { id: m.id, dni: m.dni, fullName: m.fullName, status: memberStatus, planId: planStillSold ? latest.planId : null };
    });

    return { success: true, data: { items, total, page: safePage, pageSize: PAGE_SIZE } };
  } catch (error) {
    console.error("[getStaffMembersPage] Error:", error);
    return { success: false, error: "No se pudo cargar el listado de clientes" };
  }
}
