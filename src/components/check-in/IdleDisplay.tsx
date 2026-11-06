import React from "react";
import { Flame, Monitor, ShieldCheck } from "lucide-react";

export function IdleDisplay() {
  return (
    <div className="w-full bg-[#17171C] border border-[#2C2D35] rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-[#0B0B0C] text-[#F95716] flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(249,87,22,0.3)] border border-[#2C2D35]">
        <Flame className="w-9 h-9" aria-hidden="true" />
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F5F7] tracking-tight mb-3">
        ¡Hola! Bienvenido
      </h2>

      <p className="text-[#8A909A] text-base sm:text-lg max-w-md mb-8">
        Por favor registrá tu ingreso en el molinete de Ave Fénix escribiendo tu número de DNI.
      </p>

      <div className="flex items-center justify-center gap-2.5 text-[#8A909A] text-sm sm:text-base font-medium mb-6">
        <Monitor className="w-5 h-5 text-[#F95716] shrink-0" aria-hidden="true" />
        <span>Escribí tu DNI en el teclado numérico y presioná</span>
        <kbd className="bg-[#2C2D35] text-[#F4F5F7] font-mono font-bold px-2.5 py-1 rounded text-xs">
          ENTER
        </kbd>
      </div>

      <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#8A909A] bg-[#0B0B0C] px-4 py-2 rounded-full border border-[#2C2D35]">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
        <span>Verificación instantánea de cuota y asistencias semanales</span>
      </div>
    </div>
  );
}
