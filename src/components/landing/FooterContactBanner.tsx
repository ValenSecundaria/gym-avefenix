import React from "react";
import { ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

interface FooterContactBannerProps {
  whatsappUrl: string;
  gymPhoneDisplay: string;
}

export function FooterContactBanner({ whatsappUrl, gymPhoneDisplay }: FooterContactBannerProps) {
  const hasWhatsapp = gymPhoneDisplay.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
      <div className="rounded-lg bg-brand-surface border-2 border-brand-border border-l-4 border-l-brand-primary p-6 sm:p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-brand-primaryText">
            {"//"} SUMATE A ENTRENAR • {GYM_BRAND_CONFIG.identity.city}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-brand-textPrimary tracking-tight">
            Empezá hoy en {GYM_BRAND_CONFIG.identity.name}
          </h2>
          <p className="text-sm sm:text-base text-brand-textSecondary max-w-xl leading-relaxed">
            Acercate a <strong className="text-brand-textPrimary">{GYM_BRAND_CONFIG.contact.address}</strong> de lunes a sábados o escribinos por WhatsApp para coordinar tu inicio.
          </p>
        </div>

        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
          <a
            href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2.5 px-6 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] text-xs sm:text-sm font-black uppercase tracking-wider transition-colors"
          >
            <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Cómo llegar • {GYM_BRAND_CONFIG.contact.address}</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>

          {hasWhatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 rounded-md bg-[#25D366] hover:bg-[#25D366]/90 text-[#0A0B0D] text-xs sm:text-sm font-black uppercase tracking-wider transition-all"
            >
              <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>WhatsApp Oficial</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
