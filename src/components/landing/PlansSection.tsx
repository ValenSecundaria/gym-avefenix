import React from "react";
import { CheckCircle2, MessageCircle, Star } from "lucide-react";
import { buildWhatsAppLink, formatCurrencyARS } from "@/lib/utils";
import type { PlanOption } from "@/types";

const GYM_WHATSAPP = "5491154923810";

interface LandingPlanCard {
  id: string;
  eyebrow: string;
  name: string;
  description: string;
  price: number;
  period: string;
  featured?: boolean;
  features: string[];
  ctaText: string;
}

const DEFAULT_PLANS: LandingPlanCard[] = [
  {
    id: "diario",
    eyebrow: "Acceso Puntual",
    name: "Pase Diario",
    description: "Ideal si estás de paso o querés probar un día completo de entrenamiento intensivo.",
    price: 3500,
    period: "/ día",
    features: [
      "Acceso libre a toda la sala de musculación",
      "Uso completo de vestuarios y lockers",
      "Asesoramiento del instructor de turno",
    ],
    ctaText: "Consultar Pase Diario",
  },
  {
    id: "mensual-libre",
    eyebrow: "Membresía Ilimitada",
    name: "Pase Libre Mensual",
    description: "El pase definitivo para transformar tu físico sin restricciones de días ni horarios.",
    price: 18500,
    period: "/ mes",
    featured: true,
    features: [
      "Acceso ilimitado de Lunes a Sábado",
      "Evaluación física inicial y rutina a medida",
      "Pase libre a áreas de fuerza, cardio y funcional",
      "Ingreso ágil por terminal con DNI",
    ],
    ctaText: "Inscribirme al Pase Libre",
  },
  {
    id: "tres-dias",
    eyebrow: "Plan Flexible",
    name: "Plan 3 Días por Semana",
    description: "Para quienes combinan el gimnasio con otros deportes o rutinas dinámicas semanales.",
    price: 14500,
    period: "/ mes",
    features: [
      "3 asistencias semanales a libre elección",
      "Disponibilidad de Lunes a Sábado",
      "Control automático de cupo semanal por DNI",
      "Acceso a vestuarios y duchas climatizadas",
    ],
    ctaText: "Consultar Plan 3 Días",
  },
];

export interface PlansSectionProps {
  plans?: PlanOption[];
}

export function PlansSection({ plans }: PlansSectionProps) {
  const displayPlans: LandingPlanCard[] = DEFAULT_PLANS.map((card) => {
    if (!plans?.length) return card;
    const match = plans.find(
      (p) =>
        (card.id === "mensual-libre" && p.category === "MENSUAL_LIBRE") ||
        (card.id === "tres-dias" && p.category === "MENSUAL_DIAS") ||
        (card.id === "diario" && p.category === "DIARIO")
    );
    return match ? { ...card, name: match.name, price: match.price } : card;
  });

  return (
    <section id="planes" className="w-full bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 py-20 lg:py-24 border-t border-[#2C2D35]/60">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-14">
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#F95716]">Suscripciones Transparentes</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F5F7] tracking-tight">Elegí tu Plan de Entrenamiento</h2>
          <p className="text-base sm:text-lg text-[#8A909A]">
            Planes claros, sin letra chica ni contratos forzados. Consultá e inscribite en minutos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-stretch">
          {displayPlans.map((plan) => {
            const waLink = buildWhatsAppLink(GYM_WHATSAPP, `Hola Gimnasio Ave Fénix! Quiero consultar por el ${plan.name} (${formatCurrencyARS(plan.price)}).`);
            const cardCls = plan.featured
              ? "relative flex flex-col justify-between p-8 rounded-2xl bg-[#17171C] border-2 border-[#F95716] shadow-[0_0_36px_-6px_rgba(249,87,22,0.3)] lg:-translate-y-3"
              : "flex flex-col justify-between p-8 rounded-2xl bg-[#17171C] border border-[#2C2D35] hover:border-[#8A909A]/40 shadow-lg transition-all";

            return (
              <div key={plan.id} className={cardCls}>
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#F95716] text-[#F4F5F7] text-xs font-extrabold uppercase tracking-wider shadow-md">
                    <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    <span>Más Elegido</span>
                  </div>
                )}
                <div className="flex flex-col gap-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FFB300]">{plan.eyebrow}</span>
                    <h3 className="text-2xl font-extrabold text-[#F4F5F7] mt-1">{plan.name}</h3>
                    <p className="text-sm text-[#8A909A] mt-2 leading-relaxed">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-2 py-4 border-y border-[#2C2D35]">
                    <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${plan.featured ? "text-[#F95716]" : "text-[#F4F5F7]"}`}>
                      {formatCurrencyARS(plan.price)}
                    </span>
                    <span className="text-sm font-medium text-[#8A909A]">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 pt-4">
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] text-sm font-extrabold uppercase tracking-wider shadow-[0_0_20px_-4px_rgba(37,211,102,0.4)] transition-all">
                    <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>{plan.ctaText}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
