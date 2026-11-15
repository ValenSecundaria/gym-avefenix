import React from "react";
import Image from "next/image";
import {
  UserPlus,
  RefreshCw,
  MonitorCheck,
  MonitorX,
  Users,
  DoorOpen,
  AlertTriangle,
  UserX,
  Sun,
  Moon,
} from "lucide-react";
import type { AdminTheme } from "@/lib/use-admin-theme";
import type { DashboardStats } from "@/types";
import type { AdminTab } from "./AdminDashboardClient";
import { formatCurrencyARS } from "@/lib/utils";
import { ABSENT_DAYS_THRESHOLD } from "@/lib/constants";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { KpiCard } from "./KpiCard";

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

const ICON_BTN =
  "min-h-[48px] min-w-[48px] px-3 rounded-md bg-fx-base hover:bg-fx-hover border border-fx-border text-sm font-bold text-fx-muted hover:text-fx-text inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50";

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
    <header className="w-full flex flex-col gap-4">
      {/* Celular: barra superior compacta */}
      <div className="lg:hidden sticky top-0 z-20 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-3 bg-fx-surface/95 backdrop-blur border-b border-fx-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-md overflow-hidden bg-brand-bg border border-fx-border flex items-center justify-center shrink-0">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.shortName}
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-fx-text uppercase tracking-tight truncate">
              {GYM_BRAND_CONFIG.identity.shortName}
            </h1>
            <p className="text-xs font-bold text-fx-green truncate font-mono">
              Caja mes: {formatCurrencyARS(stats.monthlyRevenue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onToggleTheme} aria-label={themeLabel} className={ICON_BTN}>
            <ThemeIcon className="w-5 h-5" />
          </button>
          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualizar datos" className={ICON_BTN}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-fx-orangeText" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Escritorio: Cabecera industrial en 2 bloques */}
      <div className="hidden lg:flex items-center justify-between gap-4 p-5 rounded-lg bg-fx-surface border border-fx-border border-l-4 border-l-fx-orange shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-brand-bg border border-fx-border flex items-center justify-center shrink-0">
            <Image
              src={GYM_BRAND_CONFIG.assets.logoMain}
              alt={GYM_BRAND_CONFIG.identity.name}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-fx-text uppercase tracking-tight">
                {GYM_BRAND_CONFIG.identity.name}
              </h1>
              <span className="px-2 py-0.5 rounded-sm bg-fx-orange/15 text-fx-orangeText text-[11px] font-extrabold uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-sm text-fx-muted flex items-center gap-2 mt-0.5">
              <span>Cobrado este mes:</span>
              <span className="font-mono font-extrabold text-fx-green text-base">
                {formatCurrencyARS(stats.monthlyRevenue)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCheckInScreen}
            className={`${ICON_BTN} ${
              checkInScreenOnline ? "border-fx-green/50 text-fx-green bg-fx-green/10" : ""
            }`}
            title={checkInScreenOnline ? "Pantalla de ingreso conectada" : "Abrir pantalla de ingreso"}
          >
            {checkInScreenOnline ? <MonitorCheck className="w-4 h-4" /> : <MonitorX className="w-4 h-4" />}
            <span>{checkInScreenOnline ? "Ingreso en línea" : "Abrir ingreso"}</span>
          </button>

          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualizar datos" className={ICON_BTN}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-fx-orangeText" : ""}`} />
              <span>Actualizar</span>
            </button>
          )}

          <button type="button" onClick={onToggleTheme} aria-label={themeLabel} title={themeLabel} className={ICON_BTN}>
            <ThemeIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenNewMember}
            disabled={!canCreateMember}
            title={canCreateMember ? undefined : NO_PLANS_HINT}
            className="min-h-[48px] px-5 rounded-md bg-fx-orange hover:bg-fx-orange/90 active:scale-[0.98] text-white font-extrabold text-sm uppercase tracking-wide inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nuevo socio</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI compactas */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Entraron hoy"
          value={stats.todayCheckIns}
          unit="socios"
          hint="Ver ingresos de hoy"
          icon={DoorOpen}
          tone="orange"
          onClick={() => onGoToTab("LIVE_FEED")}
        />
        <KpiCard
          label="Al día"
          value={stats.activeMembers}
          unit="socios"
          hint="Ver clientes"
          icon={Users}
          tone="neutral"
          onClick={() => onGoToTab("MEMBERS")}
        />
        <KpiCard
          label="Deben la cuota"
          value={stats.debtorsCount}
          unit="personas"
          hint="Cobrar cuotas"
          icon={AlertTriangle}
          tone="red"
          onClick={() => onGoToTab("DEBTORS")}
        />
        <KpiCard
          label={`No vienen (+${ABSENT_DAYS_THRESHOLD} días)`}
          value={stats.absentCount}
          unit="personas"
          hint="Escribirles por WhatsApp"
          icon={UserX}
          tone="amber"
          onClick={() => onGoToTab("ABSENT")}
        />
      </div>
    </header>
  );
}
