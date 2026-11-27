"use client";

import React from "react";
import { CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsAppLink, formatCurrencyARS } from "@/lib/utils";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import type { PlanOption } from "@/types";

function planPeriod(p: PlanOption): string {
  return p.category === "DIARIO" ? "/ día" : "/ mes";
}

function planFeatures(p: PlanOption): string[] {
  if (p.category === "DIARIO") {
    return ["Pase por 1 jornada de entrenamiento", "Ingreso inmediato con tu DNI en recepción"];
  }
  const frequency =
    p.category === "MENSUAL_DIAS"
      ? `${p.allowedDaysPerWeek} ${p.allowedDaysPerWeek === 1 ? "día" : "días"} por semana a elección`
      : "Acceso libre de lunes a viernes";
  return [frequency, `Vigencia de ${p.durationDays} días corridos`, "Control ágil con tu DNI en recepción"];
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
    <article className="flex flex-col justify-between h-full p-7 rounded-3xl bg-brand-surface border border-brand-border border-t-4 border-t-brand-primary hover:border-brand-primary/70 shadow-lg transition-all">
      <div className="flex flex-col gap-5">
        <div className="space-y-1">
          {plan.disciplineName && (
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primaryText">
              {plan.disciplineName}
            </span>
          )}
          <h4 className="text-xl font-extrabold text-brand-textPrimary">{plan.name}</h4>
        </div>

        <div className="flex items-baseline gap-2 py-4 border-y border-brand-border">
          <span className="text-4xl font-black tracking-tight text-brand-textPrimary">
            {formatCurrencyARS(plan.price)}
          </span>
          <span className="text-sm font-semibold text-brand-textSecondary">{planPeriod(plan)}</span>
        </div>

        <ul className="flex flex-col gap-3">
          {planFeatures(plan).map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm sm:text-[15px] text-brand-textPrimary">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
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
          className="mt-7 w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 text-brand-bg text-sm font-extrabold uppercase tracking-wider transition-all"
        >
          <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>Consultar Plan</span>
        </a>
      ) : (
        <a
          href="#horarios"
          className="mt-7 w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-bold uppercase tracking-wider transition-colors"
        >
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Inscribirme en Sede</span>
        </a>
      )}
    </article>
  );
}
