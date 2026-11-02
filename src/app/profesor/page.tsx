import React, { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ADMIN_THEME_COOKIE } from "@/lib/constants";
import { ADMIN_HOME, SESSION_COOKIE_NAME, roleOf } from "@/lib/auth/auth-constants";
import { verifySessionToken } from "@/lib/auth/session-token";
import { getStaffOverview } from "@/actions/dashboard.actions";
import { ProfessorDashboardClient } from "@/components/profesor/ProfessorDashboardClient";

export const metadata: Metadata = {
  title: "Panel de Profesores | Gimnasio Ave Fénix",
  description: "Alta de socios, registro de cobros, estado de clientes y métricas de asistencia.",
};

async function ProfessorDashboardLoader() {
  await connection();
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  if (roleOf(session) !== "PROFESOR") redirect(ADMIN_HOME);

  const initialTheme = cookieStore.get(ADMIN_THEME_COOKIE)?.value === "light" ? "light" : "dark";
  const overviewRes = await getStaffOverview();
  const overview = overviewRes.data || {
    stats: {
      todayCheckIns: 0,
      activeMembers: 0,
      debtorsCount: 0,
      absentCount: 0,
      expiringSoonCount: 0,
      monthlyRevenue: 0,
    },
    plans: [],
  };

  return (
    <ProfessorDashboardClient
      initialStats={overview.stats}
      initialPlans={overview.plans}
      initialTheme={initialTheme}
      professorName={session.name}
    />
  );
}

export default function ProfessorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full border-2 border-[#F95716] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-[#8A909A]">Cargando panel de profesores...</p>
          </div>
        </div>
      }
    >
      <ProfessorDashboardLoader />
    </Suspense>
  );
}
