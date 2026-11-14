"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Loader2, AlertCircle } from "lucide-react";
import type { ProfessorAccountItem } from "@/types";
import { manualShiftAction } from "@/actions/shifts-admin.actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  professors: ProfessorAccountItem[];
  activeTeacherIds?: string[];
}

export function ManualShiftModal({ isOpen, onClose, onSaved, professors, activeTeacherIds = [] }: Props) {
  const activeSet = new Set(activeTeacherIds);
  const available = professors.filter((p) => !activeSet.has(p.id));
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(today);
  const [inTime, setInTime] = useState(currentTime);
  const [outTime, setOutTime] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (available.length > 0 && (!userId || activeSet.has(userId))) setUserId(available[0].id);
  }, [professors, activeTeacherIds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError("Seleccioná un profesor");
    if (activeSet.has(userId)) return setError("El profesor ya tiene un turno abierto en el gimnasio");
    const inDateTime = new Date(`${date}T${inTime}:00`);
    if (inDateTime.getTime() > Date.now()) return setError("El horario de ingreso debe ser anterior a la hora actual");

    setError(null);
    setLoading(true);
    try {
      const inIso = inDateTime.toISOString();
      const outIso = leaveOpen || !outTime ? null : new Date(`${date}T${outTime}:00`).toISOString();
      const res = await manualShiftAction({ userId, checkIn: inIso, checkOut: outIso, notes: notes.trim() || undefined });
      if (!res.success) return setError(res.error || "No se pudo guardar el turno");
      onSaved();
      onClose();
    } catch {
      setError("Error al comunicarse con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full min-h-[44px] px-3.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-textPrimary focus:border-brand-primary focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-brand-surface border border-brand-border p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <h3 className="text-lg font-black text-brand-textPrimary flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-primaryText" /> Fichar Profesor Manualmente
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-brand-alert/15 border border-brand-alert text-xs font-bold text-brand-textPrimary flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-alertText shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-textSecondary mb-1">Profesor</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className={inputCls} disabled={available.length === 0}>
              <option value="" disabled>Elegí un profesor...</option>
              {professors.map((p) => {
                const inGym = activeSet.has(p.id);
                return (
                  <option key={p.id} value={p.id} disabled={inGym}>
                    {p.name} {p.dni ? `(DNI: ${p.dni})` : ""} {inGym ? "• En turno (solo se puede marcar la salida)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-brand-textSecondary mb-1">Fecha</label>
            <input type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textSecondary mb-1">Hora Entrada</label>
              <input type="time" max={date === today ? currentTime : undefined} value={inTime} onChange={(e) => setInTime(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textSecondary mb-1">Hora Salida</label>
              <input type="time" value={outTime} onChange={(e) => setOutTime(e.target.value)} disabled={leaveOpen} required={!leaveOpen} className={`${inputCls} ${leaveOpen ? "opacity-30 cursor-not-allowed" : ""}`} />
            </div>
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-bg border border-brand-border cursor-pointer">
            <input type="checkbox" checked={leaveOpen} onChange={(e) => setLeaveOpen(e.target.checked)} className="w-4 h-4 rounded text-brand-primary focus:ring-0 cursor-pointer" />
            <span className="text-xs font-bold text-brand-textPrimary">
              Dejar salida en espera <span className="text-brand-textSecondary font-normal">(marcar salida después)</span>
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
            <button type="button" onClick={onClose} className="min-h-[42px] px-4 rounded-xl border border-brand-border text-sm font-bold text-brand-textSecondary hover:bg-brand-surfaceHover cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={loading || available.length === 0} className="min-h-[42px] px-5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover hover:text-brand-bg text-white text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{leaveOpen ? "Fichar Ingreso (En Espera)" : "Registrar Turno"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
