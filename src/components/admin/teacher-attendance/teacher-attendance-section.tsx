"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Clock, Loader2, RefreshCw, Square } from "lucide-react";
import type { TeacherShiftItem, ProfessorAccountItem } from "@/types";
import { closeTeacherShiftAction, getActiveShiftsAction, getTeacherShiftsAction } from "@/actions/shifts-admin.actions";
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
  // Turnos abiertos de cualquier fecha (no solo los del mes elegido): quién está "En turno" ahora.
  const [activeShifts, setActiveShifts] = useState<TeacherShiftItem[]>([]);
  const [closingId, setClosingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
      const [shiftsRes, profsRes, activeRes] = await Promise.all([
        getTeacherShiftsAction({ startDate: start, endDate: end }),
        listProfessorAccounts(),
        getActiveShiftsAction(),
      ]);
      if (activeRes.success && activeRes.data) setActiveShifts(activeRes.data);
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

  const activeTeacherIds = activeShifts.map((s) => s.userId);

  const handleCheckOut = async (s: TeacherShiftItem) => {
    setClosingId(s.id);
    try {
      const res = await closeTeacherShiftAction(s.id);
      if (!res.success) alert(res.error || "No se pudo marcar la salida");
      await loadData();
    } finally {
      setClosingId(null);
    }
  };

  const activeCount = activeTeacherIds.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-brand-surface border border-brand-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary block mb-1">
            Gestión y Liquidación
          </span>
          <h3 className="text-xl font-extrabold text-brand-textPrimary flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-primaryText" /> Asistencia de Profesores
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-textPrimary">
            <Calendar className="w-4 h-4 text-brand-textSecondary" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm text-brand-textPrimary focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            title="Actualizar turnos"
            className="p-2.5 rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-surfaceHover text-brand-textSecondary hover:text-brand-textPrimary cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-primaryText" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="min-h-[48px] px-4 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Fichar Profesor Manualmente</span>
          </button>
        </div>
      </div>

      {activeShifts.length > 0 && (
        <div className="p-4 rounded-2xl bg-brand-surface border border-[#10B981]/40 space-y-2">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#10B981] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            En turno ahora
          </h4>
          <ul className="flex flex-col gap-2">
            {activeShifts.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-brand-bg border border-brand-border">
                <div className="min-w-0">
                  <span className="font-bold text-brand-textPrimary">{s.teacherName}</span>
                  <span className="ml-2 px-2 py-0.5 rounded-md bg-[#10B981]/15 border border-[#10B981]/40 text-xs font-bold text-[#10B981]">
                    En turno
                  </span>
                  <span className="block text-xs text-brand-textSecondary mt-0.5">
                    Entró {new Date(s.checkIn).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} hs
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCheckOut(s)}
                  disabled={closingId === s.id}
                  className="min-h-[40px] px-4 rounded-xl bg-brand-primary hover:bg-brand-primaryHover hover:text-brand-bg text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {closingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-3.5 h-3.5 fill-current" />}
                  Marcar salida
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TeacherHoursSummary shifts={shifts} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-textSecondary">
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
