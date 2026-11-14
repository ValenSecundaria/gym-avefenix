"use client";

import React, { useState } from "react";
import { User, Check, AlertCircle, Clock } from "lucide-react";
import type { CheckInVerificationResult } from "@/types";
import { StatusBanner } from "./StatusBanner";
import { MemberPhotoImg } from "@/components/ui/MemberPhotoImg";

interface MemberResultCardProps {
  result: CheckInVerificationResult;
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function MemberResultCard({ result }: MemberResultCardProps) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const showPhoto = Boolean(result.photoUrl && failedPhotoUrl !== result.photoUrl);

  const ringClass =
    result.status === "HABILITADO"
      ? "ring-8 ring-[#10B981]/15"
      : result.status === "CUOTA_VENCIDA"
        ? "ring-8 ring-brand-alert/20"
        : "ring-8 ring-brand-warning/20";

  const cornerBadgeClass =
    result.status === "HABILITADO"
      ? "bg-[#10B981] text-brand-bg"
      : result.status === "CUOTA_VENCIDA"
        ? "bg-brand-alert text-brand-textPrimary"
        : "bg-brand-warning text-brand-bg";

  const CornerIcon =
    result.status === "HABILITADO" ? Check : result.status === "CUOTA_VENCIDA" ? AlertCircle : Clock;

  return (
    <div className="w-full bg-brand-surface border border-brand-border rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center transition-all">
      {/* 1. Foto de perfil circular con badge de estado en esquina (Stitch Screen 1) */}
      <div className="relative mb-6">
        <div
          className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-brand-border bg-brand-surfaceHover flex items-center justify-center shadow-2xl ${ringClass}`}
        >
          {showPhoto && result.photoUrl ? (
            <MemberPhotoImg
              memberId={result.memberId}
              src={result.photoUrl}
              alt={`Foto de ${result.fullName}`}
              className="w-full h-full object-cover object-top"
              onError={() => setFailedPhotoUrl(result.photoUrl)}
            />
          ) : (
            <div className="flex items-center justify-center text-brand-textSecondary">
              {result.fullName ? (
                <span className="text-4xl sm:text-5xl font-extrabold text-brand-textPrimary">
                  {getInitials(result.fullName)}
                </span>
              ) : (
                <User className="w-16 h-16 text-brand-textSecondary" />
              )}
            </div>
          )}
        </div>
        <div
          className={`absolute bottom-2 right-2 w-11 h-11 rounded-full flex items-center justify-center border-4 border-brand-surface shadow-lg ${cornerBadgeClass}`}
        >
          <CornerIcon className="w-6 h-6 stroke-[2.8]" />
        </div>
      </div>

      {/* 2. Nombre y Apellido */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-textPrimary tracking-tight mb-1.5">
        {result.fullName}
      </h2>

      {/* 3. Número de DNI */}
      <p className="font-semibold text-xl sm:text-2xl md:text-3xl text-brand-textSecondary tracking-wider font-mono mb-8">
        DNI: {result.dni}
      </p>

      {/* 4. Banner de Estado (HABILITADO / CUOTA_VENCIDA / LIMITE_ALCANZADO) */}
      <StatusBanner
        status={result.status}
        planName={result.planName}
        daysUsedThisWeek={result.daysUsedThisWeek}
        allowedDaysPerWeek={result.allowedDaysPerWeek}
        limitReason={result.limitReason}
      />

    </div>
  );
}
