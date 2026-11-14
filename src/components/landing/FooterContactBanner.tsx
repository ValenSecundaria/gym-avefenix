import React from "react";
import { MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

interface FooterContactBannerProps {
  whatsappUrl: string;
  gymPhoneDisplay: string;
}

export function FooterContactBanner({ whatsappUrl, gymPhoneDisplay }: FooterContactBannerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-12">
      <div className="rounded-2xl bg-brand-surface border border-brand-border p-6 sm:p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-bg border border-brand-border w-fit">
            <MapPin className="w-4 h-4 text-brand-primaryText" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-warning">
              Ubicación Oficial
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-textPrimary tracking-tight">
            Vení a Entrenar a {GYM_BRAND_CONFIG.identity.name}
          </h2>
          <p className="text-sm sm:text-base text-brand-textSecondary max-w-xl leading-relaxed">
            {GYM_BRAND_CONFIG.contact.address}. Consultanos por WhatsApp o acercate directamente en nuestro horario de atención.
          </p>
        </div>

        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-brand-bg text-sm font-extrabold uppercase tracking-wider shadow-[0_0_20px_-4px_rgba(37,211,102,0.4)] transition-all"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{gymPhoneDisplay ? `WhatsApp (${gymPhoneDisplay})` : "Consultar por WhatsApp"}</span>
          </a>
          <div className={GYM_BRAND_CONFIG.contact.googleMapsUrlSecondary ? "grid grid-cols-1 sm:grid-cols-2 gap-2" : "flex gap-2"}>
            <a
              href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-bg hover:bg-brand-surfaceHover text-brand-textPrimary border border-brand-border hover:border-brand-warning/50 text-xs sm:text-sm font-semibold transition-colors"
            >
              <MapPin className="w-4 h-4 text-brand-warning shrink-0" aria-hidden="true" />
              <span>{GYM_BRAND_CONFIG.contact.googleMapsUrlSecondary ? "Maps • Mitre 1134" : "Cómo Llegar en Google Maps"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-brand-textSecondary" aria-hidden="true" />
            </a>
            {GYM_BRAND_CONFIG.contact.googleMapsUrlSecondary && (
              <a
                href={GYM_BRAND_CONFIG.contact.googleMapsUrlSecondary}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-bg hover:bg-brand-surfaceHover text-brand-textPrimary border border-brand-border hover:border-brand-warning/50 text-xs sm:text-sm font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4 text-brand-warning shrink-0" aria-hidden="true" />
                <span>Maps • Holdich 350</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-textSecondary" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
