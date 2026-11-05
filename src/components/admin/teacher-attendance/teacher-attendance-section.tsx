"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Clock, RefreshCw } from "lucide-react";
import type { TeacherShiftItem, ProfessorAccountItem } from "@/types";
import { getTeacherShiftsAction } from "@/actions/shifts-admin.actions";
import { listProfessorAccounts } from "@/actions/accounts.actions";
import { useShiftsAutoClose } from "@/hooks/use-shifts-auto-close";
import { TeacherHoursSummary } from "./teacher-hours-summary";
import { TeacherShiftsTable } from "./teacher-shifts-table";
import { ManualShiftModal } from "./manual-shift-modal";

export function TeacherAttendanceSection() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [shifts, setShifts] = useState<TeacherShiftItem[]>([]);
  const [professors, setProfessors] = useState<ProfessorAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
      const [shiftsRes, profsRes] = await Promise.all([
        getTeacherShiftsAction({ startDate: start, endDate: end }),
        listProfessorAccounts(),
      ]);
      if (shiftsRes.success && shiftsRes.data) setShifts(shiftsRes.data);
      if (profsRes.success && profsRes.data) setProfessors(profsRes.data);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useShiftsAutoClose(() => void loadData());

  const activeTeacherIds = shifts.filter((s) => !s.checkOut).map((s) => s.userId);
  const activeCount = activeTeacherIds.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#17171C] border border-[#2C2D35]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A909A] block mb-1">
            Gestión y Liquidación
          </span>
          <h3 className="text-xl font-extrabold text-[#F4F5F7] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#F95716]" /> Asistencia de Profesores
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] text-sm text-[#F4F5F7]">
            <Calendar className="w-4 h-4 text-[#8A909A]" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm text-[#F4F5F7] focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            title="Actualizar turnos"
            className="p-2.5 rounded-xl border border-[#2C2D35] bg-[#0B0B0C] hover:bg-[#23232A] text-[#8A909A] hover:text-[#F4F5F7] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#F95716]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="min-h-[44px] px-4 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F95716]/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Fichar Profesor Manualmente</span>
          </button>
        </div>
      </div>

      <TeacherHoursSummary shifts={shifts} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#8A909A]">
            Historial de Turnos ({shifts.length})
          </h4>
          {activeCount > 0 && (
            <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              {activeCount} {activeCount === 1 ? "profesor en curso" : "profesores en curso"}
            </span>
          )}
        </div>
        <TeacherShiftsTable shifts={shifts} onChanged={() => void loadData()} />
      </div>

      <ManualShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => void loadData()}
        professors={professors}
        activeTeacherIds={activeTeacherIds}
      />
    </div>
  );
}
