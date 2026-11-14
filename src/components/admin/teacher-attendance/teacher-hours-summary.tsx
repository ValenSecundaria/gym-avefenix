"use client";

import React, { useMemo } from "react";
import { Clock, UserCheck, Calculator } from "lucide-react";
import type { TeacherShiftItem, TeacherShiftHoursSummary } from "@/types";

interface Props {
  shifts: TeacherShiftItem[];
}

export function TeacherHoursSummary({ shifts }: Props) {
  const summaries = useMemo(() => {
    const map = new Map<string, TeacherShiftHoursSummary>();
    for (const s of shifts) {
      const existing = map.get(s.userId) || {
        userId: s.userId,
        teacherName: s.teacherName,
        teacherDni: s.teacherDni,
        totalMinutes: 0,
        totalHours: 0,
        shiftCount: 0,
      };
      if (s.totalMinutes) {
        existing.totalMinutes += s.totalMinutes;
      }
      existing.shiftCount += 1;
      existing.totalHours = Number((existing.totalMinutes / 60).toFixed(1));
      map.set(s.userId, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [shifts]);

  if (summaries.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center text-sm text-brand-textSecondary">
        No hay horas registradas en el período seleccionado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-textSecondary flex items-center gap-2">
          <Calculator className="w-4 h-4 text-brand-primaryText" />
          Liquidación de Horas por Profesor
        </h4>
        <span className="text-xs text-brand-textSecondary">{summaries.length} profesores activos</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((sum) => {
          const h = Math.floor(sum.totalMinutes / 60);
          const m = sum.totalMinutes % 60;
          return (
            <div
              key={sum.userId}
              className="p-4 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h5 className="font-extrabold text-base text-brand-textPrimary truncate">{sum.teacherName}</h5>
                  {sum.teacherDni && (
                    <span className="text-xs font-mono text-brand-textSecondary">DNI {sum.teacherDni}</span>
                  )}
                </div>
                <div className="w-9 h-9 rounded-xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primaryText shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-brand-border/60">
                <div className="bg-brand-bg p-2.5 rounded-xl border border-brand-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary block mb-0.5">
                    Tiempo Total
                  </span>
                  <span className="text-lg font-black text-brand-textPrimary flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#10B981]" />
                    {h}h {m}m
                  </span>
                </div>

                <div className="bg-brand-bg p-2.5 rounded-xl border border-brand-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary block mb-0.5">
                    Decimal / Turnos
                  </span>
                  <span className="text-lg font-black text-brand-primaryText">
                    {sum.totalHours} <span className="text-xs font-normal text-brand-textSecondary">hrs ({sum.shiftCount})</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
