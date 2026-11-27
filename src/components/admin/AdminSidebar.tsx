"use client";

import React, { useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Clock,
  CreditCard,
  Settings,
  Tags,
  UserMinus,
  Users,
} from "lucide-react";
import type { AdminTab } from "./AdminDashboardClient";
import { AdminMobileNav } from "./AdminMobileNav";

export const ADMIN_SECTIONS: {
  tab: AdminTab;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: "default" | "danger" | "warning" | null;
  desktopOnly?: boolean;
}[] = [
  { tab: "LIVE_FEED", label: "Ingresos de hoy", short: "Ingresos", icon: Activity, badge: "default" },
  { tab: "DEBTORS", label: "Cuotas pendientes", short: "Deben", icon: AlertOctagon, badge: "danger" },
  { tab: "PAYMENTS", label: "Pagos y Planes", short: "Pagos", icon: CreditCard, badge: null, desktopOnly: true },
  { tab: "ABSENT", label: "Socios ausentes", short: "Ausentes", icon: UserMinus, badge: "warning" },
  { tab: "MEMBERS", label: "Clientes", short: "Clientes", icon: Users, badge: null },
  { tab: "PLANS", label: "Planes", short: "Planes", icon: Tags, badge: null },
  { tab: "TEACHER_ATTENDANCE", label: "Asistencia Profes", short: "Asistencia", icon: Clock, badge: null },
  { tab: "METRICS", label: "Métricas", short: "Métricas", icon: BarChart3, badge: null, desktopOnly: true },
  { tab: "SETTINGS", label: "Configuración", short: "Ajustes", icon: Settings, badge: null },
];

export const MOBILE_BAR_TABS: AdminTab[] = ["LIVE_FEED", "DEBTORS", "MEMBERS"];

export const BADGE_CLS = {
  default: "bg-fx-text/10 text-fx-text",
  danger: "bg-fx-red text-white",
  warning: "bg-fx-amber/20 text-fx-amber",
};

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  counts: Partial<Record<AdminTab, number>>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
  onOpenNewMember: () => void;
  canCreateMember: boolean;
}

export function AdminSidebar({
  activeTab,
  onSelect,
  counts,
  mobileOpen,
  onOpenMobile,
  onCloseMobile,
  onOpenNewMember,
  canCreateMember,
}: AdminSidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseMobile();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      <nav
        aria-label="Módulos del panel de administración"
        className="hidden lg:block rounded-lg bg-fx-surface border border-fx-border p-1.5"
      >
        <ul className="flex flex-wrap items-center gap-1">
          {ADMIN_SECTIONS.map(({ tab, label, icon: Icon, badge }) => {
            const active = activeTab === tab;
            const count = counts[tab];
            return (
              <li key={tab}>
                <button
                  type="button"
                  onClick={() => onSelect(tab)}
                  aria-current={active ? "page" : undefined}
                  className={`min-h-[48px] px-3.5 rounded-md inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                    active
                      ? "bg-fx-orange text-[#0A0B0D] shadow-sm"
                      : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {badge && count !== undefined && count > 0 && (
                    <span
                      className={`font-mono font-bold rounded-sm px-1.5 py-0.5 text-xs ${
                        active ? "bg-[#0A0B0D] text-[#EAB308]" : BADGE_CLS[badge]
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <AdminMobileNav
        activeTab={activeTab}
        onSelect={onSelect}
        counts={counts}
        mobileOpen={mobileOpen}
        onOpenMobile={onOpenMobile}
        onCloseMobile={onCloseMobile}
        onOpenNewMember={onOpenNewMember}
        canCreateMember={canCreateMember}
      />
    </>
  );
}
