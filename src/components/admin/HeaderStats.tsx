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
} from "lucide-react";
import type { DashboardStats } from "@/types";
import { formatCurrencyARS } from "@/lib/utils";

interface HeaderStatsProps {
  stats: DashboardStats;
  onOpenNewMember: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function HeaderStats({
  stats,
  onOpenNewMember,
  onRefresh,
  isRefreshing = false,
}: HeaderStatsProps) {
  return (
    <header className="w-full flex flex-col gap-6">
      {/* Barra Operativa Superior (Stitch Screen 2) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#17171C] border border-[#2C2D35] shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F95716] to-[#D92614] flex items-center justify-center shadow-[0_0_18px_rgba(249,87,22,0.45)] shrink-0">
            <Flame className="w-6 h-6 text-[#F4F5F7]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#F4F5F7] tracking-tight uppercase">
                Ave Fénix • <span className="text-[#F95716]">Control Recepción</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B0B0C] border border-[#2C2D35] text-xs font-semibold text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                Molinete Operativo
              </span>
            </div>
            <p className="text-xs text-[#8A909A] mt-0.5">
              Enlace local sincronizado con base central • Estación Recepción #01
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="font-mono text-xs sm:text-sm bg-[#0B0B0C] border border-[#2C2D35] px-3.5 py-2.5 rounded-xl text-[#F4F5F7] font-semibold flex items-center gap-2">
            <span className="text-[#8A909A] uppercase text-xs">Caja Mes:</span>
            <span className="text-[#F95716] font-bold">{formatCurrencyARS(stats.monthlyRevenue)}</span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Actualizar datos del panel"
              className="min-h-[48px] px-3.5 rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] border border-[#2C2D35] text-xs sm:text-sm font-semibold text-[#8A909A] hover:text-[#F4F5F7] inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#F95716]" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          )}

          <Link
            href="/check-in"
            className="min-h-[48px] px-4 rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] border border-[#2C2D35] text-xs sm:text-sm font-semibold text-[#F4F5F7] inline-flex items-center gap-2 transition-colors"
          >
            <MonitorCheck className="w-4 h-4 text-[#10B981]" />
            <span>Monitor Público</span>
          </Link>

          <button
            type="button"
            onClick={onOpenNewMember}
            className="min-h-[48px] px-5 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 active:scale-[0.98] text-[#F4F5F7] font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(249,87,22,0.35)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Nuevo Socio</span>
          </button>
        </div>
      </div>

      {/* 4 Tarjetas KPI (Stitch Screen 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-xl bg-[#17171C] border border-[#2C2D35] hover:border-[#F95716]/40 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#8A909A] font-bold uppercase tracking-wider">Ingresos hoy</span>
            <div className="w-11 h-11 rounded-xl bg-[#F95716]/10 border border-[#F95716]/30 flex items-center justify-center text-[#F95716]">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#F4F5F7] tracking-tight">{stats.todayCheckIns} socios</div>
          <div className="flex items-center gap-1.5 mt-2 text-[#10B981] text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Registrados hoy en terminal</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#17171C] border border-[#2C2D35] transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#8A909A] font-bold uppercase tracking-wider">Socios Activos</span>
            <div className="w-11 h-11 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] flex items-center justify-center text-[#F4F5F7]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#F4F5F7] tracking-tight">{stats.activeMembers} socios</div>
          <p className="mt-2 text-[#8A909A] text-xs">Comunidad activa con cuota al día</p>
        </div>

        <div className="p-6 rounded-xl bg-[#17171C] border border-[#D92614]/40 hover:border-[#D92614] transition-all shadow-md flex flex-col justify-between bg-gradient-to-b from-[#17171C] to-[#D92614]/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#D92614] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D92614]" />
              Cuotas Vencidas
            </span>
            <div className="w-11 h-11 rounded-xl bg-[#D92614]/15 border border-[#D92614]/40 flex items-center justify-center text-[#D92614]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#D92614] tracking-tight">{stats.debtorsCount} personas</div>
          <p className="mt-2 text-[#D92614] text-xs font-bold">Requieren regularizar en mostrador</p>
        </div>

        <div className="p-6 rounded-xl bg-[#17171C] border border-[#FFB300]/40 hover:border-[#FFB300] transition-all shadow-md flex flex-col justify-between bg-gradient-to-b from-[#17171C] to-[#FFB300]/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#FFB300] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFB300]" />
              Socios Ausentes (+15 días)
            </span>
            <div className="w-11 h-11 rounded-xl bg-[#FFB300]/15 border border-[#FFB300]/40 flex items-center justify-center text-[#FFB300]">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#FFB300] tracking-tight">{stats.absentCount} personas</div>
          <p className="mt-2 text-[#8A909A] text-xs">Sugerido recontacto por WhatsApp</p>
        </div>
      </div>
    </header>
  );
}
