import React from "react";
import { ArrowUpRight } from "lucide-react";

interface KpiCardProps {
  code?: string;
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
  code,
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
      side: "border-l-fx-orange",
      ring: active ? "border-fx-orange bg-fx-orange/5" : "hover:border-fx-orange/70",
      icon: "bg-fx-orange/15 text-fx-orangeText border-fx-orange/30",
      value: "text-fx-text",
    },
    neutral: {
      side: "border-l-[#10B981]",
      ring: active ? "border-[#10B981] bg-[#10B981]/5" : "hover:border-[#10B981]/60",
      icon: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
      value: "text-fx-text",
    },
    red: {
      side: "border-l-fx-red",
      ring: active ? "border-fx-red bg-fx-red/5" : "border-fx-red/30 hover:border-fx-red",
      icon: "bg-fx-red/15 text-fx-redText border-fx-red/30",
      value: "text-fx-redText",
    },
    amber: {
      side: "border-l-fx-amber",
      ring: active ? "border-fx-amber bg-fx-amber/5" : "border-fx-amber/30 hover:border-fx-amber",
      icon: "bg-fx-amber/15 text-fx-amber border-fx-amber/30",
      value: "text-fx-amber",
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left p-4 rounded-lg bg-fx-surface border border-fx-border border-l-4 shadow-sm flex items-center justify-between gap-3 transition-all cursor-pointer min-h-[96px] ${toneCls.side} ${toneCls.ring}`}
    >
      <div className="min-w-0 flex flex-col gap-1">
        <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-fx-muted truncate">
          {code ? `${code} // ${label}` : label}
        </span>
        <div className={`flex items-baseline gap-1.5 font-black tracking-tight ${toneCls.value}`}>
          <span className="text-3xl font-mono leading-none">{value}</span>
          <span className="text-xs font-bold uppercase opacity-80">{unit}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-fx-muted group-hover:text-fx-text transition-colors mt-0.5">
          <span className="truncate">{hint}</span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
        </span>
      </div>

      <span className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${toneCls.icon}`}>
        <Icon className="w-5 h-5" />
      </span>
    </button>
  );
}
