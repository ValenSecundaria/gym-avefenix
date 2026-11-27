"use client";

import React from "react";
import { Dumbbell, MapPin, MessageCircle, Percent, Tags } from "lucide-react";
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

export function PlansSection({ plans }: PlansSectionProps = {}) {
  const { user } = useAuth();
  const gymPhone = (user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp).trim();
  const hasWhatsapp = gymPhone.length > 0;
  const groups = plans ? groupPlansByDiscipline(plans) : [];

  const waLinkDiscount = hasWhatsapp
    ? buildWhatsAppLink(
        gymPhone,
        `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por promociones o planes combinados en Córdoba 535.`
      )
    : "";
  const waLinkInfo = hasWhatsapp
    ? buildWhatsAppLink(
        gymPhone,
        `Hola ${GYM_BRAND_CONFIG.identity.name}! Quiero consultar por los planes y aranceles vigentes.`
      )
    : "";

  return (
    <section
      id="planes"
      className="w-full bg-brand-bg px-4 sm:px-6 lg:px-8 py-20 lg:py-24 border-b-2 border-brand-border"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-brand-border">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-brand-primaryText block">
              {"//"} ARANCELES VIGENTES • {GYM_BRAND_CONFIG.identity.shortName}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-brand-textPrimary tracking-tight">
              Planes y Membresías
            </h2>
            <p className="text-base text-brand-textSecondary">
              Modalidades por días semanales, pase libre mensual o jornada diaria en {GYM_BRAND_CONFIG.contact.address}.
            </p>
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-md bg-brand-surface border border-brand-border text-brand-textSecondary self-start md:self-auto">
            EFECTIVO {"//"} TRANSFERENCIA
          </span>
        </div>

        {plans === undefined ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Cargando planes">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 rounded-lg bg-brand-surface border border-brand-border animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="w-full max-w-xl mx-auto p-8 rounded-lg bg-brand-surface border border-brand-border text-center flex flex-col items-center gap-4">
            <Tags className="w-8 h-8 text-brand-primaryText" aria-hidden="true" />
            <p className="text-base text-brand-textPrimary font-bold">
              Consultá los aranceles actualizados por WhatsApp o en recepción ({GYM_BRAND_CONFIG.contact.address}).
            </p>
            {hasWhatsapp ? (
              <a
                href={waLinkInfo}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-md bg-[#25D366] hover:bg-[#25D366]/90 text-[#0A0B0D] text-sm font-black uppercase tracking-wider transition-all"
              >
                <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Consultar Aranceles</span>
              </a>
            ) : (
              <a
                href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] text-sm font-black uppercase tracking-wider transition-colors"
              >
                <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Ver Sede en Mapa</span>
              </a>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-12">
            {groups.map((g) => {
              const isCarousel = g.plans.length >= 4;
              return (
                <div key={g.key} className="flex flex-col gap-5 w-full">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-md bg-brand-surface border border-brand-primary/50 text-brand-primaryText flex items-center justify-center">
                      <Dumbbell className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-brand-textPrimary">
                      {g.label}
                    </h3>
                  </div>

                  {isCarousel ? (
                    <CardCarousel autoplayDelay={4000} showPagination={true} showNavigation={true}>
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

        <div className="w-full rounded-lg bg-brand-surface border border-brand-border border-l-4 border-l-brand-warning p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-md bg-brand-warning/15 border border-brand-warning/40 flex items-center justify-center text-brand-warning shrink-0">
              <Percent className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand-warning block mb-1">
                ASESORAMIENTO EN RECEPCIÓN
              </span>
              <h4 className="text-lg font-black uppercase text-brand-textPrimary">
                ¿Entrenás en pareja, con amigos o buscás frecuencia personalizada?
              </h4>
              <p className="text-sm text-brand-textSecondary mt-1 max-w-2xl leading-relaxed">
                Escribinos o acercate a {GYM_BRAND_CONFIG.contact.address} ({GYM_BRAND_CONFIG.identity.city}) en horario de mañana o noche para elegir tu plan ideal.
              </p>
            </div>
          </div>

          {hasWhatsapp && (
            <a
              href={waLinkDiscount}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto shrink-0 min-h-[48px] inline-flex items-center justify-center gap-2 px-6 rounded-md bg-[#25D366] hover:bg-[#25D366]/90 text-[#0A0B0D] text-xs sm:text-sm font-black uppercase tracking-wider transition-all"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Escribir por WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
