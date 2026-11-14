"use client";

import React from "react";
import { CalendarDays, MessageCircle, Percent, Tags } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { groupPlansByDiscipline } from "@/components/admin/PlanPicker";
import { CardCarousel } from "@/components/ui/card-carousel";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { PlanCard } from "./PlanCard";
import type { PlanOption } from "@/types";

export interface PlansSectionProps {
  plans?: PlanOption[];
}

export function PlansSection({ plans }: PlansSectionProps = {}) {
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const groups = plans ? groupPlansByDiscipline(plans) : [];

  const waLinkDiscount = buildWhatsAppLink(
    gymPhone,
    `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por el descuento del 20% (Jubilados / Club / Grupo Familiar).`
  );
  const waLinkInfo = buildWhatsAppLink(
    gymPhone,
    `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por los planes y precios.`
  );

  return (
    <section id="planes" className="w-full bg-brand-bg px-4 sm:px-6 lg:px-10 py-20 lg:py-24 border-t border-brand-border/60">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primaryText">Suscripciones Transparentes</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textPrimary tracking-tight">Elegí tu Plan de Entrenamiento</h2>
          <p className="text-base sm:text-lg text-brand-textSecondary">
            Tarifas oficiales sin sorpresas, por disciplina. Consultanos por WhatsApp para comenzar a entrenar.
          </p>
        </div>

        {plans === undefined ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true" aria-label="Cargando planes">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-brand-surface border border-brand-border animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="w-full max-w-xl p-8 rounded-2xl bg-brand-surface border border-brand-border text-center flex flex-col items-center gap-4">
            <Tags className="w-8 h-8 text-brand-textSecondary" aria-hidden="true" />
            <p className="text-base text-brand-textPrimary font-bold">Estamos actualizando los planes.</p>
            <a
              href={waLinkInfo}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-brand-bg text-sm font-extrabold uppercase tracking-wider transition-all"
            >
              <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Consultar precios</span>
            </a>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-12">
            {groups.map((g) => {
              const isCarousel = g.plans.length >= 4;

              return (
                <div key={g.key} className="flex flex-col gap-6 w-full">
                  <h3 className="text-2xl font-extrabold text-brand-textPrimary flex items-center gap-2.5">
                    <CalendarDays className="w-6 h-6 text-brand-primaryText" aria-hidden="true" />
                    {g.label}
                  </h3>

                  {isCarousel ? (
                    <CardCarousel autoplayDelay={3500} showPagination={true} showNavigation={true}>
                      {g.plans.map((p) => (
                        <PlanCard key={p.id} plan={p} gymPhone={gymPhone} />
                      ))}
                    </CardCarousel>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                      {g.plans.map((p) => (
                        <PlanCard key={p.id} plan={p} gymPhone={gymPhone} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Banner Informativo de Descuento 20% */}
        <GlowCard
          customSize
          glowColor="blue"
          className="w-full rounded-2xl bg-brand-surface/90 border border-brand-warning/30 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_24px_-8px_rgba(250,204,21,0.15)]"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-warning/40 flex items-center justify-center text-brand-warning shrink-0">
              <Percent className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-warning">
                  Beneficio de Comunidad {GYM_BRAND_CONFIG.identity.shortName}
                </span>
              </div>
              <h4 className="text-lg font-bold text-brand-textPrimary">Descuento del 20% para Jubilados, Club y Grupo Familiar</h4>
              <p className="text-sm text-brand-textSecondary mt-1 max-w-2xl leading-relaxed">
                Reconocemos la fidelidad y la actividad deportiva de nuestra comunidad en {GYM_BRAND_CONFIG.identity.subdivision}.
                Acercate a la sede en {GYM_BRAND_CONFIG.contact.address} o consultanos por WhatsApp para activar el beneficio con tu cuota mensual.
              </p>
            </div>
          </div>
          <a
            href={waLinkDiscount}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto shrink-0 min-h-[46px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-brand-warning hover:bg-brand-warning/90 text-brand-bg text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_-4px_rgba(250,204,21,0.4)]"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Consultar Requisitos</span>
          </a>
        </GlowCard>
      </div>
    </section>
  );
}
