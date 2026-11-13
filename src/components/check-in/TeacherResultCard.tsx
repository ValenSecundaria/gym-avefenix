"use client";

import React from "react";
import { CheckCircle2, Clock, GraduationCap, Sparkles } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import type { ToggleShiftResult } from "@/types";

interface TeacherResultCardProps {
  result: ToggleShiftResult;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatDuration(totalMinutes?: number | null): string {
  const mins = totalMinutes ?? 0;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} h`;
  return `${hours}h ${remaining}m`;
}

export function TeacherResultCard({ result }: TeacherResultCardProps) {
  // "Ya en turno" (DNI repetido enseguida) se muestra como turno activo: no se registró otra entrada.
  const alreadyActive = result.action === "ALREADY_ACTIVE";
  const isCheckIn = result.action === "CHECK_IN" || alreadyActive;
  const inTime = formatTime(result.shift.checkIn);
  const outTime = result.shift.checkOut ? formatTime(result.shift.checkOut) : null;

  return (
    <div
      role="alert"
      className="w-full max-w-xl mx-auto rounded-3xl bg-[#17171C] border-2 border-[#2C2D35] p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
    >
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 border-4 ${
          isCheckIn
            ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981] shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            : "bg-[#F95716]/20 border-[#F95716] text-[#F95716] shadow-[0_0_30px_rgba(249,87,22,0.35)]"
        }`}
      >
        <GraduationCap className="w-12 h-12" />
      </div>

      <div
        className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-black text-lg sm:text-xl uppercase tracking-wider mb-5 ${
          isCheckIn ? "bg-[#10B981] text-white" : "bg-[#F95716] text-white"
        }`}
      >
        {isCheckIn ? <CheckCircle2 className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        <span>
          {alreadyActive ? "Ya estás en turno" : isCheckIn ? "¡Hola Profe! Ingreso Registrado" : "¡Jornada Finalizada!"}
        </span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-[#F4F5F7] tracking-tight mb-2">
        {result.teacherName}
      </h2>
      <span className="text-sm font-bold uppercase tracking-widest text-[#8A909A] mb-6">
        Profesor / Equipo {GYM_BRAND_CONFIG.identity.name}
      </span>

      <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-[#2C2D35]">
        <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] text-left">
          <span className="text-xs font-bold uppercase text-[#8A909A] block mb-1">
            Hora de Entrada
          </span>
          <span className="text-lg font-black text-[#F4F5F7]">{inTime} hs</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] text-left">
          <span className="text-xs font-bold uppercase text-[#8A909A] block mb-1">
            {isCheckIn ? "Estado" : "Tiempo Trabajado"}
          </span>
          {isCheckIn ? (
            <span className="text-lg font-black text-[#10B981] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              Turno Activo
            </span>
          ) : (
            <span className="text-lg font-black text-[#F95716] flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDuration(result.totalMinutes)}
            </span>
          )}
        </div>
      </div>

      {alreadyActive && (
        <div className="mt-4 text-xs font-semibold text-[#8A909A]">
          No se registró otra entrada. Para marcar la salida, ingresá tu DNI al terminar.
        </div>
      )}

      {!isCheckIn && outTime && (
        <div className="mt-4 text-xs font-semibold text-[#8A909A]">
          Salida registrada a las <span className="text-[#F4F5F7] font-bold">{outTime} hs</span>
        </div>
      )}
    </div>
  );
}
