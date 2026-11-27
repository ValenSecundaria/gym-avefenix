import React from "react";
import Image from "next/image";
import {
  MonitorCheck,
  MonitorX,
  Moon,
  RefreshCw,
  Sun,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { AdminTheme } from "@/lib/use-admin-theme";
import type { DashboardStats } from "@/types";
import type { AdminTab } from "./AdminDashboardClient";
import { formatCurrencyARS } from "@/lib/utils";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { LogoutButton } from "./logout-button";

interface HeaderStatsProps {
  stats: DashboardStats;
  onOpenNewMember: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  theme: AdminTheme;
  onToggleTheme: () => void;
  onGoToTab: (tab: AdminTab) => void;
  checkInScreenOnline: boolean;
  onOpenCheckInScreen: () => void;
  canCreateMember: boolean;
}

export const NO_PLANS_HINT = "Primero creá un plan en la sección Planes";

const ACTION_BTN =
  "min-h-[48px] min-w-[48px] px-3.5 rounded-md bg-fx-base hover:bg-fx-hover border border-fx-border text-[15px] font-bold text-fx-muted hover:text-fx-text inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50";

export function HeaderStats({
  stats,
  onOpenNewMember,
  onRefresh,
  isRefreshing = false,
  theme,
  onToggleTheme,
  onGoToTab,
  checkInScreenOnline,
  onOpenCheckInScreen,
  canCreateMember,
}: HeaderStatsProps) {
  const themeLabel = theme === "light" ? "Modo oscuro" : "Modo claro";
  const ThemeIcon = theme === "light" ? Moon : Sun;

  return (
    <header className="w-full">
      {/* Móvil: cabecera superior industrial compacta */}
      <div className="lg:hidden sticky top-0 z-20 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-3 bg-fx-surface/95 backdrop-blur border-b-2 border-fx-orange flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-md overflow-hidden bg-brand-bg border border-fx-border flex items-center justify-center shrink-0">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.shortName}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black uppercase tracking-wide text-fx-text truncate">
              {GYM_BRAND_CONFIG.identity.shortName}
            </h1>
            <p className="text-xs font-extrabold text-fx-green truncate font-mono">
              Caja: {formatCurrencyARS(stats.monthlyRevenue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onToggleTheme} aria-label={themeLabel} className={ACTION_BTN}>
            <ThemeIcon className="w-5 h-5" />
          </button>
          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualizar datos" className={ACTION_BTN}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-fx-orangeText" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Escritorio: Consola de Comando Industrial */}
      <div className="hidden lg:flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-lg bg-fx-surface border-2 border-fx-border border-l-4 border-l-fx-orange shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-md overflow-hidden bg-brand-bg border-2 border-fx-border flex items-center justify-center shrink-0">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.name}
              width={52}
              height={52}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black uppercase tracking-wider text-fx-text">
                {GYM_BRAND_CONFIG.identity.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-sm bg-fx-orange/15 border border-fx-orange/40 font-mono text-[11px] font-extrabold uppercase tracking-wider text-fx-orangeText">
                RECEPCIÓN
              </span>
            </div>
            <p className="font-mono text-xs text-fx-muted mt-0.5">
              {GYM_BRAND_CONFIG.contact.address} {"//"} {GYM_BRAND_CONFIG.identity.city}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onGoToTab("PAYMENTS")}
            title="Ir al módulo de Pagos y Planes"
            className="ml-2 min-h-[48px] px-4 rounded-md bg-fx-base hover:bg-fx-hover border border-fx-border inline-flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-fx-green shrink-0" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-fx-muted">Caja Mes:</span>
            <span className="font-mono font-black text-base text-fx-green">
              {formatCurrencyARS(stats.monthlyRevenue)}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenCheckInScreen}
            className={`${ACTION_BTN} ${
              checkInScreenOnline ? "border-fx-green/50 text-fx-green bg-fx-green/10" : ""
            }`}
            title={checkInScreenOnline ? "Pantalla de ingreso conectada" : "Abrir pantalla de ingreso"}
          >
            {checkInScreenOnline ? <MonitorCheck className="w-4 h-4" /> : <MonitorX className="w-4 h-4" />}
            <span>{checkInScreenOnline ? "Ingreso en línea" : "Abrir ingreso"}</span>
          </button>

          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualizar datos" className={ACTION_BTN}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-fx-orangeText" : ""}`} />
              <span>Actualizar</span>
            </button>
          )}

          <button type="button" onClick={onToggleTheme} aria-label={themeLabel} title={themeLabel} className={ACTION_BTN}>
            <ThemeIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenNewMember}
            disabled={!canCreateMember}
            title={canCreateMember ? undefined : NO_PLANS_HINT}
            className="min-h-[48px] px-5 rounded-md bg-fx-orange hover:bg-brand-primaryHover text-[#0A0B0D] font-black uppercase tracking-wider text-sm inline-flex items-center gap-2 shadow-md shadow-fx-orange/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nuevo socio</span>
          </button>

          <LogoutButton collapsed={false} className="!w-auto rounded-md" />
        </div>
      </div>
    </header>
  );
}
