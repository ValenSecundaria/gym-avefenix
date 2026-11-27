"use client";

import React from "react";
import { Check, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsAppLink, formatCurrencyARS } from "@/lib/utils";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import type { PlanOption } from "@/types";

function planPeriod(p: PlanOption): string {
  return p.category === "DIARIO" ? "/ JORNADA" : "/ MES";
}

function planBadge(p: PlanOption): string {
  if (p.category === "DIARIO") return "PASE POR DÍA";
  if (p.category === "MENSUAL_DIAS") return `${p.allowedDaysPerWeek ?? 3}X SEMANA`;
  return "PASE LIBRE";
}

function planFeatures(p: PlanOption): string[] {
  if (p.category === "DIARIO") {
    return ["Acceso completo por 1 jornada", "Habilitación inmediata con DNI en recepción"];
  }
  const frequency =
    p.category === "MENSUAL_DIAS"
      ? `${p.allowedDaysPerWeek} ${p.allowedDaysPerWeek === 1 ? "día" : "días"} por semana a elección`
      : "Acceso libre de lunes a sábados";
  return [frequency, `Vigencia corrida de ${p.durationDays} días`, "Ingreso directo con DNI en mostrador"];
}

export function PlanCard({ plan, gymPhone }: { plan: PlanOption; gymPhone: string }) {
  const cleanPhone = gymPhone.trim();
  const hasWhatsapp = cleanPhone.length > 0;
  const waLink = hasWhatsapp
    ? buildWhatsAppLink(
        cleanPhone,
        GYM_BRAND_CONFIG.messages.generalInquiry({
          planName: `${plan.name}${plan.disciplineName ? ` (${plan.disciplineName})` : ""}`,
          price: formatCurrencyARS(plan.price),
        })
      )
    : "";

  return (
    <article className="flex flex-col justify-between h-full p-6 rounded-lg bg-brand-surface border border-brand-border border-l-4 border-l-brand-primary hover:border-brand-primary/80 shadow-lg transition-all">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-brand-primaryText">
              {plan.disciplineName || GYM_BRAND_CONFIG.identity.shortName}
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-brand-bg border border-brand-border font-mono text-[11px] font-bold text-brand-textSecondary">
              {planBadge(plan)}
            </span>
          </div>
          <h4 className="text-xl font-black uppercase tracking-tight text-brand-textPrimary">{plan.name}</h4>
        </div>

        <div className="flex items-baseline gap-2 py-4 border-y border-brand-border bg-brand-bg/50 px-3 rounded-sm">
          <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-brand-textPrimary">
            {formatCurrencyARS(plan.price)}
          </span>
          <span className="font-mono text-xs font-bold text-brand-textSecondary">{planPeriod(plan)}</span>
        </div>

        <ul className="flex flex-col gap-3">
          {planFeatures(plan).map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-brand-textPrimary">
              <Check className="w-4 h-4 text-brand-primaryText shrink-0 mt-1" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {hasWhatsapp ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] text-xs sm:text-sm font-black uppercase tracking-wider transition-all"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Consultar este Plan</span>
        </a>
      ) : (
        <a
          href="#horarios"
          className="mt-7 w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] text-xs sm:text-sm font-black uppercase tracking-wider transition-colors"
        >
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Inscribirme en Sede</span>
        </a>
      )}
    </article>
  );
}
