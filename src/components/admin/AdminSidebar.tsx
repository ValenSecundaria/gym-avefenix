"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Tags,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { AdminTab } from "./AdminDashboardClient";
import { LogoutButton } from "./logout-button";

export const ADMIN_SECTIONS: {
  tab: AdminTab;
  label: string;
  /** Nombre corto para la barra inferior del celular. */
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: "default" | "danger" | "warning" | null;
  /** Secciones que en celular no se ven bien y se ocultan. */
  desktopOnly?: boolean;
}[] = [
  { tab: "LIVE_FEED", label: "Ingresos de hoy", short: "Ingresos", icon: Activity, badge: "default" },
  { tab: "DEBTORS", label: "Cuotas pendientes", short: "Deben", icon: AlertOctagon, badge: "danger" },
  { tab: "PAYMENTS", label: "Pagos y Planes", short: "Pagos", icon: Wallet, badge: null, desktopOnly: true },
  { tab: "ABSENT", label: "Socios ausentes", short: "Ausentes", icon: UserMinus, badge: "warning" },
  { tab: "MEMBERS", label: "Clientes", short: "Clientes", icon: Users, badge: null },
  { tab: "PLANS", label: "Planes", short: "Planes", icon: Tags, badge: null },
  { tab: "TEACHER_ATTENDANCE", label: "Asistencia Profes", short: "Asistencia", icon: Clock, badge: null },
  { tab: "METRICS", label: "Métricas", short: "Métricas", icon: BarChart3, badge: null, desktopOnly: true },
  { tab: "SETTINGS", label: "Configuración", short: "Ajustes", icon: Settings, badge: null },
];

/** Secciones fijas en la barra inferior del celular; el resto queda dentro de "Menú". */
const MOBILE_BAR_TABS: AdminTab[] = ["LIVE_FEED", "DEBTORS", "MEMBERS"];

const BADGE_CLS = {
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
  /** Sin planes a la venta el botón "Nuevo" queda desactivado. */
  canCreateMember: boolean;
}

