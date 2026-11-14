import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

interface ManualLaunchScreenProps {
  isLoading: boolean;
  onLaunch: () => void;
}

export function ManualLaunchScreen({ isLoading, onLaunch }: ManualLaunchScreenProps) {
  return (
    <div className="w-full max-w-md bg-[#17171C] border border-[#2C2D35] rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-primary flex items-center justify-center shadow-[0_8px_24px_rgba(0,87,217,0.3)] mb-4">
          <Image
            src={GYM_BRAND_CONFIG.assets.logoLogin}
            alt={GYM_BRAND_CONFIG.identity.shortName}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-[#F4F5F7] uppercase tracking-tight">
          Iniciando <span className="text-brand-primaryText">Sistema...</span>
        </h1>
        <p className="text-sm text-[#8A909A] mt-1">
          Sesión validada. Haz clic para desplegar el monitor de Check-In y acceder a recepción.
        </p>
      </div>

      <button
        type="button"
        onClick={onLaunch}
        disabled={isLoading}
        className="w-full min-h-[48px] rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,87,217,0.25)] transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Desplegando...</span>
          </>
        ) : (
          <span>Lanzar Pantallas</span>
        )}
      </button>
    </div>
  );
}
