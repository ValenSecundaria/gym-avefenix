"use client";

import React, { useState } from "react";
import type { PlanOption } from "@/types";
import { formatCurrencyARS } from "@/lib/utils";

export interface PlanGroup {
  key: string;
  label: string;
  plans: PlanOption[];
}

// Agrupa respetando el orden en que llegan los planes (por disciplina y precio).
export function groupPlansByDiscipline(plans: PlanOption[]): PlanGroup[] {
  const groups: PlanGroup[] = [];
  for (const p of plans) {
    const key = p.disciplineId ?? "none";
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label: p.disciplineName ?? "Otros", plans: [] };
      groups.push(group);
    }
    group.plans.push(p);
  }
  return groups;
}

function planDetail(p: PlanOption): string {
  if (p.category === "MENSUAL_DIAS") return `${p.allowedDaysPerWeek} días/semana`;
  if (p.category === "DIARIO") return "1 día";
  return "Libre";
}

interface PlanPickerProps {
  plans: PlanOption[];
  selectedPlanId: string;
  onSelect: (planId: string) => void;
}

export function PlanPicker({ plans, selectedPlanId, onSelect }: PlanPickerProps) {
  const groups = groupPlansByDiscipline(plans);
  const [filter, setFilter] = useState<string>("ALL");
  const visible = filter === "ALL" ? plans : plans.filter((p) => (p.disciplineId ?? "none") === filter);

  const chooseFilter = (key: string) => {
    setFilter(key);
    // Si el plan elegido queda oculto, se pasa al primero de la disciplina.
    const nextVisible = key === "ALL" ? plans : plans.filter((p) => (p.disciplineId ?? "none") === key);
    if (nextVisible.length > 0 && !nextVisible.some((p) => p.id === selectedPlanId)) onSelect(nextVisible[0].id);
  };

  if (plans.length === 0) {
    return <p className="text-sm text-fx-muted">No hay planes activos. Creá uno desde la sección Planes.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar planes por disciplina">
          {[{ key: "ALL", label: "Todas" }, ...groups].map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => chooseFilter(g.key)}
              aria-pressed={filter === g.key}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                filter === g.key ? "bg-fx-orange/20 border-fx-orange text-fx-text" : "bg-fx-base border-fx-border text-fx-muted hover:text-fx-text"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Plan">
        {visible.map((p) => {
          const active = selectedPlanId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(p.id)}
              className={`min-h-[64px] px-2 py-2 rounded-xl text-center transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                active ? "bg-fx-orange text-white border-fx-orange" : "bg-fx-base border-fx-border text-fx-muted hover:text-fx-text"
              }`}
            >
              <span className="text-xs font-bold leading-tight">{p.name}</span>
              <span className={`text-[11px] ${active ? "text-white/85" : "text-fx-muted"}`}>
                {filter === "ALL" && p.disciplineName ? `${p.disciplineName} • ` : ""}
                {planDetail(p)} • {formatCurrencyARS(p.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
