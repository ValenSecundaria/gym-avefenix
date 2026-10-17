"use client";

import React, { useRef } from "react";
import { Delete, CornerDownLeft, Loader2, AlertCircle, RotateCcw } from "lucide-react";

interface KeypadInputProps {
  value: string;
  onChange: (newValue: string) => void;
  onSubmit: (dni: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function KeypadInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  error = null,
}: KeypadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isValidLength = value.length >= 6 && value.length <= 8;

  const handleDigit = (digit: string) => {
    if (!isLoading && value.length < 8) onChange(value + digit);
  };

  const handleBackspace = () => {
    if (!isLoading && value.length > 0) onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (isLoading) return;
    onChange("");
    inputRef.current?.focus();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && isValidLength) onSubmit(value);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full bg-[#17171C] border border-[#2C2D35] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5"
    >
      <div className="text-center">
        <label
          htmlFor="checkin-dni-input"
          className="block text-sm font-bold uppercase tracking-wider text-[#F95716] mb-1"
        >
          Puesto de Ingreso • DNI
        </label>
        <p className="text-xs sm:text-sm text-[#8A909A]">
          Ingresá tu número de documento sin puntos (6 a 8 dígitos)
        </p>
      </div>

      <input
        ref={inputRef}
        id="checkin-dni-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        disabled={isLoading}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
        placeholder="Ingresá tu DNI"
        aria-label="Número de DNI"
        className="w-full h-16 sm:h-20 bg-[#0B0B0C] border-2 border-[#2C2D35] focus:border-[#F95716] focus:ring-4 focus:ring-[#F95716]/20 rounded-2xl text-center text-3xl sm:text-4xl font-mono font-extrabold tracking-widest text-[#F4F5F7] placeholder:text-[#2C2D35] placeholder:text-2xl outline-none transition-all disabled:opacity-60"
      />

      {error && (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D92614]/15 border border-[#D92614] text-[#F4F5F7] text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4 text-[#D92614] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={isLoading || value.length >= 8}
            onClick={() => handleDigit(digit)}
            className="min-h-[56px] sm:min-h-[60px] rounded-xl bg-[#23232A] hover:bg-[#2C2D35] active:scale-[0.98] border border-[#2C2D35] text-2xl font-bold text-[#F4F5F7] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F95716] disabled:opacity-40 cursor-pointer"
          >
            {digit}
          </button>
        ))}

        <button
          type="button"
          disabled={isLoading || value.length === 0}
          onClick={handleClear}
          className="min-h-[56px] sm:min-h-[60px] rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] border border-[#2C2D35] text-xs sm:text-sm font-semibold text-[#8A909A] hover:text-[#F4F5F7] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpiar</span>
        </button>

        <button
          type="button"
          disabled={isLoading || value.length >= 8}
          onClick={() => handleDigit("0")}
          className="min-h-[56px] sm:min-h-[60px] rounded-xl bg-[#23232A] hover:bg-[#2C2D35] active:scale-[0.98] border border-[#2C2D35] text-2xl font-bold text-[#F4F5F7] transition-all cursor-pointer disabled:opacity-40"
        >
          0
        </button>

        <button
          type="button"
          disabled={isLoading || value.length === 0}
          onClick={handleBackspace}
          className="min-h-[56px] sm:min-h-[60px] rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] border border-[#2C2D35] text-xs sm:text-sm font-semibold text-[#8A909A] hover:text-[#F4F5F7] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
        >
          <Delete className="w-5 h-5" />
          <span>Borrar</span>
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValidLength}
        className="w-full min-h-[56px] sm:min-h-[60px] rounded-2xl bg-[#F95716] hover:bg-[#F95716]/90 active:scale-[0.99] text-[#F4F5F7] font-extrabold text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-[#F95716]/25 transition-all disabled:opacity-40 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Verificando...</span>
          </>
        ) : (
          <>
            <span>Registrar Ingreso</span>
            <CornerDownLeft className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
