import React from "react";
import Image from "next/image";
import { Monitor, ShieldCheck } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

export function IdleDisplay() {
  return (
    <div className="w-full bg-brand-surface border border-brand-border rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-2xl">
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-bg flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(37,99,235,0.35)] border border-brand-border">
        <Image
          src={GYM_BRAND_CONFIG.assets.logoCheckIn}
          alt={GYM_BRAND_CONFIG.identity.shortName}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textPrimary tracking-tight mb-3">
        ¡Hola! Bienvenido
      </h2>

      <p className="text-brand-textSecondary text-base sm:text-lg max-w-md mb-8">
        Por favor registrá tu ingreso en el molinete de {GYM_BRAND_CONFIG.identity.name} escribiendo tu número de DNI.
      </p>

      <div className="flex items-center justify-center gap-2.5 text-brand-textSecondary text-sm sm:text-base font-medium mb-6">
        <Monitor className="w-5 h-5 text-brand-primaryText shrink-0" aria-hidden="true" />
        <span>Escribí tu DNI en el teclado numérico y presioná</span>
        <kbd className="bg-brand-border text-brand-textPrimary font-mono font-bold px-2.5 py-1 rounded text-xs">
          ENTER
        </kbd>
      </div>

      <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-brand-textSecondary bg-brand-bg px-4 py-2 rounded-full border border-brand-border">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
        <span>Verificación instantánea de cuota y asistencias semanales</span>
      </div>
    </div>
  );
}
