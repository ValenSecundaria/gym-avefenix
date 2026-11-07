"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, Play, Square, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import type { TeacherShiftItem } from "@/types";
import { getActiveTeacherShiftAction, toggleTeacherShiftAction } from "@/actions/shifts.actions";

export function TeacherShiftToggleCard({ userId, initialShift = null }: { userId: string; initialShift?: TeacherShiftItem | null }) {
  const [shift, setShift] = useState<TeacherShiftItem | null>(initialShift);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState("");
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
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [shift, updateElapsed]);

  const handleToggle = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      // expect: si el turno ya cambió en otro lado (teclado del molinete, otra pestaña), no se invierte.
      const res = await toggleTeacherShiftAction({ userId, expect: shift ? "CHECK_OUT" : "CHECK_IN" });
      if (!res.success || !res.data) return setFeedback(res.error || "Error al actualizar turno");
      if (res.data.action === "CHECK_IN") {
        setShift(res.data.shift);
        setFeedback("¡Ingreso registrado! Turno en curso.");
      } else if (res.data.action === "ALREADY_ACTIVE") {
        setShift(res.data.shift);
        setFeedback("Ya tenías un turno activo: no se registró otra entrada. Podés marcar la salida.");
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

  const inTime = shift ? new Date(shift.checkIn).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="w-full rounded-2xl bg-[#17171C] border border-[#2C2D35] p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A909A] block mb-1">Control de Asistencia</span>
          <h3 className="text-lg font-black text-[#F4F5F7] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F95716]" /> ¿Estás trabajando ahora?
          </h3>
        </div>
        {shift ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-xs font-black text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Turno activo • desde {inTime} hs ({elapsed})
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#2C2D35]/50 text-xs font-bold text-[#8A909A]">
            Fuera de turno
          </span>
        )}
      </div>

      {feedback && (
        <div role="status" className="mb-4 p-3 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] text-xs font-bold text-[#F4F5F7] flex items-center gap-2">
          {shift ? <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> : <Sparkles className="w-4 h-4 text-[#F95716]" />}
          <span>{feedback}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`w-full min-h-[48px] px-6 rounded-xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 ${
          shift ? "bg-[#F95716] hover:bg-[#EA580C] shadow-lg shadow-[#F95716]/25" : "bg-[#10B981] hover:bg-[#059669] shadow-lg shadow-[#10B981]/25"
        }`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : shift ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        <span>{shift ? "Turno activo • Marcar salida" : "Marcar entrada al gimnasio"}</span>
      </button>
    </div>
  );
}
