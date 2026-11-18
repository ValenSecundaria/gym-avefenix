"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageCircle, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { InstagramIcon, FacebookIcon } from "./footer-icons";
import { FooterContactBanner } from "./FooterContactBanner";

export function Footer() {
  const { user } = useAuth();
  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const whatsappUrl = buildWhatsAppLink(
    gymPhone,
    GYM_BRAND_CONFIG.messages.generalInquiry()
  );

  return (
    <footer id="contacto" className="w-full bg-brand-bg border-t-2 border-brand-border text-brand-textPrimary">
      <FooterContactBanner whatsappUrl={whatsappUrl} gymPhoneDisplay={gymPhone} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        {/* Estructura asimétrica 5 / 7 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-brand-border">
          {/* Bloque izquierdo: Identidad monumental + redes */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-md overflow-hidden bg-brand-surface border border-brand-border shrink-0">
                  <Image
                    src={GYM_BRAND_CONFIG.assets.logoMain}
                    alt={GYM_BRAND_CONFIG.identity.name}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-brand-primaryText">
                  {GYM_BRAND_CONFIG.identity.subdivision}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-brand-textPrimary leading-none">
                {GYM_BRAND_CONFIG.identity.name}
              </h2>
              <div className="w-16 h-1 bg-brand-primary rounded-sm" />
              <p className="text-sm text-brand-textSecondary leading-relaxed max-w-md">
                {GYM_BRAND_CONFIG.identity.footerTagline}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={GYM_BRAND_CONFIG.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-md bg-brand-surface hover:border-[#E1306C] border border-brand-border text-brand-textSecondary hover:text-[#E1306C] flex items-center justify-center transition-colors"
                title={`Instagram: ${GYM_BRAND_CONFIG.contact.instagramHandle}`}
                aria-label={`Instagram de ${GYM_BRAND_CONFIG.identity.name}`}
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              {GYM_BRAND_CONFIG.contact.facebookUrl && (
                <a
                  href={GYM_BRAND_CONFIG.contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-md bg-brand-surface hover:border-[#1877F2] border border-brand-border text-brand-textSecondary hover:text-[#1877F2] flex items-center justify-center transition-colors"
                  aria-label={`Facebook de ${GYM_BRAND_CONFIG.identity.name}`}
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-md bg-brand-surface hover:border-[#25D366] border border-brand-border text-brand-textSecondary hover:text-[#25D366] flex items-center justify-center transition-colors"
                aria-label={`WhatsApp de ${GYM_BRAND_CONFIG.identity.name}`}
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Bloque derecho: 3 módulos técnicos */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-brand-border bg-brand-surface space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-primaryText">
                01 · Sede
              </span>
              <a
                href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-brand-textPrimary hover:text-brand-primaryText flex items-start gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-brand-primaryText" />
                <span>{GYM_BRAND_CONFIG.contact.address}</span>
              </a>
              <div className="pt-2 border-t border-brand-border space-y-1.5 text-xs text-brand-textSecondary">
                {GYM_BRAND_CONFIG.contact.schedule.map((s) => (
                  <div key={s.days} className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-primaryText shrink-0" />
                    <span>{s.days}: <strong className="text-brand-textPrimary">{s.hours}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-lg border border-brand-border bg-brand-surface space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-primaryText">
                02 · Navegación
              </span>
              <ul className="space-y-2 text-sm font-semibold text-brand-textSecondary">
                <li><a href="#inicio" className="hover:text-brand-textPrimary transition-colors">Inicio</a></li>
                <li><a href="#instalaciones" className="hover:text-brand-textPrimary transition-colors">Instalaciones</a></li>
                <li><a href="#planes" className="hover:text-brand-textPrimary transition-colors">Planes y Tarifas</a></li>
                <li><a href="#horarios" className="hover:text-brand-textPrimary transition-colors">Horarios</a></li>
              </ul>
            </div>

            <div className="p-5 rounded-lg border border-brand-border bg-brand-surface flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-primaryText">
                  03 · Sistema
                </span>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Acceso exclusivo para administración y profesores del gimnasio.
                </p>
              </div>
              <Link
                href="/login"
                className="min-h-[48px] px-4 rounded-md border border-brand-border bg-brand-bg hover:border-brand-primary text-xs font-extrabold uppercase tracking-wider text-brand-textPrimary inline-flex items-center justify-between transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-primaryText" />
                  <span>Ingresar</span>
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Barra inferior de cierre */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-textSecondary">
          <span>
            © 2026 {GYM_BRAND_CONFIG.identity.name} · {GYM_BRAND_CONFIG.identity.city}
          </span>
          <span className="font-mono uppercase tracking-wider">
            Sistema de Gestión Integral
          </span>
        </div>
      </div>
    </footer>
  );
}
