"use client";

import React from "react";
import Image from "next/image";
import { MonitorCheck, MonitorX, Moon, RefreshCw, Sun, UserPlus } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { NO_PLANS_HINT } from "@/components/admin/HeaderStats";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

const ICON_BTN =
  "min-h-[48px] min-w-[48px] px-3 rounded-md bg-fx-base hover:bg-fx-hover border border-fx-border text-sm font-bold text-fx-muted hover:text-fx-text inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50";

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
    <header className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-lg bg-fx-surface border border-fx-border border-l-4 border-l-fx-orange shadow-sm">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-md overflow-hidden bg-brand-bg border border-fx-border flex items-center justify-center shrink-0">
          <Image
            src={GYM_BRAND_CONFIG.assets.logoMain}
            alt={GYM_BRAND_CONFIG.identity.shortName}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-fx-text uppercase tracking-tight">
              {GYM_BRAND_CONFIG.identity.shortName}
            </h1>
            <span className="px-2 py-0.5 rounded-sm bg-fx-orange/15 text-fx-orangeText text-[11px] font-extrabold uppercase tracking-wider">
              Profesores
            </span>
          </div>
          <p className="text-sm text-fx-muted truncate">Hola, {displayName}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {checkInScreenOnline ? (
          <span
            title="El teclado numérico escribe en la pantalla de ingreso"
            className="min-h-[48px] px-4 rounded-md bg-fx-green/10 border border-fx-green/40 text-sm font-bold text-fx-green hidden md:inline-flex items-center gap-2"
          >
            <MonitorCheck className="w-5 h-5" />
            Ingreso en línea
          </span>
        ) : (
          <button
            type="button"
            onClick={onOpenCheckInScreen}
            className="min-h-[48px] px-4 rounded-md bg-fx-amber/10 border border-fx-amber/50 hover:bg-fx-amber/20 text-sm font-bold text-fx-amber hidden md:inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MonitorX className="w-5 h-5" />
            Abrir ingreso
          </button>
        )}
        <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualizar datos" className={ICON_BTN}>
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-fx-orangeText" : ""}`} />
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
          className="min-h-[48px] px-5 rounded-md bg-fx-orange hover:bg-fx-orange/90 text-white font-extrabold text-sm uppercase tracking-wide inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-5 h-5" />
          <span>Nuevo socio</span>
        </button>
        <div className="w-full sm:w-44">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
