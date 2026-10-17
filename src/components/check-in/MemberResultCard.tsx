"use client";

import React, { useState } from "react";
import { User, Check, AlertCircle, Clock } from "lucide-react";
import type { CheckInVerificationResult } from "@/types";
import { StatusBanner } from "./StatusBanner";

interface MemberResultCardProps {
  result: CheckInVerificationResult;
  remainingSeconds?: number | null;
  totalAlertSeconds?: number;
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function MemberResultCard({
  result,
  remainingSeconds = null,
  totalAlertSeconds = 60,
}: MemberResultCardProps) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const showPhoto = Boolean(result.photoUrl && failedPhotoUrl !== result.photoUrl);

  const ringClass =
    result.status === "HABILITADO"
      ? "ring-8 ring-[#10B981]/15"
      : result.status === "CUOTA_VENCIDA"
        ? "ring-8 ring-[#D92614]/20"
        : "ring-8 ring-[#FFB300]/20";

  const cornerBadgeClass =
    result.status === "HABILITADO"
      ? "bg-[#10B981] text-[#F4F5F7]"
      : result.status === "CUOTA_VENCIDA"
        ? "bg-[#D92614] text-[#F4F5F7]"
        : "bg-[#FFB300] text-[#0B0B0C]";

  const CornerIcon =
    result.status === "HABILITADO" ? Check : result.status === "CUOTA_VENCIDA" ? AlertCircle : Clock;

  const progressPercent =
    typeof remainingSeconds === "number" && totalAlertSeconds > 0
      ? Math.max(0, Math.min(100, (remainingSeconds / totalAlertSeconds) * 100))
      : null;

  return (
    <div className="w-full bg-[#17171C] border border-[#2C2D35] rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center transition-all">
      {/* 1. Foto de perfil circular con badge de estado en esquina (Stitch Screen 1) */}
      <div className="relative mb-6">
        <div
          className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-[#2C2D35] bg-[#23232A] flex items-center justify-center shadow-2xl ${ringClass}`}
        >
          {showPhoto && result.photoUrl ? (
            <img
              src={result.photoUrl}
              alt={`Foto de ${result.fullName}`}
              className="w-full h-full object-cover object-top"
              onError={() => setFailedPhotoUrl(result.photoUrl)}
            />
          ) : (
            <div className="flex items-center justify-center text-[#8A909A]">
              {result.fullName ? (
                <span className="text-4xl sm:text-5xl font-extrabold text-[#F4F5F7]">
                  {getInitials(result.fullName)}
                </span>
              ) : (
                <User className="w-16 h-16 text-[#8A909A]" />
              )}
            </div>
          )}
        </div>
        <div
          className={`absolute bottom-2 right-2 w-11 h-11 rounded-full flex items-center justify-center border-4 border-[#17171C] shadow-lg ${cornerBadgeClass}`}
        >
          <CornerIcon className="w-6 h-6 stroke-[2.8]" />
        </div>
      </div>

      {/* 2. Nombre y Apellido */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F4F5F7] tracking-tight mb-1.5">
        {result.fullName}
      </h2>

      {/* 3. Número de DNI */}
      <p className="font-semibold text-xl sm:text-2xl md:text-3xl text-[#8A909A] tracking-wider font-mono mb-8">
        DNI: {result.dni}
      </p>

      {/* 4. Banner de Estado (HABILITADO / CUOTA_VENCIDA / LIMITE_ALCANZADO) */}
      <StatusBanner
        status={result.status}
        planName={result.planName}
        daysUsedThisWeek={result.daysUsedThisWeek}
        allowedDaysPerWeek={result.allowedDaysPerWeek}
      />

      {/* Temporizador de 60s para alertas */}
      {typeof remainingSeconds === "number" && remainingSeconds > 0 && (
        <div className="w-full mt-6 pt-4 border-t border-[#2C2D35]/70 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#8A909A]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F95716]" />
              Reinicia automáticamente en
            </span>
            <span className="font-mono font-bold text-[#F4F5F7]">{remainingSeconds} seg</span>
          </div>
          <div className="w-full h-1.5 bg-[#0B0B0C] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F95716] transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent ?? 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
