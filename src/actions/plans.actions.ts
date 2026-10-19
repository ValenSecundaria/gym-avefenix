"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasActionSession } from "@/lib/auth/require-session";
import { planWithDiscipline, sellablePlanWhere, toPlanOption } from "@/lib/plans";
import { ensureDefaultPlansExist } from "@/actions/members.actions";
import {
  disciplineSchema,
  planRulesFor,
  planSchema,
  type DisciplineInput,
  type PlanInput,
} from "@/lib/validations/plan.schema";
import type { ActionResponse, PlanCatalog } from "@/types";

// -------------------------------------------------------------
// ABM DE PLANES Y DISCIPLINAS
// Los planes no se borran si tienen membresías (el historial de pagos los referencia): se desactivan.
// -------------------------------------------------------------

const NO_SESSION_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const idSchema = z.string().trim().min(1).max(64);

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

export async function getPlanCatalog(): Promise<ActionResponse<PlanCatalog>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    await ensureDefaultPlansExist();
    const now = new Date();
    const [disciplines, plans, currentByPlan] = await Promise.all([
      prisma.discipline.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { plans: true } } } }),
      prisma.plan.findMany({
        include: { ...planWithDiscipline, _count: { select: { memberships: true } } },
        orderBy: [{ isActive: "desc" }, { price: "desc" }],
      }),
      prisma.membership.groupBy({
        by: ["planId"],
        where: { status: "ACTIVA", validUntil: { gte: now }, member: { isActive: true } },
        _count: { _all: true },
      }),
    ]);
    const currentCount = new Map(currentByPlan.map((r) => [r.planId, r._count._all]));

    return {
      success: true,
      data: {
        disciplines: disciplines.map((d) => ({ id: d.id, name: d.name, isActive: d.isActive, plansCount: d._count.plans })),
        plans: plans.map((p) => ({
          ...toPlanOption(p),
          isActive: p.isActive,
          membershipsCount: p._count.memberships,
          currentMembersCount: currentCount.get(p.id) ?? 0,
        })),
      },
    };
  } catch (error) {
    console.error("[getPlanCatalog] Error:", error);
    return { success: false, error: "No se pudieron cargar los planes" };
  }
}

export async function savePlan(input: PlanInput): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const parsed = planSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Datos del plan inválidos" };
    const { id, name, disciplineId, category, allowedDaysPerWeek, price } = parsed.data;

    const discipline = await prisma.discipline.findUnique({ where: { id: disciplineId }, select: { id: true } });
    if (!discipline) return { success: false, error: "La disciplina elegida ya no existe" };

    // El cambio de precio o de tipo rige para los próximos cobros; las membresías ya pagadas no cambian.
    const data = { name, disciplineId, category, price, ...planRulesFor(category, allowedDaysPerWeek) };
    if (id) {
      const exists = await prisma.plan.findUnique({ where: { id }, select: { id: true } });
      if (!exists) return { success: false, error: "El plan ya no existe" };
      await prisma.plan.update({ where: { id }, data });
    } else {
      await prisma.plan.create({ data: { ...data, isActive: true } });
    }

    revalidatePath("/admin");
    return { success: true, data: { name } };
  } catch (error) {
    console.error("[savePlan] Error:", error);
    return { success: false, error: "No se pudo guardar el plan" };
  }
}

export async function setPlanActive(planId: string, isActive: boolean): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = idSchema.safeParse(planId);
    if (!id.success || typeof isActive !== "boolean") return { success: false, error: "Plan inválido" };

    if (!isActive) {
      const remaining = await prisma.plan.count({ where: { ...sellablePlanWhere, id: { not: id.data } } });
      if (remaining === 0) return { success: false, error: "Tiene que quedar al menos un plan activo para poder dar altas" };
    }
    const plan = await prisma.plan.update({ where: { id: id.data }, data: { isActive }, select: { name: true } });
    revalidatePath("/admin");
    return { success: true, data: plan };
  } catch (error) {
    console.error("[setPlanActive] Error:", error);
    return { success: false, error: "No se pudo actualizar el plan" };
  }
}

export async function deletePlan(planId: string): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = idSchema.safeParse(planId);
    if (!id.success) return { success: false, error: "Plan inválido" };

    const plan = await prisma.plan.findUnique({
      where: { id: id.data },
      select: { name: true, isActive: true, _count: { select: { memberships: true } } },
    });
    if (!plan) return { success: false, error: "El plan ya no existe" };
    if (plan._count.memberships > 0) {
      return { success: false, error: `${plan.name} ya se usó en ${plan._count.memberships} cobros: desactivalo en lugar de borrarlo` };
    }
    if (plan.isActive) {
      const remaining = await prisma.plan.count({ where: { ...sellablePlanWhere, id: { not: id.data } } });
      if (remaining === 0) return { success: false, error: "Tiene que quedar al menos un plan activo para poder dar altas" };
    }
    await prisma.plan.delete({ where: { id: id.data } });
    revalidatePath("/admin");
    return { success: true, data: { name: plan.name } };
  } catch (error) {
    console.error("[deletePlan] Error:", error);
    return { success: false, error: "No se pudo borrar el plan" };
  }
}

export async function saveDiscipline(input: DisciplineInput): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const parsed = disciplineSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Disciplina inválida" };
    const { id, name } = parsed.data;

    const sameName = await prisma.discipline.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, ...(id ? { id: { not: id } } : {}) },
      select: { id: true },
    });
    if (sameName) return { success: false, error: `Ya existe la disciplina ${name}` };

    try {
      if (id) await prisma.discipline.update({ where: { id }, data: { name } });
      else await prisma.discipline.create({ data: { name } });
    } catch (error) {
      if (isUniqueConstraintError(error)) return { success: false, error: `Ya existe la disciplina ${name}` };
      throw error;
    }
    revalidatePath("/admin");
    return { success: true, data: { name } };
  } catch (error) {
    console.error("[saveDiscipline] Error:", error);
    return { success: false, error: "No se pudo guardar la disciplina" };
  }
}

export async function setDisciplineActive(
  disciplineId: string,
  isActive: boolean
): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasActionSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = idSchema.safeParse(disciplineId);
    if (!id.success || typeof isActive !== "boolean") return { success: false, error: "Disciplina inválida" };

    // Al desactivarla, sus planes dejan de ofrecerse; no puede quedar el gimnasio sin planes a la venta.
    if (!isActive) {
      const remaining = await prisma.plan.count({
        where: { isActive: true, OR: [{ disciplineId: null }, { discipline: { isActive: true, id: { not: id.data } } }] },
      });
      if (remaining === 0) return { success: false, error: "Tiene que quedar al menos un plan activo para poder dar altas" };
    }
    const discipline = await prisma.discipline.update({ where: { id: id.data }, data: { isActive }, select: { name: true } });
    revalidatePath("/admin");
    return { success: true, data: discipline };
  } catch (error) {
    console.error("[setDisciplineActive] Error:", error);
    return { success: false, error: "No se pudo actualizar la disciplina" };
  }
}
