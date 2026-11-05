import type { Prisma } from "@prisma/client";
import type { PlanOption } from "@/types";

export const planWithDiscipline = { discipline: { select: { id: true, name: true } } } as const;

export type PlanWithDiscipline = Prisma.PlanGetPayload<{ include: typeof planWithDiscipline }>;

// Planes que se ofrecen en el alta, el cobro y la web: activos, no borrados y de una disciplina activa (o sin disciplina).
export const sellablePlanWhere: Prisma.PlanWhereInput = {
  isActive: true,
  deletedAt: null,
  OR: [{ disciplineId: null }, { discipline: { isActive: true } }],
};

// Membresía de un socio activo con la cuota al día (lo que cuenta como "socio activo del plan").
export function currentMembershipWhere(now: Date): Prisma.MembershipWhereInput {
  return { status: "ACTIVA", validUntil: { gte: now }, member: { isActive: true } };
}

export const sellablePlanOrder: Prisma.PlanOrderByWithRelationInput[] = [
  { discipline: { name: "asc" } },
  { price: "desc" },
];

export function toPlanOption(p: PlanWithDiscipline): PlanOption {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    allowedDaysPerWeek: p.allowedDaysPerWeek,
    durationDays: p.durationDays,
    price: Number(p.price),
    disciplineId: p.discipline?.id ?? null,
    disciplineName: p.discipline?.name ?? null,
  };
}
