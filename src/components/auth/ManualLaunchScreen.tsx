import React from "react";
import { Flame, Loader2 } from "lucide-react";

interface ManualLaunchScreenProps {
  isLoading: boolean;
  onLaunch: () => void;
}

export function ManualLaunchScreen({ isLoading, onLaunch }: ManualLaunchScreenProps) {
  return (
    <div className="w-full max-w-md bg-[#17171C] border border-[#2C2D35] rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#F95716] flex items-center justify-center shadow-lg shadow-[#F95716]/30 mb-4">
          <Flame className="w-8 h-8 text-[#F4F5F7]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#F4F5F7] uppercase tracking-tight">
          Iniciando <span className="text-[#F95716]">Sistema...</span>
        </h1>
        <p className="text-sm text-[#8A909A] mt-1">
          Sesión validada. Haz clic para desplegar el monitor de Check-In y acceder a recepción.
        </p>
      </div>

      <button
        type="button"
        onClick={onLaunch}
        disabled={isLoading}
        className="w-full min-h-[48px] rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-[#F4F5F7] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#F95716]/25 transition-all cursor-pointer disabled:opacity-50"
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
