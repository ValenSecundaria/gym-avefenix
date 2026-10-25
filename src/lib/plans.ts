import type { Prisma } from "@prisma/client";
import type { PlanOption } from "@/types";

export const planWithDiscipline = { discipline: { select: { id: true, name: true } } } as const;

export type PlanWithDiscipline = Prisma.PlanGetPayload<{ include: typeof planWithDiscipline }>;

// Planes que se ofrecen en el alta y el cobro: activos y de una disciplina activa (o sin disciplina).
export const sellablePlanWhere: Prisma.PlanWhereInput = {
  isActive: true,
  OR: [{ disciplineId: null }, { discipline: { isActive: true } }],
};

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
