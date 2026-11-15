"use client";

import React, { useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Clock,
  Settings,
  Tags,
  UserMinus,
  Users,
} from "lucide-react";
import type { AdminTab } from "./AdminDashboardClient";
import { AdminMobileNav } from "./AdminMobileNav";
import { LogoutButton } from "./logout-button";

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
      {/* Escritorio: barra de navegación horizontal superior */}
      <header className="hidden lg:block sticky top-0 z-30 bg-fx-surface border-b-2 border-fx-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <nav aria-label="Secciones del panel" className="flex-1 min-w-0">
            <ul className="flex flex-wrap items-center gap-1.5">
              {ADMIN_SECTIONS.map(({ tab, label, icon: Icon, badge }) => {
                const active = activeTab === tab;
                const count = counts[tab];
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => onSelect(tab)}
                      aria-current={active ? "page" : undefined}
                      className={`min-h-[48px] px-3.5 rounded-md flex items-center gap-2 text-sm font-extrabold transition-colors cursor-pointer ${
                        active
                          ? "bg-fx-orange text-white shadow-sm"
                          : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{label}</span>
                      {badge && count !== undefined && count > 0 && (
                        <span
                          className={`font-mono font-bold rounded-sm px-1.5 py-0.5 text-xs ${
                            active ? "bg-black/25 text-white" : BADGE_CLS[badge]
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

          <div className="shrink-0 pl-3 border-l border-fx-border">
            <LogoutButton collapsed={false} />
          </div>
        </div>
      </header>

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
