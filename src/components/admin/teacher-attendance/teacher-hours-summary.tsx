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
      <div className="p-6 rounded-2xl bg-[#17171C] border border-[#2C2D35] text-center text-sm text-[#8A909A]">
        No hay horas registradas en el período seleccionado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#8A909A] flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#F95716]" />
          Liquidación de Horas por Profesor
        </h4>
        <span className="text-xs text-[#8A909A]">{summaries.length} profesores activos</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((sum) => {
          const h = Math.floor(sum.totalMinutes / 60);
          const m = sum.totalMinutes % 60;
          return (
            <div
              key={sum.userId}
              className="p-4 rounded-2xl bg-[#17171C] border border-[#2C2D35] hover:border-[#F95716]/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h5 className="font-extrabold text-base text-[#F4F5F7] truncate">{sum.teacherName}</h5>
                  {sum.teacherDni && (
                    <span className="text-xs font-mono text-[#8A909A]">DNI {sum.teacherDni}</span>
                  )}
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#F95716]/15 border border-[#F95716]/30 flex items-center justify-center text-[#F95716] shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#2C2D35]/60">
                <div className="bg-[#0B0B0C] p-2.5 rounded-xl border border-[#2C2D35]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A909A] block mb-0.5">
                    Tiempo Total
                  </span>
                  <span className="text-lg font-black text-[#F4F5F7] flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#10B981]" />
                    {h}h {m}m
                  </span>
                </div>

                <div className="bg-[#0B0B0C] p-2.5 rounded-xl border border-[#2C2D35]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A909A] block mb-0.5">
                    Decimal / Turnos
                  </span>
                  <span className="text-lg font-black text-[#F95716]">
                    {sum.totalHours} <span className="text-xs font-normal text-[#8A909A]">hrs ({sum.shiftCount})</span>
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
