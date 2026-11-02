import { prisma } from "@/lib/prisma";
import { planWithDiscipline, sellablePlanOrder, sellablePlanWhere, toPlanOption } from "@/lib/plans";
import type { PlanOption } from "@/types";

/**
 * Planes que muestra la web pública: exactamente los que se venden en recepción
 * (activos, no borrados y de una disciplina activa). Sin datos de socios.
 */
export async function getPublicPlans(): Promise<PlanOption[]> {
  try {
    const plans = await prisma.plan.findMany({
      where: sellablePlanWhere,
      include: planWithDiscipline,
      orderBy: sellablePlanOrder,
    });
    return plans.map(toPlanOption);
  } catch (error) {
    console.error("[getPublicPlans] Error:", error);
    return [];
  }
}
