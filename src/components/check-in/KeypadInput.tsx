"use client";

import React from "react";
import { Delete, CornerDownLeft, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { CheckInKey } from "@/lib/screens/broadcast-channel";

interface KeypadInputProps {
  value: string;
  onKey: (key: CheckInKey) => void;
  isLoading?: boolean;
  error?: string | null;
}

const KEYS: CheckInKey[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const DNI_MIN_LENGTH = 6;
export const DNI_MAX_LENGTH = 8;

// Los botones no toman foco: así el Enter del teclado nunca "aprieta" el último botón tocado.
const noFocus = {
  tabIndex: -1,
  onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
};

/**
 * Visor del DNI + teclado en pantalla. No es un <input>: las teclas se escuchan a nivel ventana
 * (y llegan reenviadas desde el panel), por eso nunca "pierde el foco".
 */
export function KeypadInput({ value, onKey, isLoading = false, error = null }: KeypadInputProps) {
  const isValidLength = value.length >= DNI_MIN_LENGTH && value.length <= DNI_MAX_LENGTH;

  return (
    <div className="w-full bg-[#17171C] border border-[#2C2D35] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-4">
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-[#F4F5F7]">
          Escribí tu <span className="text-[#F95716]">DNI</span>
        </p>
        <p className="text-base sm:text-lg text-[#8A909A] mt-1">Solo números, sin puntos</p>
      </div>

      <div
        role="textbox"
        aria-readonly="true"
        aria-label="Número de DNI"
        aria-live="polite"
        className={`relative w-full h-24 sm:h-28 overflow-hidden rounded-2xl border-4 flex items-center justify-center bg-[#0B0B0C] transition-colors ${
          error ? "border-[#D92614]" : "border-[#F95716] shadow-[0_0_0_6px_rgba(249,87,22,0.15)]"
        } ${isLoading ? "opacity-60" : ""}`}
      >
        {value ? (
          <span className="font-mono font-extrabold text-5xl sm:text-6xl tracking-[0.15em] text-[#F4F5F7]">
            {value}
          </span>
        ) : (
          <span className="font-mono font-extrabold text-3xl sm:text-4xl tracking-[0.2em] text-[#2C2D35]">
            ••••••••
          </span>
        )}
        {!isLoading && value.length < DNI_MAX_LENGTH && (
          <span aria-hidden="true" className="w-1 h-12 sm:h-14 ml-1 bg-[#F95716] rounded-full animate-pulse" />
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-[#D92614] text-white text-lg sm:text-xl font-bold"
        >
          <AlertCircle className="w-8 h-8 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((digit) => (
          <button
            key={digit}
            type="button"
            {...noFocus}
            disabled={isLoading || value.length >= DNI_MAX_LENGTH}
            onClick={() => onKey(digit)}
            className="min-h-[64px] sm:min-h-[72px] rounded-2xl bg-[#23232A] hover:bg-[#2C2D35] active:scale-[0.97] border-2 border-[#2C2D35] text-3xl sm:text-4xl font-extrabold text-[#F4F5F7] transition-all disabled:opacity-40 cursor-pointer"
          >
            {digit}
          </button>
        ))}

        <button
          type="button"
          {...noFocus}
          disabled={isLoading || value.length === 0}
          onClick={() => onKey("Clear")}
          className="min-h-[64px] sm:min-h-[72px] rounded-2xl bg-[#0B0B0C] hover:bg-[#23232A] border-2 border-[#2C2D35] text-base font-bold text-[#8A909A] hover:text-[#F4F5F7] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer disabled:opacity-40"
        >
          <RotateCcw className="w-6 h-6" />
          <span>Limpiar</span>
        </button>

        <button
          type="button"
          {...noFocus}
          disabled={isLoading || value.length >= DNI_MAX_LENGTH}
          onClick={() => onKey("0")}
          className="min-h-[64px] sm:min-h-[72px] rounded-2xl bg-[#23232A] hover:bg-[#2C2D35] active:scale-[0.97] border-2 border-[#2C2D35] text-3xl sm:text-4xl font-extrabold text-[#F4F5F7] transition-all cursor-pointer disabled:opacity-40"
        >
          0
        </button>

        <button
          type="button"
          {...noFocus}
          disabled={isLoading || value.length === 0}
          onClick={() => onKey("Backspace")}
          className="min-h-[64px] sm:min-h-[72px] rounded-2xl bg-[#0B0B0C] hover:bg-[#23232A] border-2 border-[#2C2D35] text-base font-bold text-[#8A909A] hover:text-[#F4F5F7] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer disabled:opacity-40"
        >
          <Delete className="w-6 h-6" />
          <span>Borrar</span>
        </button>
      </div>

      <button
        type="button"
        {...noFocus}
        disabled={isLoading || !isValidLength}
        onClick={() => onKey("Enter")}
        className="w-full min-h-[76px] rounded-2xl bg-[#10B981] hover:bg-[#10B981]/90 active:scale-[0.99] text-white font-extrabold text-2xl uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-[#10B981]/25 transition-all disabled:bg-[#23232A] disabled:text-[#8A909A] disabled:shadow-none cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Verificando...</span>
          </>
        ) : (
          <>
            <span>Entrar</span>
            <CornerDownLeft className="w-7 h-7" />
          </>
        )}
      </button>
      <p className="text-center text-sm sm:text-base text-[#8A909A]">
        Al terminar apretá <kbd className="bg-[#2C2D35] text-[#F4F5F7] font-mono font-bold px-2 py-0.5 rounded">ENTER</kbd>
      </p>
    </div>
  );
}
