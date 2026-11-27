import React from "react";
import { AlertTriangle, DoorOpen, Users } from "lucide-react";

interface ProfessorSalaStatsProps {
  todayCount: number;
  activeMembers: number;
  debtorsCount: number;
  onSelectToday: () => void;
  onSelectActive: () => void;
  onSelectExpired: () => void;
}

export function ProfessorSalaStats({
  todayCount,
  activeMembers,
  debtorsCount,
  onSelectToday,
  onSelectActive,
  onSelectExpired,
}: ProfessorSalaStatsProps) {
  return (
    <section
      aria-label="Resumen operativo de sala sin montos"
      className="flex flex-col gap-2.5"
    >
      <button
        type="button"
        onClick={onSelectToday}
        className="w-full min-h-[68px] p-4 rounded-lg bg-fx-surface hover:bg-fx-hover border border-fx-border border-l-4 border-l-fx-orange flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
      >
        <div>
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-fx-muted block">
            01 // HOY EN SALA
          </span>
          <span className="text-xs text-fx-muted">Ver ingresos del día</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-2xl font-black text-fx-text">{todayCount}</span>
          <DoorOpen className="w-5 h-5 text-fx-orangeText shrink-0" />
        </div>
      </button>

      <button
        type="button"
        onClick={onSelectActive}
        className="w-full min-h-[68px] p-4 rounded-lg bg-fx-surface hover:bg-fx-hover border border-fx-border border-l-4 border-l-[#10B981] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
      >
        <div>
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-fx-muted block">
            02 // SOCIOS AL DÍA
          </span>
          <span className="text-xs text-fx-muted">Filtrar habilitados</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-2xl font-black text-fx-text">{activeMembers}</span>
          <Users className="w-5 h-5 text-[#10B981] shrink-0" />
        </div>
      </button>

      <button
        type="button"
        onClick={onSelectExpired}
        className="w-full min-h-[68px] p-4 rounded-lg bg-fx-surface hover:bg-fx-hover border border-fx-border border-l-4 border-l-fx-red flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
      >
        <div>
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-fx-muted block">
            03 // CUOTA VENCIDA
          </span>
          <span className="text-xs text-fx-muted">Renovar o regularizar</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-2xl font-black text-fx-redText">{debtorsCount}</span>
          <AlertTriangle className="w-5 h-5 text-fx-redText shrink-0" />
        </div>
      </button>
    </section>
  );
}
