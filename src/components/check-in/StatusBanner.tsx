import React from "react";
import { Check, AlertTriangle, Clock } from "lucide-react";
import type { AccessStatusType } from "@/types";

interface StatusBannerProps {
  status: AccessStatusType;
  planName?: string;
  daysUsedThisWeek?: number;
  allowedDaysPerWeek?: number | null;
  limitReason?: "DIARIO" | "SEMANAL";
}

const DAILY_LIMIT_TEXT = {
  title: "YA INGRESASTE HOY",
  subtitle: "Tu plan incluye un ingreso por día. Te esperamos mañana.",
};

const STATUS_CONFIG: Record<
  AccessStatusType,
  {
    title: string;
    subtitle: string;
    bannerClass: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  HABILITADO: {
    title: "HABILITADO",
    subtitle: "¡Bienvenido! Molinete abierto, excelente entrenamiento.",
    bannerClass: "bg-[#10B981] text-[#F4F5F7] shadow-xl shadow-[#10B981]/25",
    Icon: Check,
  },
  CUOTA_VENCIDA: {
    title: "CUOTA VENCIDA",
    subtitle: "Regularizá tu membresía en mostrador para habilitar el acceso.",
    bannerClass: "bg-[#D92614] text-[#F4F5F7] shadow-xl shadow-[#D92614]/30",
    Icon: AlertTriangle,
  },
  LIMITE_ALCANZADO: {
    title: "LÍMITE DE DÍAS ALCANZADO",
    subtitle: "Completaste las asistencias semanales incluidas en tu plan.",
    bannerClass: "bg-[#FFB300] text-[#0B0B0C] shadow-xl shadow-[#FFB300]/25",
    Icon: Clock,
  },
};

export function StatusBanner({
  status,
  planName,
  daysUsedThisWeek,
  allowedDaysPerWeek,
  limitReason,
}: StatusBannerProps) {
  const config =
    status === "LIMITE_ALCANZADO" && limitReason === "DIARIO"
      ? { ...STATUS_CONFIG[status], ...DAILY_LIMIT_TEXT }
      : STATUS_CONFIG[status];
  const { Icon } = config;

  return (
    <div role="status" aria-live="polite" className="w-full flex flex-col items-center gap-3">
      <div
        className={`w-full py-5 px-6 rounded-2xl flex items-center justify-center gap-3.5 transition-all duration-300 ${config.bannerClass}`}
      >
        <Icon className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.8] shrink-0" />
        <span className="font-black text-xl sm:text-2xl md:text-3xl tracking-wide uppercase text-center">
          {config.title}
        </span>
      </div>

      <p className="text-sm sm:text-base text-[#8A909A] font-medium max-w-md text-center">
        {config.subtitle}
      </p>

      {(planName || allowedDaysPerWeek) && (
        <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-[#8A909A] bg-[#0B0B0C] px-4 py-1.5 rounded-full border border-[#2C2D35]">
          {planName && <span className="font-bold text-[#F4F5F7]">{planName}</span>}
          {typeof daysUsedThisWeek === "number" && allowedDaysPerWeek ? (
            <span>
              • Semana: {daysUsedThisWeek}/{allowedDaysPerWeek} días
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
