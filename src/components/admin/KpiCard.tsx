import React from "react";
import { ChevronRight } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  unit: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "orange" | "neutral" | "red" | "amber";
  onClick: () => void;
}

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone,
  onClick,
}: KpiCardProps) {
  const toneCls = {
    orange: {
      card: "border-l-fx-orange hover:border-fx-orange/70",
      icon: "bg-fx-orange/15 text-fx-orangeText",
      value: "text-fx-text",
    },
    neutral: {
      card: "border-l-fx-muted hover:border-fx-text/40",
      icon: "bg-fx-base text-fx-text",
      value: "text-fx-text",
    },
    red: {
      card: "border-l-fx-red border-fx-red/40 hover:border-fx-red",
      icon: "bg-fx-red/15 text-fx-redText",
      value: "text-fx-redText",
    },
    amber: {
      card: "border-l-fx-amber border-fx-amber/40 hover:border-fx-amber",
      icon: "bg-fx-amber/15 text-fx-amber",
      value: "text-fx-amber",
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left p-4 rounded-lg bg-fx-surface border border-fx-border border-l-4 shadow-sm flex items-center justify-between gap-3 transition-colors cursor-pointer min-h-[88px] ${toneCls.card}`}
    >
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fx-muted truncate">
          {label}
        </span>
        <div className={`flex items-baseline gap-1.5 font-black tracking-tight ${toneCls.value}`}>
          <span className="text-3xl sm:text-4xl font-mono">{value}</span>
          <span className="text-sm sm:text-base font-bold opacity-80">{unit}</span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-fx-muted">
          <span>{hint}</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </div>

      <span className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${toneCls.icon}`}>
        <Icon className="w-5 h-5" />
      </span>
    </button>
  );
}
