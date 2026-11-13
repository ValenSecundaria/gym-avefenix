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