function NavList({
  activeTab,
  onSelect,
  counts,
  collapsed,
  mobile = false,
}: Pick<AdminSidebarProps, "activeTab" | "onSelect" | "counts" | "collapsed"> & { mobile?: boolean }) {
  return (
    <nav aria-label="Secciones del panel">
      <ul className="flex flex-col gap-1.5">
        {ADMIN_SECTIONS.filter((s) => !(mobile && s.desktopOnly)).map(({ tab, label, icon: Icon, badge }) => {
          const active = activeTab === tab;
          const count = counts[tab];
          return (
            <li key={tab}>
              <button
                type="button"
                onClick={() => onSelect(tab)}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`relative w-full rounded-xl flex items-center gap-3 font-bold transition-colors cursor-pointer ${
                  mobile ? "min-h-[60px] text-lg" : "min-h-[52px] text-base"
                } ${collapsed ? "justify-center px-0" : "px-4"} ${
                  active ? "bg-fx-orange text-white" : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                }`}
              >
                <Icon className={`${mobile ? "w-6 h-6" : "w-5 h-5"} shrink-0`} />
                {!collapsed && <span className="flex-1 text-left">{label}</span>}
                {badge && count !== undefined && count > 0 && (
                  <span
                    className={`font-mono font-bold rounded-full ${
                      collapsed
                        ? "absolute top-1 right-1.5 min-w-[20px] h-[20px] px-1 text-[11px] flex items-center justify-center"
                        : "px-2.5 py-0.5 text-sm"
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

/** Barra fija abajo en celular: botones grandes, siempre a mano con el pulgar. */
function MobileBottomBar({
  activeTab,
  onSelect,
  counts,
  onOpenMobile,
  onOpenNewMember,
  canCreateMember,
}: Pick<AdminSidebarProps, "activeTab" | "onSelect" | "counts" | "onOpenMobile" | "onOpenNewMember" | "canCreateMember">) {
  const barSections = MOBILE_BAR_TABS.map((t) => ADMIN_SECTIONS.find((s) => s.tab === t)!);
  const inMenu = !MOBILE_BAR_TABS.includes(activeTab);

  const tabButton = ({ tab, short, icon: Icon, badge }: (typeof ADMIN_SECTIONS)[number]) => {
    const active = activeTab === tab;
    const count = counts[tab];
    return (
      <button
        key={tab}
        type="button"
        onClick={() => onSelect(tab)}
        aria-current={active ? "page" : undefined}
        className={`relative flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold cursor-pointer ${
          active ? "text-fx-orangeText bg-fx-orange/10" : "text-fx-muted"
        }`}
      >
        <Icon className="w-7 h-7" />
        <span>{short}</span>
        {badge && count !== undefined && count > 0 && (
          <span
            className={`absolute top-1 left-1/2 ml-2 min-w-[20px] h-[20px] px-1 rounded-full text-[11px] font-mono font-bold flex items-center justify-center ${BADGE_CLS[badge]}`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-fx-surface border-t border-fx-border shadow-[0_-4px_20px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch gap-1 px-2 h-[76px] py-1.5">
        {tabButton(barSections[0])}
        {tabButton(barSections[1])}
        <button
          type="button"
          onClick={onOpenNewMember}
          disabled={!canCreateMember}
          aria-label={canCreateMember ? "Registrar nuevo socio" : "Registrar nuevo socio (primero creá un plan)"}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-bold text-fx-orangeText cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="w-12 h-12 -mt-5 rounded-full bg-fx-orange text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,87,217,0.45)] border-4 border-fx-surface">
            <UserPlus className="w-6 h-6" />
          </span>
          <span>Nuevo</span>
        </button>
        {tabButton(barSections[2])}
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Abrir menú con todas las secciones"
          className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold cursor-pointer ${
            inMenu ? "text-fx-orangeText bg-fx-orange/10" : "text-fx-muted"
          }`}
        >
          <Menu className="w-7 h-7" />
          <span>Menú</span>
        </button>
      </div>
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

  const navScrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    setHasOverflow(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [updateScrollButtons]);

  const scrollNav = (dir: -1 | 1) => {
    const el = navScrollRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (dir === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * 240, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Escritorio: barra horizontal superior estilo carrusel circular con flechas azules */}
      <nav
        aria-label="Navegación principal"
        className="hidden lg:flex sticky top-0 z-20 w-full items-center justify-between gap-2 border-b-2 border-fx-border bg-fx-surface px-4 py-2.5"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasOverflow && (
            <button
              type="button"
              onClick={() => scrollNav(-1)}
              aria-label="Desplazar módulos a la izquierda"
              className="shrink-0 w-9 min-h-[44px] rounded-md border border-fx-orange bg-fx-orange hover:bg-fx-orange/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div
            ref={navScrollRef}
            onScroll={updateScrollButtons}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0 flex-1"
          >
            {ADMIN_SECTIONS.map(({ tab, label, icon: Icon, badge }) => {
              const active = activeTab === tab;
              const count = counts[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onSelect(tab)}
                  className={`min-h-[48px] px-3.5 rounded-md flex items-center gap-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? "bg-fx-orange text-white"
                      : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {badge && count !== undefined && count > 0 && (
                    <span
                      className={`min-w-[20px] h-[20px] px-1.5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center ${
                        active ? "bg-white/20 text-white" : BADGE_CLS[badge]
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {hasOverflow && (
            <button
              type="button"
              onClick={() => scrollNav(1)}
              aria-label="Desplazar módulos a la derecha"
              className="shrink-0 w-9 min-h-[44px] rounded-md border border-fx-orange bg-fx-orange hover:bg-fx-orange/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="shrink-0 pl-3 border-l border-fx-border">
          <LogoutButton />
        </div>
      </nav>

      <MobileBottomBar
        activeTab={activeTab}
        onSelect={onSelect}
        counts={counts}
        onOpenMobile={onOpenMobile}
        onOpenNewMember={onOpenNewMember}
        canCreateMember={canCreateMember}
      />

      {/* Celular / tablet: menú completo que sube desde abajo */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <button type="button" aria-label="Cerrar menú" onClick={onCloseMobile} className="absolute inset-0 bg-black/60 cursor-default" />
          <aside className="relative w-full max-h-[90vh] overflow-y-auto bg-fx-surface border-t border-fx-border rounded-t-3xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pl-2 min-h-[48px]">
              <span className="text-lg font-extrabold text-fx-text">¿A dónde querés ir?</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Cerrar menú"
                className="w-12 h-12 rounded-xl flex items-center justify-center text-fx-text bg-fx-base border border-fx-border cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <NavList
              activeTab={activeTab}
              onSelect={(tab) => {
                onSelect(tab);
                onCloseMobile();
              }}
              counts={counts}
              collapsed={false}
              mobile
            />
            <div className="pt-3 border-t border-fx-border">
              <LogoutButton onLogoutStart={onCloseMobile} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
