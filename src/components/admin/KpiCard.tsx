import React from "react";
import { ArrowUpRight } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  unit: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "orange" | "neutral" | "red" | "amber";
  active?: boolean;
  onClick: () => void;
}

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone,
  active = false,
  onClick,
}: KpiCardProps) {
  const toneCls = {
    orange: {
      top: "border-t-fx-orange",
      ring: active ? "border-fx-orange ring-1 ring-fx-orange/30" : "hover:border-fx-orange/60",
      icon: "bg-fx-orange/15 text-fx-orangeText",
      value: "text-fx-text",
    },
    neutral: {
      top: "border-t-[#10B981]",
      ring: active ? "border-[#10B981] ring-1 ring-[#10B981]/30" : "hover:border-fx-text/30",
      icon: "bg-[#10B981]/15 text-[#10B981]",
      value: "text-fx-text",
    },
    red: {
      top: "border-t-fx-red",
      ring: active ? "border-fx-red ring-1 ring-fx-red/30" : "border-fx-red/30 hover:border-fx-red",
      icon: "bg-fx-red/15 text-fx-redText",
      value: "text-fx-redText",
    },
    amber: {
      top: "border-t-fx-amber",
      ring: active ? "border-fx-amber ring-1 ring-fx-amber/30" : "border-fx-amber/30 hover:border-fx-amber",
      icon: "bg-fx-amber/15 text-fx-amber",
      value: "text-fx-amber",
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left p-4 sm:p-5 rounded-2xl bg-fx-surface border border-fx-border border-t-4 shadow-sm flex items-center justify-between gap-3 transition-all cursor-pointer min-h-[94px] ${toneCls.top} ${toneCls.ring}`}
    >
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-fx-muted truncate">
          {label}
        </span>
        <div className={`flex items-baseline gap-1.5 font-black tracking-tight ${toneCls.value}`}>
          <span className="text-3xl font-mono leading-none">{value}</span>
          <span className="text-sm font-semibold opacity-80">{unit}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-fx-muted group-hover:text-fx-text transition-colors mt-0.5">
          <span className="truncate">{hint}</span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
        </span>
      </div>

      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${toneCls.icon}`}>
        <Icon className="w-5 h-5" />
      </span>
    </button>
  );
}
