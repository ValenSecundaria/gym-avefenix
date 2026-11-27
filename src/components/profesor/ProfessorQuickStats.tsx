import React from "react";
import { AlertTriangle, DoorOpen, Users } from "lucide-react";

interface ProfessorQuickStatsProps {
  todayCount: number;
  activeMembers: number;
  debtorsCount: number;
  onSelectLiveFeed: () => void;
  onSelectActiveClients: () => void;
  onSelectExpiredClients: () => void;
}

export function ProfessorQuickStats({
  todayCount,
  activeMembers,
  debtorsCount,
  onSelectLiveFeed,
  onSelectActiveClients,
  onSelectExpiredClients,
}: ProfessorQuickStatsProps) {
  return (
    <div className="lg:col-span-5 grid grid-cols-3 gap-3">
      <button
        type="button"
        onClick={onSelectLiveFeed}
        className="p-4 sm:p-5 rounded-3xl bg-fx-surface border border-fx-border border-t-4 border-t-fx-orange hover:border-fx-orange/60 text-left flex flex-col justify-between gap-2 shadow-sm transition-colors cursor-pointer min-h-[112px]"
      >
        <DoorOpen className="w-5 h-5 text-fx-orangeText" />
        <div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-fx-text">{todayCount}</p>
          <p className="text-xs font-bold text-fx-muted mt-0.5">Hoy en sala</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onSelectActiveClients}
        className="p-4 sm:p-5 rounded-3xl bg-fx-surface border border-fx-border border-t-4 border-t-[#10B981] hover:border-[#10B981]/60 text-left flex flex-col justify-between gap-2 shadow-sm transition-colors cursor-pointer min-h-[112px]"
      >
        <Users className="w-5 h-5 text-[#10B981]" />
        <div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-fx-text">{activeMembers}</p>
          <p className="text-xs font-bold text-fx-muted mt-0.5">Al día</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onSelectExpiredClients}
        className="p-4 sm:p-5 rounded-3xl bg-fx-surface border border-fx-border border-t-4 border-t-fx-red hover:border-fx-red/60 text-left flex flex-col justify-between gap-2 shadow-sm transition-colors cursor-pointer min-h-[112px]"
      >
        <AlertTriangle className="w-5 h-5 text-fx-redText" />
        <div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-fx-redText">{debtorsCount}</p>
          <p className="text-xs font-bold text-fx-muted mt-0.5">Vencidos</p>
        </div>
      </button>
    </div>
  );
}
