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
      <div className="rounded-2xl bg-[#17171C] border border-[#2C2D35] p-6 sm:p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0B0C] border border-[#2C2D35] w-fit">
            <MapPin className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300]">
              Ubicación Oficial
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F7] tracking-tight">
            Vení a Entrenar a {GYM_BRAND_CONFIG.identity.name}
          </h2>
          <p className="text-sm sm:text-base text-[#8A909A] max-w-xl leading-relaxed">
            {GYM_BRAND_CONFIG.contact.address}. Consultanos por WhatsApp o acercate directamente en nuestro horario de atención.
          </p>
        </div>

        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] text-sm font-extrabold uppercase tracking-wider shadow-[0_0_20px_-4px_rgba(37,211,102,0.4)] transition-all"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>WhatsApp ({gymPhoneDisplay})</span>
          </a>
          <div className="flex gap-2">
            <a
              href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0B0B0C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] hover:border-[#FFB300]/50 text-xs sm:text-sm font-semibold transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#FFB300] shrink-0" aria-hidden="true" />
              <span>Cómo Llegar en Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8A909A]" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
