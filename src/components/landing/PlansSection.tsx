"use client";

import React, { useSyncExternalStore } from "react";
import { CalendarDays, MapPin, MessageCircle, Percent, Tags } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { groupPlansByDiscipline } from "@/components/admin/PlanPicker";
import { CardCarousel } from "@/components/ui/card-carousel";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { PlanCard } from "./PlanCard";
import type { PlanOption } from "@/types";

export interface PlansSectionProps {
  plans?: PlanOption[];
}

const subscribeNoop = () => () => {};

export function PlansSection({ plans }: PlansSectionProps = {}) {
  const { user: rawUser } = useAuth();
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const gymPhone = ((hydrated ? rawUser?.gymPhone : undefined) || GYM_BRAND_CONFIG.contact.defaultWhatsapp).trim();
  const hasWhatsapp = gymPhone.length > 0;
  const groups = plans ? groupPlansByDiscipline(plans) : [];

  const waLinkDiscount = hasWhatsapp
    ? buildWhatsAppLink(gymPhone, `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por beneficios y descuentos disponibles.`)
    : "";
  const waLinkInfo = hasWhatsapp
    ? buildWhatsAppLink(gymPhone, `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por los planes y aranceles vigentes.`)
    : "";

  return (
    <section id="planes" className="w-full bg-brand-bg px-4 sm:px-6 lg:px-8 py-20 lg:py-24 border-b border-brand-border">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-bold uppercase tracking-[0.16em] text-brand-primaryText">
            Aranceles Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-textPrimary tracking-tight">
            Elegí tu Plan de Entrenamiento
          </h2>
          <p className="text-base sm:text-lg text-brand-textSecondary">
            Opciones por frecuencia semanal, pase libre o jornada diaria en {GYM_BRAND_CONFIG.contact.address}.
          </p>
        </div>

        {plans === undefined ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Cargando planes">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-brand-surface border border-brand-border animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-brand-surface border border-brand-border text-center flex flex-col items-center gap-4">
            <Tags className="w-8 h-8 text-brand-primaryText" aria-hidden="true" />
            <p className="text-base text-brand-textPrimary font-bold">
              Consultá nuestros planes vigentes directamente en recepción.
            </p>
            {hasWhatsapp ? (
              <a
                href={waLinkInfo}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 text-brand-bg text-sm font-extrabold uppercase tracking-wider transition-all"
              >
                <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Consultar precios</span>
              </a>
            ) : (
              <a
                href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-bold uppercase tracking-wider transition-colors"
              >
                <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Acercarme a {GYM_BRAND_CONFIG.contact.address}</span>
              </a>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-12">
            {groups.map((g) => {
              const isCarousel = g.plans.length >= 4;
              return (
                <div key={g.key} className="flex flex-col gap-6 w-full">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-brand-primary/15 text-brand-primaryText flex items-center justify-center">
                      <CalendarDays className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-2xl font-extrabold text-brand-textPrimary">{g.label}</h3>
                  </div>

                  {isCarousel ? (
                    <CardCarousel autoplayDelay={3800} showPagination={true} showNavigation={true}>
                      {g.plans.map((p) => (
                        <PlanCard key={p.id} plan={p} gymPhone={gymPhone} />
                      ))}
                    </CardCarousel>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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

        <div className="w-full rounded-3xl bg-brand-surface border border-brand-border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-warning/15 border border-brand-warning/40 flex items-center justify-center text-brand-warning shrink-0">
              <Percent className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-warning block mb-1">
                Comunidad {GYM_BRAND_CONFIG.identity.shortName}
              </span>
              <h4 className="text-lg font-extrabold text-brand-textPrimary">
                Consultá por beneficios para Grupo Familiar y planes combinados
              </h4>
              <p className="text-sm text-brand-textSecondary mt-1 max-w-2xl leading-relaxed">
                Te asesoramos en recepción ({GYM_BRAND_CONFIG.contact.address}, {GYM_BRAND_CONFIG.identity.city}) de lunes a viernes para elegir la frecuencia ideal según tus objetivos de salud y entrenamiento.
              </p>
            </div>
          </div>

          {hasWhatsapp ? (
            <a
              href={waLinkDiscount}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto shrink-0 min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-brand-warning hover:bg-brand-warning/90 text-brand-bg text-sm font-extrabold uppercase tracking-wider transition-all"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Consultar Beneficio</span>
            </a>
          ) : (
            <a
              href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto shrink-0 min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-brand-bg hover:bg-brand-surfaceHover border border-brand-border text-brand-textPrimary text-sm font-bold transition-colors"
            >
              <MapPin className="w-4 h-4 text-brand-warning shrink-0" aria-hidden="true" />
              <span>Ver Sede en Google Maps</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
