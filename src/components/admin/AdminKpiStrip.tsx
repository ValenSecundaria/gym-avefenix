import React from "react";
import { AlertTriangle, DoorOpen, Users, UserX } from "lucide-react";
import type { DashboardStats } from "@/types";
import type { AdminTab } from "./AdminDashboardClient";
import { ABSENT_DAYS_THRESHOLD } from "@/lib/constants";
import { KpiCard } from "./KpiCard";

interface AdminKpiStripProps {
  stats: DashboardStats;
  activeTab: AdminTab;
  onGoToTab: (tab: AdminTab) => void;
}

export function AdminKpiStrip({ stats, activeTab, onGoToTab }: AdminKpiStripProps) {
  return (
    <section
      aria-label="Indicadores operativos de recepción"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
    >
      <KpiCard
        code="01"
        label="Entraron hoy"
        value={stats.todayCheckIns}
        unit="socios"
        hint="Ingresos en vivo"
        icon={DoorOpen}
        tone="orange"
        active={activeTab === "LIVE_FEED"}
        onClick={() => onGoToTab("LIVE_FEED")}
      />
      <KpiCard
        code="02"
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
        code="03"
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
        code="04"
        label={`Ausentes (+${ABSENT_DAYS_THRESHOLD}d)`}
        value={stats.absentCount}
        unit="personas"
        hint="Reactivar socio"
        icon={UserX}
        tone="amber"
        active={activeTab === "ABSENT"}
        onClick={() => onGoToTab("ABSENT")}
      />
    </section>
  );
}
