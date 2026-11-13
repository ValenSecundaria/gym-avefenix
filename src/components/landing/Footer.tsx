"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageCircle, Clock, ShieldCheck, Flame } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { InstagramIcon, FacebookIcon, formatGymPhoneDisplay } from "./footer-icons";
import { FooterContactBanner } from "./FooterContactBanner";

export function Footer() {
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const gymPhoneDisplay = formatGymPhoneDisplay(gymPhone);

  const whatsappUrl = buildWhatsAppLink(
    gymPhone,
    `Hola ${GYM_BRAND_CONFIG.identity.name}! Me gustaría recibir más información acerca de los horarios y planes.`
  );

  return (
    <footer id="contacto" className="w-full bg-[#0B0B0C] border-t border-[#2C2D35] text-[#F4F5F7]">
      <FooterContactBanner whatsappUrl={whatsappUrl} gymPhoneDisplay={gymPhoneDisplay} />

      {/* Pie de Página Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 border-t border-[#2C2D35]/70">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
          {/* Columna 1: Identidad y Redes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#17171C] border border-[#2C2D35] shrink-0">
                <Image
                  src={GYM_BRAND_CONFIG.assets.logoMain}
                  alt={GYM_BRAND_CONFIG.identity.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="flex items-center gap-1 text-base font-extrabold uppercase text-[#F4F5F7]">
                  {GYM_BRAND_CONFIG.identity.shortName}
                  <Flame className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFB300]">
                  {GYM_BRAND_CONFIG.identity.subdivision}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#8A909A] leading-relaxed">
              {GYM_BRAND_CONFIG.identity.footerTagline}
            </p>
            {/* Botones de Redes Sociales */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={GYM_BRAND_CONFIG.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] hover:border-[#E1306C] text-[#8A909A] hover:text-[#E1306C] flex items-center justify-center transition-colors shadow-sm"
                title={`Instagram Oficial: ${GYM_BRAND_CONFIG.contact.instagramHandle}`}
                aria-label={`Instagram de ${GYM_BRAND_CONFIG.identity.name}`}
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              {GYM_BRAND_CONFIG.contact.facebookUrl && (
                <a
                  href={GYM_BRAND_CONFIG.contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] hover:border-[#1877F2] text-[#8A909A] hover:text-[#1877F2] flex items-center justify-center transition-colors shadow-sm"
                  title={`Facebook Oficial: ${GYM_BRAND_CONFIG.identity.shortName}`}
                  aria-label={`Facebook de ${GYM_BRAND_CONFIG.identity.name}`}
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17171C] hover:bg-[#23232A] border border-[#2C2D35] hover:border-[#25D366] text-[#8A909A] hover:text-[#25D366] flex items-center justify-center transition-colors shadow-sm"
                title="WhatsApp Oficial"
                aria-label={`WhatsApp de ${GYM_BRAND_CONFIG.identity.name}`}
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columna 2: Sede y Horarios */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              Sede &amp; Horarios
            </span>
            <a
              href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4F5F7] font-medium flex items-center gap-2 hover:text-[#FFB300] transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
              <span>{GYM_BRAND_CONFIG.contact.address}</span>
            </a>
            {GYM_BRAND_CONFIG.contact.schedule.map((s) => (
              <p key={s.days} className="text-[#8A909A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F95716] shrink-0" aria-hidden="true" />
                <span>{s.days}: {s.hours}</span>
              </p>
            ))}
          </div>

          {/* Columna 3: Redes y Contacto Oficial */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              Redes y Contacto
            </span>
            <a
              href={GYM_BRAND_CONFIG.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[#8A909A] hover:text-[#F4F5F7] transition-colors group"
            >
              <InstagramIcon className="w-4 h-4 text-[#F95716] group-hover:text-[#E1306C] transition-colors" />
              <span>{GYM_BRAND_CONFIG.contact.instagramHandle}</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[#8A909A] hover:text-[#25D366] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
              <span>{gymPhoneDisplay}</span>
            </a>
          </div>

          {/* Columna 4: Navegación y Acceso */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              Sistema de Gestión
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#8A909A] hover:text-[#F95716] transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
              Panel de Recepción / Login
            </Link>
            <div className="pt-2 flex flex-col gap-1 text-xs text-[#8A909A]">
              <a href="#inicio" className="hover:text-[#F4F5F7] transition-colors">• Inicio y Disciplinas</a>
              <a href="#planes" className="hover:text-[#F4F5F7] transition-colors">• Planes y Tarifas Oficiales</a>
              <a href="#horarios" className="hover:text-[#F4F5F7] transition-colors">• Horarios y Ubicación</a>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-6 border-t border-[#2C2D35]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A909A]">
          <p>© 2026 {GYM_BRAND_CONFIG.identity.name} — {GYM_BRAND_CONFIG.contact.address}.</p>
          <span className="uppercase tracking-widest font-semibold text-[#8A909A]">
            {GYM_BRAND_CONFIG.identity.shortName} White-Label
          </span>
        </div>

        {/* Créditos de Desarrollo */}
        <div className="pt-4 text-center">
          <p className="text-xs text-[#8A909A]/80 tracking-wide">
            Desarrollado por Valentin Gemetro y Francisco Uyua
          </p>
        </div>
      </div>
    </footer>
  );
}
