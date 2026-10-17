import React, { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getDashboardOverview } from "@/actions/dashboard.actions";
import { getTodayCheckIns } from "@/actions/checkin.actions";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Panel de Recepción | Gimnasio Ave Fénix",
  description: "Dashboard operativo de administración, ingresos en vivo y cobro de cuotas.",
};

async function AdminDashboardLoader() {
  await connection();
  const [overviewRes, checkInsRes] = await Promise.all([
    getDashboardOverview(),
    getTodayCheckIns(),
  ]);

  const overview = overviewRes.data || {
    stats: {
      todayCheckIns: 0,
      activeMembers: 0,
      debtorsCount: 0,
      absentCount: 0,
      monthlyRevenue: 0,
    },
    debtors: [],
    absentMembers: [],
    plans: [],
  };

  const todayCheckIns = checkInsRes.data || [];

  return (
    <AdminDashboardClient
      initialStats={overview.stats}
      initialCheckIns={todayCheckIns}
      initialDebtors={overview.debtors}
      initialAbsent={overview.absentMembers}
      plans={overview.plans}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full border-2 border-[#F95716] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-[#8A909A]">Cargando panel de recepción Ave Fénix...</p>
          </div>
        </div>
      }
    >
      <AdminDashboardLoader />
    </Suspense>
  );
}
