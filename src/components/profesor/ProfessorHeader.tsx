"use client";

import React from "react";
import { Flame, MonitorCheck, MonitorX, Moon, RefreshCw, Sun, UserPlus } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { NO_PLANS_HINT } from "@/components/admin/HeaderStats";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

const ICON_BTN =
  "min-h-[48px] min-w-[48px] px-3 rounded-xl bg-fx-base hover:bg-fx-hover border border-fx-border text-sm font-bold text-fx-muted hover:text-fx-text inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50";

interface Props {
  displayName: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenNewMember: () => void;
  canCreateMember: boolean;
  checkInScreenOnline: boolean;
  onOpenCheckInScreen: () => void;
}

export function ProfessorHeader({
  displayName,
  isRefreshing,
  onRefresh,
  theme,
  onToggleTheme,
  onOpenNewMember,
  canCreateMember,
  checkInScreenOnline,
  onOpenCheckInScreen,
}: Props) {
  const ThemeIcon = theme === "light" ? Moon : Sun;
  const themeLabel = theme === "light" ? "Modo oscuro" : "Modo claro";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-fx-surface border border-fx-border shadow-lg">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fx-orange to-fx-red flex items-center justify-center shrink-0">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-fx-text tracking-tight">
            {GYM_BRAND_CONFIG.identity.shortName} <span className="text-fx-orange">• Profesores</span>
          </h1>
          <p className="text-sm text-fx-muted truncate">Hola, {displayName}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {checkInScreenOnline ? (
          <span
            title="El teclado numérico escribe en la pantalla de ingreso"
            className="min-h-[48px] px-4 rounded-xl bg-fx-green/10 border border-fx-green/40 text-sm font-bold text-fx-green hidden md:inline-flex items-center gap-2"
          >
            <MonitorCheck className="w-5 h-5" />
            Pantalla de ingreso conectada
          </span>
        ) : (
          <button
            type="button"
            onClick={onOpenCheckInScreen}
            className="min-h-[48px] px-4 rounded-xl bg-fx-amber/10 border border-fx-amber/50 hover:bg-fx-amber/20 text-sm font-bold text-fx-amber hidden md:inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MonitorX className="w-5 h-5" />
            Abrir pantalla de ingreso
          </button>
        )}
        <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualizar datos" className={ICON_BTN}>
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-fx-orange" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
        <button type="button" onClick={onToggleTheme} aria-label={themeLabel} title={themeLabel} className={ICON_BTN}>
          <ThemeIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenNewMember}
          disabled={!canCreateMember}
          title={canCreateMember ? undefined : NO_PLANS_HINT}
          className="min-h-[52px] px-5 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-extrabold text-base inline-flex items-center gap-2.5 shadow-[0_4px_16px_rgba(249,87,22,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <UserPlus className="w-5 h-5" />
          <span>Nuevo socio</span>
        </button>
        <div className="w-full sm:w-48">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
