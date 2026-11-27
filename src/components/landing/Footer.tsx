"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { InstagramIcon, FacebookIcon } from "./footer-icons";
import { FooterContactBanner } from "./FooterContactBanner";

export function Footer() {
  const { user } = useAuth();
  const gymPhone = (user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp).trim();
  const hasWhatsapp = gymPhone.length > 0;
  const hasInstagram = GYM_BRAND_CONFIG.contact.instagramUrl.trim().length > 0;
  const hasFacebook = Boolean(GYM_BRAND_CONFIG.contact.facebookUrl?.trim());

  const whatsappUrl = hasWhatsapp
    ? buildWhatsAppLink(gymPhone, GYM_BRAND_CONFIG.messages.generalInquiry())
    : "";

  return (
    <footer id="contacto" className="w-full bg-brand-bg text-brand-textPrimary">
      <FooterContactBanner whatsappUrl={whatsappUrl} gymPhoneDisplay={gymPhone} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-brand-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-brand-border">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-brand-surface border-2 border-brand-border shrink-0">
                <Image
                  src={GYM_BRAND_CONFIG.assets.logoMain}
                  alt={GYM_BRAND_CONFIG.identity.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-brand-textPrimary">
                  {GYM_BRAND_CONFIG.identity.name}
                </h2>
                <p className="font-mono text-xs font-bold text-brand-primaryText">
                  {GYM_BRAND_CONFIG.contact.address} {"//"} {GYM_BRAND_CONFIG.identity.city}
                </p>
              </div>
            </div>

            <p className="text-sm text-brand-textSecondary leading-relaxed max-w-sm">
              Entrenamiento de fuerza, peso libre, máquinas guiadas y acondicionamiento físico en un espacio sólido y sin vueltas.
            </p>

            {(hasInstagram || hasFacebook || hasWhatsapp) && (
              <div className="flex items-center gap-2.5 pt-1">
                {hasInstagram && (
                  <a
                    href={GYM_BRAND_CONFIG.contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${GYM_BRAND_CONFIG.identity.name}`}
                    className="w-12 h-12 rounded-md bg-brand-surface hover:border-[#E1306C] border border-brand-border text-brand-textSecondary hover:text-[#E1306C] flex items-center justify-center transition-colors"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}
                {hasFacebook && (
                  <a
                    href={GYM_BRAND_CONFIG.contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Facebook de ${GYM_BRAND_CONFIG.identity.name}`}
                    className="w-12 h-12 rounded-md bg-brand-surface hover:border-[#1877F2] border border-brand-border text-brand-textSecondary hover:text-[#1877F2] flex items-center justify-center transition-colors"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                )}
                {hasWhatsapp && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp de ${GYM_BRAND_CONFIG.identity.name}`}
                    className="w-12 h-12 rounded-md bg-brand-surface hover:border-[#25D366] border border-brand-border text-brand-textSecondary hover:text-[#25D366] flex items-center justify-center transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-4 space-y-3">
            <h3 className="font-mono text-xs font-extrabold uppercase tracking-widest text-brand-primaryText">
              Sede &amp; Horarios
            </h3>
            <a
              href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-brand-textPrimary hover:text-brand-primaryText inline-flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-brand-primaryText shrink-0" />
              <span>{GYM_BRAND_CONFIG.contact.address}, {GYM_BRAND_CONFIG.identity.city}</span>
            </a>
            <div className="space-y-2 pt-1 text-xs text-brand-textSecondary">
              {GYM_BRAND_CONFIG.contact.schedule.map((s) => (
                <div key={s.days} className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-primaryText shrink-0 mt-0.5" />
                  <span>
                    {s.days}: <strong className="font-mono text-brand-textPrimary">{s.hours}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 p-5 rounded-lg bg-brand-surface border border-brand-border flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-brand-primaryText block">
                Sistema Interno
              </span>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                Terminal de recepción, administración y profesores de {GYM_BRAND_CONFIG.identity.shortName}.
              </p>
            </div>
            <Link
              href="/login"
              className="min-h-[48px] px-4 rounded-md bg-brand-bg hover:bg-brand-surfaceHover border border-brand-border hover:border-brand-primary text-xs font-extrabold uppercase tracking-wider text-brand-textPrimary inline-flex items-center justify-between transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-primaryText" />
                <span>Ingresar al Panel</span>
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-textSecondary font-mono">
          <span>{GYM_BRAND_CONFIG.identity.footerTagline}</span>
          <span>
            {GYM_BRAND_CONFIG.identity.name} {"//"} {GYM_BRAND_CONFIG.contact.address}
          </span>
        </div>
      </div>
    </footer>
  );
}
