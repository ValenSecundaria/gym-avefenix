"use server";

import { prisma } from "@/lib/prisma";
import { getMemberPhotoUrl } from "@/lib/utils";
import { ensureDefaultPlansExist } from "@/actions/members.actions";
import { planWithDiscipline, sellablePlanOrder, sellablePlanWhere, toPlanOption } from "@/lib/plans";
import { ABSENT_DAYS_THRESHOLD } from "@/lib/constants";
import type {
  AbsentMemberItem,
  ActionResponse,
  DashboardStats,
  DebtorMemberItem,
  PlanOption,
} from "@/types";

export interface DashboardOverviewData {
  stats: DashboardStats;
  debtors: DebtorMemberItem[];
  absentMembers: AbsentMemberItem[];
  plans: PlanOption[];
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export async function getDashboardOverview(): Promise<ActionResponse<DashboardOverviewData>> {
  try {
    await ensureDefaultPlansExist();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [plansRaw, members, todayCheckIns, monthlyPaymentAgg] = await Promise.all([
      prisma.plan.findMany({ where: sellablePlanWhere, include: planWithDiscipline, orderBy: sellablePlanOrder }),
      prisma.member.findMany({
        where: { isActive: true },
        include: {
          memberships: { orderBy: { validUntil: "desc" }, take: 1, include: { plan: true } },
          checkIns: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { fullName: "asc" },
      }),
      prisma.checkIn.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfMonth } } }),
    ]);

    const plans: PlanOption[] = plansRaw.map(toPlanOption);

    const defaultPlan = plans[0];
    const debtors: DebtorMemberItem[] = [];
    const absentMembers: AbsentMemberItem[] = [];
    let activeMembersCount = 0;
    let expiringSoonCount = 0;

    for (const member of members) {
      const latestMembership = member.memberships[0];
      const lastCheckIn = member.checkIns[0];
      const photoUrl = getMemberPhotoUrl(member.dni, member.photoFilename);
      const isCurrent =
        latestMembership && latestMembership.status === "ACTIVA" && latestMembership.validUntil >= now;
      if (isCurrent) {
        activeMembersCount++;
        if (latestMembership.validUntil.getTime() - now.getTime() <= 7 * MS_PER_DAY) expiringSoonCount++;
      }

      // Ausente = dejó de venir (sin ingresos en ABSENT_DAYS_THRESHOLD días), tenga o no la cuota al día.
      // Un ausente no se lista como deudor: es para recuperar, no para cobrar en mostrador.
      const refDate = lastCheckIn ? lastCheckIn.createdAt : member.createdAt;
      const daysAbsent = Math.floor((now.getTime() - refDate.getTime()) / MS_PER_DAY);
      if (daysAbsent >= ABSENT_DAYS_THRESHOLD) {
        absentMembers.push({
          id: member.id,
          dni: member.dni,
          fullName: member.fullName,
          phone: member.phone,
          photoUrl,
          planName: latestMembership?.plan.name || "Sin plan",
          lastCheckInAt: lastCheckIn ? lastCheckIn.createdAt.toISOString() : null,
          daysAbsent,
        });
      } else if (!isCurrent) {
        const validUntilDate = latestMembership?.validUntil || null;
        const daysOverdue = validUntilDate
          ? Math.max(1, Math.floor((now.getTime() - validUntilDate.getTime()) / MS_PER_DAY))
          : 1;
        debtors.push({
          id: member.id,
          dni: member.dni,
          fullName: member.fullName,
          phone: member.phone,
          photoUrl,
          membershipId: latestMembership?.id || null,
          planId: latestMembership?.planId || defaultPlan?.id || null,
          planName: latestMembership?.plan.name || defaultPlan?.name || "Sin plan",
          planPrice: latestMembership ? Number(latestMembership.plan.price) : defaultPlan?.price || 0,
          validUntil: validUntilDate ? validUntilDate.toISOString() : null,
          daysOverdue,
        });
      }
    }

    debtors.sort((a, b) => b.daysOverdue - a.daysOverdue);
    absentMembers.sort((a, b) => b.daysAbsent - a.daysAbsent);

    const stats: DashboardStats = {
      todayCheckIns,
      activeMembers: activeMembersCount,
      debtorsCount: debtors.length,
      absentCount: absentMembers.length,
      expiringSoonCount,
      monthlyRevenue: Number(monthlyPaymentAgg._sum.amount || 0),
    };

    return { success: true, data: { stats, debtors, absentMembers, plans } };
  } catch (error) {
    console.error("[getDashboardOverview] Error:", error);
    return { success: false, error: "No se pudieron obtener las métricas del panel de administración" };
  }
}
