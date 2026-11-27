"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, Play, Square, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import type { TeacherShiftItem } from "@/types";
import { getActiveTeacherShiftAction, toggleTeacherShiftAction } from "@/actions/shifts.actions";

export function TeacherShiftToggleCard({
  userId,
  initialShift = null,
}: {
  userId: string;
  initialShift?: TeacherShiftItem | null;
}) {
  const [shift, setShift] = useState<TeacherShiftItem | null>(initialShift);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState("0m");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!initialShift && userId) {
      getActiveTeacherShiftAction(userId).then((res) => res.success && res.data && setShift(res.data));
    }
  }, [userId, initialShift]);

  const updateElapsed = useCallback(() => {
    if (!shift?.checkIn) return;
    const diff = Math.max(0, Date.now() - new Date(shift.checkIn).getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    setElapsed(`${h > 0 ? `${h}h ` : ""}${m}m`);
  }, [shift]);

  useEffect(() => {
    if (!shift) return;
    const kickoff = setTimeout(updateElapsed, 0);
    const interval = setInterval(updateElapsed, 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, [shift, updateElapsed]);

  const handleToggle = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await toggleTeacherShiftAction({ userId, expect: shift ? "CHECK_OUT" : "CHECK_IN" });
      if (!res.success || !res.data) return setFeedback(res.error || "Error al actualizar turno");
      if (res.data.action === "CHECK_IN") {
        setShift(res.data.shift);
        setFeedback("¡Ingreso registrado! Turno en curso.");
      } else if (res.data.action === "ALREADY_ACTIVE") {
        setShift(res.data.shift);
        setFeedback("Ya tenías un turno activo: podés marcar la salida.");
      } else {
        setShift(null);
        const mins = res.data.totalMinutes ?? 0;
        setFeedback(`¡Jornada finalizada! Total: ${Math.floor(mins / 60)}h ${mins % 60}m.`);
      }
    } catch {
      setFeedback("Error de conexión al registrar turno.");
    } finally {
      setLoading(false);
    }
  };

  const inTime = shift
    ? new Date(shift.checkIn).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div
      className={`w-full rounded-lg bg-fx-surface border-2 border-fx-border border-l-4 p-5 shadow-md flex flex-col gap-4 ${
        shift ? "border-l-[#10B981]" : "border-l-fx-orange"
      }`}
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-fx-border">
        <div>
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-fx-muted block">
            RELOJ DE TURNO DOCENTE
          </span>
          <h2 className="text-lg font-black uppercase tracking-tight text-fx-text flex items-center gap-2 mt-1">
            <Clock className="w-5 h-5 text-fx-orangeText shrink-0" />
            <span>{shift ? "Turno Activo" : "Fuera de Turno"}</span>
          </h2>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-xs font-extrabold uppercase ${
            shift
              ? "bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981]"
              : "bg-fx-base border border-fx-border text-fx-muted"
          }`}
        >
          {shift && <span className="w-2 h-2 bg-[#10B981] animate-pulse" />}
          <span>{shift ? "EN SALA" : "INACTIVO"}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-md bg-fx-base border border-fx-border font-mono">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-fx-muted block">Entrada</span>
          <span className="text-lg font-black text-fx-text">{inTime} hs</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-fx-muted block">Tiempo</span>
          <span className={`text-lg font-black ${shift ? "text-[#10B981]" : "text-fx-muted"}`}>
            {shift ? elapsed : "0m"}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="p-3 rounded-md bg-fx-base border border-fx-border text-sm font-semibold text-fx-text flex items-center gap-2"
        >
          {shift ? (
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-fx-orangeText shrink-0" />
          )}
          <span>{feedback}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`w-full min-h-[52px] px-5 rounded-md font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 ${
          shift
            ? "bg-fx-orange hover:bg-brand-primaryHover text-[#0A0B0D]"
            : "bg-[#10B981] hover:bg-[#10B981]/90 text-[#0A0B0D]"
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : shift ? (
          <Square className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current" />
        )}
        <span>{shift ? "Finalizar Turno / Salida" : "Marcar Entrada al Turno"}</span>
      </button>
    </div>
  );
}
