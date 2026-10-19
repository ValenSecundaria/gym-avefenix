"use client";

import React, { useEffect } from "react";
import { Activity, AlertOctagon, BarChart3, PanelLeftClose, PanelLeftOpen, UserMinus, Users, X } from "lucide-react";
import type { AdminTab } from "./AdminDashboardClient";
import { LogoutButton } from "./logout-button";

export const ADMIN_SECTIONS: {
  tab: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: "default" | "danger" | "warning" | null;
}[] = [
  { tab: "LIVE_FEED", label: "Ingresos de hoy", icon: Activity, badge: "default" },
  { tab: "DEBTORS", label: "Cuotas pendientes", icon: AlertOctagon, badge: "danger" },
  { tab: "ABSENT", label: "Socios ausentes", icon: UserMinus, badge: "warning" },
  { tab: "MEMBERS", label: "Socios", icon: Users, badge: null },
  { tab: "METRICS", label: "Métricas", icon: BarChart3, badge: null },
];

const BADGE_CLS = {
  default: "bg-fx-text/10 text-fx-text",
  danger: "bg-fx-red/15 text-fx-red",
  warning: "bg-fx-amber/15 text-fx-amber",
};

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  counts: Partial<Record<AdminTab, number>>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function NavList({
  activeTab,
  onSelect,
  counts,
  collapsed,
}: Pick<AdminSidebarProps, "activeTab" | "onSelect" | "counts" | "collapsed">) {
  return (
    <nav aria-label="Secciones del panel">
      <ul className="flex flex-col gap-1.5">
        {ADMIN_SECTIONS.map(({ tab, label, icon: Icon, badge }) => {
          const active = activeTab === tab;
          const count = counts[tab];
          return (
            <li key={tab}>
              <button
                type="button"
                onClick={() => onSelect(tab)}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`relative w-full min-h-[48px] rounded-xl flex items-center gap-3 text-sm font-bold transition-colors cursor-pointer ${
                  collapsed ? "justify-center px-0" : "px-3.5"
                } ${active ? "bg-fx-orange text-white" : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="flex-1 text-left">{label}</span>}
                {badge && count !== undefined && (
                  <span
                    className={`font-mono text-xs rounded-full ${
                      collapsed ? "absolute top-1 right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] flex items-center justify-center" : "px-2 py-0.5"
                    } ${active ? "bg-black/25 text-white" : BADGE_CLS[badge]}`}
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
  );
}

export function AdminSidebar({
  activeTab,
  onSelect,
  counts,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseMobile();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* Escritorio: barra fija a la izquierda */}
      <aside
        className={`hidden lg:flex sticky top-0 h-screen shrink-0 flex-col gap-4 border-r border-fx-border bg-fx-surface p-3 transition-[width] duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir menú" : "Achicar menú"}
          title={collapsed ? "Expandir menú" : "Achicar menú"}
          className={`min-h-[44px] rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-fx-muted hover:text-fx-text hover:bg-fx-hover transition-colors cursor-pointer ${
            collapsed ? "justify-center" : "px-3.5"
          }`}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          {!collapsed && <span>Menú</span>}
        </button>
        <NavList activeTab={activeTab} onSelect={onSelect} counts={counts} collapsed={collapsed} />
        <div className="mt-auto pt-3 border-t border-fx-border">
          <LogoutButton collapsed={collapsed} />
        </div>
      </aside>

      {/* Celular / tablet: menú desplegable */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <button type="button" aria-label="Cerrar menú" onClick={onCloseMobile} className="absolute inset-0 bg-black/50 cursor-default" />
          <aside className="relative w-72 max-w-[85vw] h-full bg-fx-surface border-r border-fx-border p-3 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between px-2 min-h-[44px]">
              <span className="text-xs font-bold uppercase tracking-wider text-fx-muted">Menú</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Cerrar menú"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-fx-muted hover:text-fx-text hover:bg-fx-hover cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavList activeTab={activeTab} onSelect={(tab) => { onSelect(tab); onCloseMobile(); }} counts={counts} collapsed={false} />
            <div className="mt-auto pt-3 border-t border-fx-border">
              <LogoutButton onLogoutStart={onCloseMobile} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
