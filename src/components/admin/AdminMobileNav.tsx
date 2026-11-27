"use client";

import React from "react";
import { Menu, UserPlus, X } from "lucide-react";
import type { AdminTab } from "./AdminDashboardClient";
import { ADMIN_SECTIONS, BADGE_CLS, MOBILE_BAR_TABS } from "./AdminSidebar";
import { LogoutButton } from "./logout-button";

interface AdminMobileNavProps {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  counts: Partial<Record<AdminTab, number>>;
  mobileOpen: boolean;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
  onOpenNewMember: () => void;
  canCreateMember: boolean;
}

export function AdminMobileNav({
  activeTab,
  onSelect,
  counts,
  mobileOpen,
  onOpenMobile,
  onCloseMobile,
  onOpenNewMember,
  canCreateMember,
}: AdminMobileNavProps) {
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
        className={`relative flex-1 flex flex-col items-center justify-center gap-1 rounded-md text-xs font-extrabold uppercase cursor-pointer ${
          active ? "text-fx-orangeText bg-fx-orange/15 border border-fx-orange/40" : "text-fx-muted"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{short}</span>
        {badge && count !== undefined && count > 0 && (
          <span
            className={`absolute top-1 left-1/2 ml-2 min-w-[20px] h-[20px] px-1 rounded-sm text-[11px] font-mono font-bold flex items-center justify-center ${BADGE_CLS[badge]}`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <nav
        aria-label="Navegación principal móvil"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-fx-surface/95 backdrop-blur border-t-2 border-fx-border pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-stretch gap-1 px-2 h-[76px] py-1.5">
          {tabButton(barSections[0])}
          {tabButton(barSections[1])}
          <button
            type="button"
            onClick={onOpenNewMember}
            disabled={!canCreateMember}
            aria-label={canCreateMember ? "Registrar nuevo socio" : "Registrar nuevo socio (primero creá un plan)"}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-extrabold uppercase text-fx-orangeText cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="w-12 h-12 -mt-5 rounded-md bg-fx-orange text-[#0A0B0D] flex items-center justify-center shadow-lg border-2 border-fx-surface">
              <UserPlus className="w-6 h-6" />
            </span>
            <span>Nuevo</span>
          </button>
          {tabButton(barSections[2])}
          <button
            type="button"
            onClick={onOpenMobile}
            aria-label="Abrir menú con todas las secciones"
            className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-md text-xs font-extrabold uppercase cursor-pointer ${
              inMenu ? "text-fx-orangeText bg-fx-orange/15 border border-fx-orange/40" : "text-fx-muted"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span>Menú</span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <button type="button" aria-label="Cerrar menú" onClick={onCloseMobile} className="absolute inset-0 bg-black/70 cursor-default" />
          <aside className="relative w-full max-h-[90vh] overflow-y-auto bg-fx-surface border-t-2 border-fx-orange rounded-t-lg p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pl-1 min-h-[48px]">
              <span className="text-base font-black uppercase tracking-wider text-fx-text">Módulos del Panel</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Cerrar menú"
                className="w-12 h-12 rounded-md flex items-center justify-center text-fx-text bg-fx-base border border-fx-border cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ul className="flex flex-col gap-1.5">
              {ADMIN_SECTIONS.filter((s) => !s.desktopOnly).map(({ tab, label, icon: Icon, badge }) => {
                const active = activeTab === tab;
                const count = counts[tab];
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => { onSelect(tab); onCloseMobile(); }}
                      aria-current={active ? "page" : undefined}
                      className={`w-full min-h-[54px] px-4 rounded-md flex items-center gap-3 text-[15px] font-extrabold uppercase tracking-wide transition-colors cursor-pointer ${
                        active ? "bg-fx-orange text-[#0A0B0D]" : "text-fx-muted hover:text-fx-text hover:bg-fx-hover"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="flex-1 text-left">{label}</span>
                      {badge && count !== undefined && count > 0 && (
                        <span className={`font-mono font-bold rounded-sm px-2 py-0.5 text-xs ${active ? "bg-[#0A0B0D] text-[#EAB308]" : BADGE_CLS[badge]}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="pt-3 border-t border-fx-border">
              <LogoutButton onLogoutStart={onCloseMobile} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
