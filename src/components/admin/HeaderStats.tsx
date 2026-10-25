import React from "react";
import Link from "next/link";
import {
  Flame,
  UserPlus,
  RefreshCw,
  MonitorCheck,
  Users,
  DoorOpen,
  AlertTriangle,
  UserX,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";
import type { AdminTheme } from "@/lib/use-admin-theme";
import type { DashboardStats } from "@/types";
import { formatCurrencyARS } from "@/lib/utils";
import { ABSENT_DAYS_THRESHOLD } from "@/lib/constants";

interface HeaderStatsProps {
  stats: DashboardStats;
  onOpenNewMember: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  theme: AdminTheme;
  onToggleTheme: () => void;
  batchSyncSlot?: React.ReactNode;
}

export function HeaderStats({
  stats,
  onOpenNewMember,
  onRefresh,
  isRefreshing = false,
  theme,
  onToggleTheme,
  batchSyncSlot,
}: HeaderStatsProps) {
  return (
    <header className="w-full flex flex-col gap-6">
      {/* Barra Operativa Superior (Stitch Screen 2) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-fx-surface border border-fx-border shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fx-orange to-fx-red flex items-center justify-center shadow-[0_0_18px_rgba(249,87,22,0.45)] shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-fx-text tracking-tight uppercase">
                Ave Fénix • <span className="text-fx-orange">Control Recepción</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-fx-base border border-fx-border text-xs font-semibold text-fx-green">
                <span className="w-2 h-2 rounded-full bg-fx-green animate-pulse" />
                Molinete Operativo
              </span>
            </div>
            <p className="text-xs text-fx-muted mt-0.5">
              Enlace local sincronizado con base central • Estación Recepción #01
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {batchSyncSlot}

          <div className="font-mono text-xs sm:text-sm bg-fx-base border border-fx-border px-3.5 py-2.5 rounded-xl text-fx-text font-semibold flex items-center gap-2">
            <span className="text-fx-muted uppercase text-xs">Caja Mes:</span>
            <span className="text-fx-orange font-bold">{formatCurrencyARS(stats.monthlyRevenue)}</span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Actualizar datos del panel"
              className="min-h-[48px] px-3.5 rounded-xl bg-fx-base hover:bg-fx-hover border border-fx-border text-xs sm:text-sm font-semibold text-fx-muted hover:text-fx-text inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-fx-orange" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            className="min-h-[48px] px-3.5 rounded-xl bg-fx-base hover:bg-fx-hover border border-fx-border text-xs sm:text-sm font-semibold text-fx-muted hover:text-fx-text inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="hidden sm:inline">{theme === "light" ? "Modo oscuro" : "Modo claro"}</span>
          </button>

          <Link
            href="/check-in"
            className="min-h-[48px] px-4 rounded-xl bg-fx-base hover:bg-fx-hover border border-fx-border text-xs sm:text-sm font-semibold text-fx-text inline-flex items-center gap-2 transition-colors"
          >
            <MonitorCheck className="w-4 h-4 text-fx-green" />
            <span>Monitor Público</span>
          </Link>

          <button
            type="button"
            onClick={onOpenNewMember}
            className="min-h-[48px] px-5 rounded-xl bg-fx-orange hover:bg-fx-orange/90 active:scale-[0.98] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(249,87,22,0.35)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Nuevo Socio</span>
          </button>
        </div>
      </div>

      {/* 4 Tarjetas KPI (Stitch Screen 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-xl bg-fx-surface border border-fx-border hover:border-fx-orange/40 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-fx-muted font-bold uppercase tracking-wider">Ingresos hoy</span>
            <div className="w-11 h-11 rounded-xl bg-fx-orange/10 border border-fx-orange/30 flex items-center justify-center text-fx-orange">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-fx-text tracking-tight">{stats.todayCheckIns} socios</div>
          <div className="flex items-center gap-1.5 mt-2 text-fx-green text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Registrados hoy en terminal</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-fx-surface border border-fx-border transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-fx-muted font-bold uppercase tracking-wider">Socios Activos</span>
            <div className="w-11 h-11 rounded-xl bg-fx-base border border-fx-border flex items-center justify-center text-fx-text">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-fx-text tracking-tight">{stats.activeMembers} socios</div>
          <p className="mt-2 text-fx-muted text-xs">Comunidad activa con cuota al día</p>
        </div>

        <div className="p-6 rounded-xl bg-fx-surface border border-fx-red/40 hover:border-fx-red transition-all shadow-md flex flex-col justify-between bg-gradient-to-b from-fx-surface to-fx-red/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-fx-red font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fx-red" />
              Cuotas Vencidas
            </span>
            <div className="w-11 h-11 rounded-xl bg-fx-red/15 border border-fx-red/40 flex items-center justify-center text-fx-red">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-fx-red tracking-tight">{stats.debtorsCount} personas</div>
          <p className="mt-2 text-fx-red text-xs font-bold">Requieren regularizar en mostrador</p>
        </div>

        <div className="p-6 rounded-xl bg-fx-surface border border-fx-amber/40 hover:border-fx-amber transition-all shadow-md flex flex-col justify-between bg-gradient-to-b from-fx-surface to-fx-amber/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-fx-amber font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fx-amber" />
              Socios Ausentes (+{ABSENT_DAYS_THRESHOLD} días)
            </span>
            <div className="w-11 h-11 rounded-xl bg-fx-amber/15 border border-fx-amber/40 flex items-center justify-center text-fx-amber">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-fx-amber tracking-tight">{stats.absentCount} personas</div>
          <p className="mt-2 text-fx-muted text-xs">Sugerido recontacto por WhatsApp</p>
        </div>
      </div>
    </header>
  );
}
