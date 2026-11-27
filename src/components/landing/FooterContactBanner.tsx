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
      <div className="rounded-3xl bg-brand-surface border border-brand-border border-t-4 border-t-brand-primary p-6 sm:p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-bg border border-brand-border w-fit">
            <MapPin className="w-4 h-4 text-brand-primaryText" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-textPrimary">
              Sede Oficial • {GYM_BRAND_CONFIG.identity.city}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-textPrimary tracking-tight">
            Sumate hoy a {GYM_BRAND_CONFIG.identity.name}
          </h2>
          <p className="text-sm sm:text-base text-brand-textSecondary max-w-xl leading-relaxed">
            Te esperamos en <strong className="text-brand-textPrimary">{GYM_BRAND_CONFIG.contact.address}</strong> de lunes a viernes de 08:00 a 22:00 hs para comenzar tu plan de entrenamiento y salud.
          </p>
        </div>

        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
          <a
            href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white text-sm sm:text-base font-bold shadow-lg shadow-brand-primary/25 transition-colors"
          >
            <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Cómo llegar • {GYM_BRAND_CONFIG.contact.address}</span>
            <ExternalLink className="w-4 h-4 opacity-80" aria-hidden="true" />
          </a>

          {hasWhatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 text-brand-bg text-sm font-extrabold uppercase tracking-wider transition-all"
            >
              <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>WhatsApp ({gymPhoneDisplay})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
