"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  MessageCircle,
  Star,
  Percent,
  Banknote,
  CreditCard,
  Users,
} from "lucide-react";
import { buildWhatsAppLink, formatCurrencyARS, cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import type { PlanOption } from "@/types";

type PaymentMethod = "efectivo" | "transferencia";

export interface PlansSectionProps {
  plans?: PlanOption[];
}

export function PlansSection({}: PlansSectionProps = {}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || "5492915768403";

  // Precios oficiales definidos por el gimnasio:
  // 3 veces por semana: $50.000 efectivo / $55.000 transferencia
  // Todos los días: $55.000 efectivo / $60.000 transferencia
  // Descuento 20%: Jubilados, Club y Grupo Familiar
  const price3Days = paymentMethod === "efectivo" ? 50000 : 55000;
  const priceAllDays = paymentMethod === "efectivo" ? 55000 : 60000;

  const alternatePrice3Days = paymentMethod === "efectivo" ? 55000 : 50000;
  const alternatePriceAllDays = paymentMethod === "efectivo" ? 60000 : 55000;

  const discountedPrice3Days = Math.round(price3Days * 0.8);
  const discountedPriceAllDays = Math.round(priceAllDays * 0.8);

  const waLink3Days = buildWhatsAppLink(
    gymPhone,
    `Hola Gimnasio Ave Fénix! Quiero consultar por el Plan 3 veces por semana (${formatCurrencyARS(price3Days)} abonando por ${paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"}).`
  );

  const waLinkAllDays = buildWhatsAppLink(
    gymPhone,
    `Hola Gimnasio Ave Fénix! Quiero inscribirme al Pase Libre Todos los Días (${formatCurrencyARS(priceAllDays)} abonando por ${paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"}).`
  );

  const waLinkDiscount = buildWhatsAppLink(
    gymPhone,
    `Hola Gimnasio Ave Fénix! Quiero consultar por el descuento del 20% (Jubilados / Club / Grupo Familiar).`
  );

  return (
    <section id="planes" className="w-full bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 py-20 lg:py-24 border-t border-[#2C2D35]/60">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        {/* Encabezado de la Sección */}
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#F95716]">
            Suscripciones Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F5F7] tracking-tight">
            Elegí tu Plan de Entrenamiento
          </h2>
          <p className="text-base sm:text-lg text-[#8A909A]">
            Tarifas oficiales sin sorpresas. Elegí tu modalidad y medio de pago para comenzar a entrenar.
          </p>

          {/* Selector de Medio de Pago */}
          <div className="mt-4 inline-flex p-1.5 rounded-xl bg-[#17171C] border border-[#2C2D35] gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setPaymentMethod("efectivo")}
              className={cn(
                "inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all",
                paymentMethod === "efectivo"
                  ? "bg-[#F95716] text-[#F4F5F7] shadow-[0_0_16px_rgba(249,87,22,0.4)]"
                  : "text-[#8A909A] hover:text-[#F4F5F7] hover:bg-[#23232A]"
              )}
            >
              <Banknote className="w-4 h-4" aria-hidden="true" />
              <span>En Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("transferencia")}
              className={cn(
                "inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all",
                paymentMethod === "transferencia"
                  ? "bg-[#F95716] text-[#F4F5F7] shadow-[0_0_16px_rgba(249,87,22,0.4)]"
                  : "text-[#8A909A] hover:text-[#F4F5F7] hover:bg-[#23232A]"
              )}
            >
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              <span>Por Transferencia</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Planes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-stretch">
          {/* Tarjeta 1: 3 Veces por Semana */}
          <div className="flex flex-col justify-between p-8 rounded-2xl bg-[#17171C] border border-[#2C2D35] hover:border-[#8A909A]/40 shadow-lg transition-all">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFB300]">
                  Plan Flexible
                </span>
                <h3 className="text-2xl font-extrabold text-[#F4F5F7] mt-1">
                  3 Veces por Semana
                </h3>
                <p className="text-sm text-[#8A909A] mt-2 leading-relaxed">
                  Ideal para complementar con otras actividades o mantener constancia con 3 entrenamientos semanales.
                </p>
              </div>

              <div className="flex flex-col gap-1 py-4 border-y border-[#2C2D35]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F4F5F7]">
                    {formatCurrencyARS(price3Days)}
                  </span>
                  <span className="text-sm font-medium text-[#8A909A]">/ mes</span>
                </div>
                <span className="text-xs text-[#8A909A] mt-1 flex items-center gap-1.5">
                  {paymentMethod === "efectivo" ? (
                    <>💳 O {formatCurrencyARS(alternatePrice3Days)} por Transferencia</>
                  ) : (
                    <>💵 O {formatCurrencyARS(alternatePrice3Days)} abonando en Efectivo</>
                  )}
                </span>
              </div>

              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>3 asistencias semanales a libre elección</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Acceso a musculación, funcional, cardio e híbrido</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Supervisión y guía constante en sala</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Control ágil de asistencia por DNI en terminal</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <a
                href={waLink3Days}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] text-sm font-extrabold uppercase tracking-wider shadow-[0_0_20px_-4px_rgba(37,211,102,0.4)] transition-all"
              >
                <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Consultar Plan 3 Días</span>
              </a>
            </div>
          </div>

          {/* Tarjeta 2: Todos los Días (Pase Libre) - DESTACADO */}
          <div className="relative flex flex-col justify-between p-8 rounded-2xl bg-[#17171C] border-2 border-[#F95716] shadow-[0_0_36px_-6px_rgba(249,87,22,0.3)] lg:-translate-y-3">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#F95716] text-[#F4F5F7] text-xs font-extrabold uppercase tracking-wider shadow-md">
              <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>Más Elegido</span>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFB300]">
                  Membresía Ilimitada
                </span>
                <h3 className="text-2xl font-extrabold text-[#F4F5F7] mt-1">
                  Todos los Días (Pase Libre)
                </h3>
                <p className="text-sm text-[#8A909A] mt-2 leading-relaxed">
                  Entrená de lunes a sábado sin límites de frecuencia ni restricciones de horario.
                </p>
              </div>

              <div className="flex flex-col gap-1 py-4 border-y border-[#2C2D35]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F95716]">
                    {formatCurrencyARS(priceAllDays)}
                  </span>
                  <span className="text-sm font-medium text-[#8A909A]">/ mes</span>
                </div>
                <span className="text-xs text-[#8A909A] mt-1 flex items-center gap-1.5">
                  {paymentMethod === "efectivo" ? (
                    <>💳 O {formatCurrencyARS(alternatePriceAllDays)} por Transferencia</>
                  ) : (
                    <>💵 O {formatCurrencyARS(alternatePriceAllDays)} abonando en Efectivo</>
                  )}
                </span>
              </div>

              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Acceso ilimitado de Lunes a Sábado</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Sala de musculación, funcional, cardio e híbrido</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Horario corrido: Lun a Vie 8 a 22 hs • Sáb 10 a 14 hs</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Ingreso inmediato y autónomo con tu DNI</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Rutinas personalizadas y acompañamiento en sala</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <a
                href={waLinkAllDays}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-[#F4F5F7] text-sm font-extrabold uppercase tracking-wider shadow-[0_0_20px_-4px_rgba(249,87,22,0.5)] transition-all"
              >
                <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Inscribirme al Pase Libre</span>
              </a>
            </div>
          </div>

          {/* Tarjeta 3: Beneficio Descuento 20% */}
          <div className="flex flex-col justify-between p-8 rounded-2xl bg-[#17171C] border border-[#FFB300]/40 shadow-lg hover:border-[#FFB300] transition-all">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFB300]">
                  Beneficio Especial
                </span>
                <h3 className="text-2xl font-extrabold text-[#F4F5F7] mt-1">
                  Descuento del 20%
                </h3>
                <p className="text-sm text-[#8A909A] mt-2 leading-relaxed">
                  Bonificación exclusiva aplicable a la cuota mensual para beneficiarios directos.
                </p>
              </div>

              <div className="flex flex-col gap-1 py-4 border-y border-[#2C2D35]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#FFB300]">
                    20% OFF
                  </span>
                  <span className="text-sm font-medium text-[#8A909A]">en tu cuota</span>
                </div>
                <div className="text-xs text-[#8A909A] mt-1 space-y-0.5">
                  <p>
                    • 3 Días: <span className="text-[#F4F5F7] font-semibold">{formatCurrencyARS(discountedPrice3Days)}</span>
                  </p>
                  <p>
                    • Todos los Días: <span className="text-[#F4F5F7] font-semibold">{formatCurrencyARS(discountedPriceAllDays)}</span>
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <Percent className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#FFB300]">Jubilados:</strong> Tarifa bonificada con comprobante
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <Percent className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#FFB300]">Convenio Club:</strong> Para deportistas y socios de club
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <Users className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#FFB300]">Grupo Familiar:</strong> Descuento para 2 o más miembros
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F4F5F7]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Válido tanto en efectivo como por transferencia</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <a
                href={waLinkDiscount}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#17171C] hover:bg-[#23232A] text-[#FFB300] border border-[#FFB300]/50 hover:border-[#FFB300] text-sm font-extrabold uppercase tracking-wider transition-all"
              >
                <MessageCircle className="w-5 h-5 shrink-0 text-[#25D366]" aria-hidden="true" />
                <span>Consultar Descuento 20%</span>
              </a>
            </div>
          </div>
        </div>

        {/* Banner Informativo de Descuento 20% */}
        <div className="w-full rounded-2xl bg-[#17171C] border border-[#FFB300]/30 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_24px_-8px_rgba(255,179,0,0.15)]">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B0B0C] border border-[#FFB300]/40 flex items-center justify-center text-[#FFB300] shrink-0">
              <Percent className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300]">
                  Beneficio de Comunidad Ave Fénix
                </span>
              </div>
              <h4 className="text-lg font-bold text-[#F4F5F7]">
                Descuento del 20% para Jubilados, Club y Grupo Familiar
              </h4>
              <p className="text-sm text-[#8A909A] mt-1 max-w-2xl leading-relaxed">
                Reconocemos la fidelidad y la actividad deportiva de nuestra comunidad en Ingeniero White.
                Acercate a la sede en Lautaro 3322 o consultanos por WhatsApp para activar el beneficio con tu cuota mensual.
              </p>
            </div>
          </div>
          <a
            href={waLinkDiscount}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto shrink-0 min-h-[46px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#FFB300] hover:bg-[#FFB300]/90 text-[#0B0B0C] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_-4px_rgba(255,179,0,0.4)]"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Consultar Requisitos</span>
          </a>
        </div>
      </div>
    </section>
  );
}
