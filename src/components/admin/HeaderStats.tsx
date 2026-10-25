import React from "react";
import {
  Flame,
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
  ChevronRight,
} from "lucide-react";
import type { AdminTheme } from "@/lib/use-admin-theme";
import type { DashboardStats } from "@/types";
import type { AdminTab } from "./AdminDashboardClient";
import { formatCurrencyARS } from "@/lib/utils";
import { ABSENT_DAYS_THRESHOLD } from "@/lib/constants";

interface HeaderStatsProps {
  stats: DashboardStats;
  onOpenNewMember: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  theme: AdminTheme;
  onToggleTheme: () => void;
  onGoToTab: (tab: AdminTab) => void;
  /** La ventana de Check-In (pantalla 2) está abierta y recibiendo el teclado numérico. */
  checkInScreenOnline: boolean;
  onOpenCheckInScreen: () => void;
}

const ICON_BTN =
  "min-h-[48px] min-w-[48px] px-3 rounded-xl bg-fx-base hover:bg-fx-hover border border-fx-border text-sm font-bold text-fx-muted hover:text-fx-text inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50";

function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  value: number;
  unit: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "orange" | "neutral" | "red" | "amber";
  onClick: () => void;
}) {
  const toneCls = {
    orange: { card: "hover:border-fx-orange/60", icon: "bg-fx-orange/10 text-fx-orange", value: "text-fx-text" },
    neutral: { card: "hover:border-fx-text/30", icon: "bg-fx-base text-fx-text", value: "text-fx-text" },
    red: { card: "border-fx-red/40 hover:border-fx-red", icon: "bg-fx-red/15 text-fx-red", value: "text-fx-red" },
    amber: { card: "border-fx-amber/40 hover:border-fx-amber", icon: "bg-fx-amber/15 text-fx-amber", value: "text-fx-amber" },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left p-4 sm:p-5 rounded-2xl bg-fx-surface border border-fx-border shadow-md flex flex-col gap-2 transition-colors cursor-pointer ${toneCls.card}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm sm:text-base font-bold text-fx-muted leading-tight">{label}</span>
        <span className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${toneCls.icon}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </span>
      </div>
      <div className={`flex flex-wrap items-baseline gap-x-1.5 font-extrabold tracking-tight ${toneCls.value}`}>
        <span className="text-4xl sm:text-5xl">{value}</span>
        <span className="text-base sm:text-lg font-bold opacity-80">{unit}</span>
      </div>
      <div className="hidden sm:flex items-center justify-between text-sm text-fx-muted">
        <span>{hint}</span>
        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

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
}: HeaderStatsProps) {
  const themeLabel = theme === "light" ? "Modo oscuro" : "Modo claro";
  const ThemeIcon = theme === "light" ? Moon : Sun;

  return (
    <header className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Celular: barra superior simple */}
      <div className="lg:hidden sticky top-0 z-20 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-3 bg-fx-surface/95 backdrop-blur border-b border-fx-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fx-orange to-fx-red flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-extrabold text-fx-text leading-tight truncate">Ave Fénix</div>
            <div className="text-xs font-bold uppercase tracking-wider text-fx-orange">Recepción</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualizar datos" className={ICON_BTN}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-fx-orange" : ""}`} />
            </button>
          )}
          <button type="button" onClick={onToggleTheme} aria-label={themeLabel} title={themeLabel} className={ICON_BTN}>
            <ThemeIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Escritorio: barra operativa */}
      <div className="hidden lg:flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-fx-surface border border-fx-border shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fx-orange to-fx-red flex items-center justify-center shadow-[0_0_18px_rgba(249,87,22,0.45)] shrink-0">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-fx-text tracking-tight">
              Ave Fénix <span className="text-fx-orange">• Recepción</span>
            </h1>
            <p className="text-sm text-fx-muted">
              Caja del mes: <b className="font-mono text-fx-text">{formatCurrencyARS(stats.monthlyRevenue)}</b>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {checkInScreenOnline ? (
            <span
              title="El teclado numérico escribe en la pantalla de ingreso"
              className="min-h-[48px] px-4 rounded-xl bg-fx-green/10 border border-fx-green/40 text-sm font-bold text-fx-green inline-flex items-center gap-2"
            >
              <MonitorCheck className="w-5 h-5" />
              Pantalla de ingreso conectada
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenCheckInScreen}
              className="min-h-[48px] px-4 rounded-xl bg-fx-amber/10 border border-fx-amber/50 hover:bg-fx-amber/20 text-sm font-bold text-fx-amber inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MonitorX className="w-5 h-5" />
              Abrir pantalla de ingreso
            </button>
          )}

          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} className={ICON_BTN}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-fx-orange" : ""}`} />
              <span>Actualizar</span>
            </button>
          )}

          <button type="button" onClick={onToggleTheme} aria-label={themeLabel} title={themeLabel} className={ICON_BTN}>
            <ThemeIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenNewMember}
            className="min-h-[52px] px-6 rounded-xl bg-fx-orange hover:bg-fx-orange/90 active:scale-[0.98] text-white font-extrabold text-base inline-flex items-center gap-2.5 shadow-[0_4px_16px_rgba(249,87,22,0.35)] transition-all cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nuevo socio</span>
          </button>
        </div>
      </div>

      {/* Tarjetas: se tocan para ir directo a la sección */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
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
