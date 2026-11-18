"use client";

import React, { useEffect, useRef } from "react";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
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
  { tab: "PAYMENTS", label: "Pagos", short: "Pagos", icon: CreditCard, badge: null, desktopOnly: true },
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
  const itemRefs = useRef<Partial<Record<AdminTab, HTMLButtonElement | null>>>({});

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseMobile();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  useEffect(() => {
    itemRefs.current[activeTab]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  const stepCircular = (delta: -1 | 1) => {
    const idx = ADMIN_SECTIONS.findIndex((s) => s.tab === activeTab);
    const current = idx === -1 ? 0 : idx;
    const nextIdx = (current + delta + ADMIN_SECTIONS.length) % ADMIN_SECTIONS.length;
    onSelect(ADMIN_SECTIONS[nextIdx].tab);
  };

  return (
    <>
      {/* Escritorio: carrusel circular en una sola fila con flechas laterales */}
      <header className="hidden lg:block sticky top-0 z-30 bg-fx-surface border-b-2 border-fx-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => stepCircular(-1)}
            aria-label="Módulo anterior"
            title="Módulo anterior"
            className="min-h-[48px] w-11 shrink-0 rounded-md border border-fx-border bg-fx-base hover:border-fx-orange text-fx-text flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <nav aria-label="Secciones del panel" className="flex-1 min-w-0">
            <ul className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {ADMIN_SECTIONS.map(({ tab, label, icon: Icon, badge }) => {
                const active = activeTab === tab;
                const count = counts[tab];
                return (
                  <li key={tab} className="shrink-0">
                    <button
                      ref={(el) => { itemRefs.current[tab] = el; }}
                      type="button"
                      onClick={() => onSelect(tab)}
                      aria-current={active ? "page" : undefined}
                      className={`min-h-[48px] px-3.5 rounded-md flex items-center gap-2 text-sm font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                        active
                          ? "bg-fx-orange text-white shadow-sm"
                          : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
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

          <button
            type="button"
            onClick={() => stepCircular(1)}
            aria-label="Siguiente módulo"
            title="Siguiente módulo"
            className="min-h-[48px] w-11 shrink-0 rounded-md border border-fx-border bg-fx-base hover:border-fx-orange text-fx-text flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="shrink-0 pl-2.5 border-l border-fx-border">
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
