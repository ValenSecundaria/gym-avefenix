"use client";

import React from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { buildWhatsAppLink, formatCurrencyARS } from "@/lib/utils";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import type { PlanOption } from "@/types";

function planPeriod(p: PlanOption): string {
  return p.category === "DIARIO" ? "/ día" : "/ mes";
}

function planFeatures(p: PlanOption): string[] {
  if (p.category === "DIARIO") return ["Vale para un día de entrenamiento", "Ingreso con tu DNI en la terminal"];
  const frequency =
    p.category === "MENSUAL_DIAS"
      ? `${p.allowedDaysPerWeek} ${p.allowedDaysPerWeek === 1 ? "día" : "días"} por semana a libre elección`
      : "Todos los días, sin límite de frecuencia";
  return [frequency, `Vigencia de ${p.durationDays} días`, "Ingreso con tu DNI en la terminal"];
}

export function PlanCard({ plan, gymPhone }: { plan: PlanOption; gymPhone: string }) {
  const waLink = buildWhatsAppLink(
    gymPhone,
    `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por el plan ${plan.name}${
      plan.disciplineName ? ` de ${plan.disciplineName}` : ""
    } (${formatCurrencyARS(plan.price)}).`
  );
  return (
    <GlowCard
      customSize
      glowColor="orange"
      className="flex flex-col justify-between h-full p-7 rounded-2xl bg-[#17171C]/90 border border-[#2C2D35] hover:border-[#F95716]/60 shadow-lg transition-all"
    >
      <div className="flex flex-col gap-5">
        <h4 className="text-xl font-extrabold text-[#F4F5F7]">{plan.name}</h4>
        <div className="flex items-baseline gap-2 py-4 border-y border-[#2C2D35]">
          <span className="text-4xl font-extrabold tracking-tight text-[#F95716]">{formatCurrencyARS(plan.price)}</span>
          <span className="text-sm font-medium text-[#8A909A]">{planPeriod(plan)}</span>
        </div>
        <ul className="flex flex-col gap-3">
          {planFeatures(plan).map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-[#F4F5F7]">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] text-sm font-extrabold uppercase tracking-wider transition-all"
      >
        <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span>Consultar</span>
      </a>
    </GlowCard>
  );
}
