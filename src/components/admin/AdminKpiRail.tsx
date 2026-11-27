import React from "react";
import { AlertTriangle, DoorOpen, Users, UserX } from "lucide-react";
import type { DashboardStats } from "@/types";
import type { AdminTab } from "./AdminDashboardClient";
import { ABSENT_DAYS_THRESHOLD } from "@/lib/constants";
import { KpiCard } from "./KpiCard";

interface AdminKpiRailProps {
  stats: DashboardStats;
  activeTab: AdminTab;
  onGoToTab: (tab: AdminTab) => void;
}

export function AdminKpiRail({ stats, activeTab, onGoToTab }: AdminKpiRailProps) {
  return (
    <aside
      aria-label="Resumen operativo rápido"
      className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-1 gap-3.5"
    >
      <KpiCard
        label="Entraron hoy"
        value={stats.todayCheckIns}
        unit="socios"
        hint="Ver ingresos en vivo"
        icon={DoorOpen}
        tone="orange"
        active={activeTab === "LIVE_FEED"}
        onClick={() => onGoToTab("LIVE_FEED")}
      />
      <KpiCard
        label="Cuota al día"
        value={stats.activeMembers}
        unit="activos"
        hint="Padrón de clientes"
        icon={Users}
        tone="neutral"
        active={activeTab === "MEMBERS"}
        onClick={() => onGoToTab("MEMBERS")}
      />
      <KpiCard
        label="Deben la cuota"
        value={stats.debtorsCount}
        unit="personas"
        hint="Cobrar o avisar"
        icon={AlertTriangle}
        tone="red"
        active={activeTab === "DEBTORS"}
        onClick={() => onGoToTab("DEBTORS")}
      />
      <KpiCard
        label={`Ausentes (+${ABSENT_DAYS_THRESHOLD}d)`}
        value={stats.absentCount}
        unit="personas"
        hint="Reactivar por WhatsApp"
        icon={UserX}
        tone="amber"
        active={activeTab === "ABSENT"}
        onClick={() => onGoToTab("ABSENT")}
      />
    </aside>
  );
}
