"use client";

import React, { useState } from "react";
import { Trash2, Loader2, Square } from "lucide-react";
import type { TeacherShiftItem } from "@/types";
import { deleteShiftAction, closeTeacherShiftAction } from "@/actions/shifts-admin.actions";

interface Props {
  shifts: TeacherShiftItem[];
  onChanged: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function formatDuration(mins: number | null): string {
  if (mins === null || mins === undefined) return "En curso...";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m (${(mins / 60).toFixed(1)} hrs)`;
}

export function TeacherShiftsTable({ shifts, onChanged }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleCloseShift = async (s: TeacherShiftItem) => {
    if (!window.confirm(`¿Marcar la salida de ${s.teacherName} ahora?`)) return;
    setBusyId(s.id);
    try {
      const res = await closeTeacherShiftAction(s.id);
      if (res.success) onChanged();
      else alert(res.error || "No se pudo cerrar el turno");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (s: TeacherShiftItem) => {
    if (!window.confirm(`¿Eliminar el registro de ${s.teacherName} del ${formatDate(s.checkIn)}?`)) return;
    setBusyId(s.id);
    try {
      const res = await deleteShiftAction(s.id);
      if (res.success) onChanged();
      else alert(res.error || "No se pudo eliminar el turno");
    } finally {
      setBusyId(null);
    }
  };

  if (shifts.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-brand-textSecondary rounded-2xl bg-brand-surface border border-brand-border">
        No hay turnos registrados en este período.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-border bg-brand-surface">
      <table className="w-full text-left text-sm text-brand-textPrimary">
        <thead className="bg-brand-bg border-b border-brand-border text-xs uppercase tracking-wider text-brand-textSecondary">
          <tr>
            <th className="py-3.5 px-4">Fecha</th>
            <th className="py-3.5 px-4">Profesor</th>
            <th className="py-3.5 px-4">Entrada</th>
            <th className="py-3.5 px-4">Salida</th>
            <th className="py-3.5 px-4">Total</th>
            <th className="py-3.5 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {shifts.map((s) => {
            const isBusy = busyId === s.id;
            return (
              <tr key={s.id} className="hover:bg-brand-surfaceHover transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs">{formatDate(s.checkIn)}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-brand-textPrimary block">{s.teacherName}</span>
                  {s.notes && <span className="text-xs text-brand-textSecondary italic block">{s.notes}</span>}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-[#10B981]">{formatTime(s.checkIn)} hs</td>
                <td className="py-3.5 px-4 font-mono">
                  {s.checkOut ? (
                    <span className="text-brand-textPrimary font-bold">{formatTime(s.checkOut)} hs</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCloseShift(s)}
                      disabled={isBusy}
                      className="min-h-[34px] px-2.5 rounded-lg bg-brand-primary hover:bg-brand-primaryHover hover:text-brand-bg text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/20 disabled:opacity-40"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3 h-3 fill-current" />}
                      <span>Marcar Salida</span>
                    </button>
                  )}
                </td>
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-brand-primaryText">
                  {formatDuration(s.totalMinutes)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    disabled={isBusy}
                    title="Eliminar registro"
                    className="p-2 rounded-lg text-brand-textSecondary hover:text-brand-alertText hover:bg-brand-alert/10 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
