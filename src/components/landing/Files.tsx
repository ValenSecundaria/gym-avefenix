"use client";

import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { buildWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/context/auth-session-context";
import "swiper/css";
import "swiper/css/navigation";

import { FILTER_TABS, type MediaItem } from "./media.types";
import { MediaItemCard } from "./MediaItemCard";
import { MediaLightboxModal } from "./MediaLightboxModal";

const ALL_MEDIA: MediaItem[] = GYM_BRAND_CONFIG.assets.galleryImages.map((img, i) => ({
  id: `brand-media-${i}`,
  type: "image",
  category: img.category || "Musculación",
  title: img.title,
  src: img.src,
  description: img.description,
}));

export function Files() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const gymPhone = user?.gymPhone || GYM_BRAND_CONFIG.contact.defaultWhatsapp;
  const whatsappUrl = buildWhatsAppLink(gymPhone, GYM_BRAND_CONFIG.messages.generalInquiry());

  const filteredMedia = filter === "all"
    ? ALL_MEDIA
    : ALL_MEDIA.filter((item) => item.category.toLowerCase() === filter.toLowerCase());

  return (
    <section id="instalaciones" className="py-16 sm:py-20 px-4 sm:px-6 bg-brand-bg border-b border-brand-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-brand-border">
          <div className="border-l-4 border-brand-primary pl-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-primaryText block mb-1.5">
              ESPACIOS &amp; EQUIPAMIENTO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-textPrimary uppercase tracking-tight">
              Conocé Nuestras Instalaciones
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`min-h-[48px] px-4 rounded-md text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                    active
                      ? "bg-brand-primary text-white"
                      : "bg-brand-surface text-brand-textSecondary border border-brand-border hover:border-brand-primary/50 hover:text-brand-textPrimary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-9 min-w-0">
            <Swiper
              key={filter}
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              modules={[Autoplay, Navigation]}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 16 },
                1024: { slidesPerView: 2, spaceBetween: 20 },
              }}
              autoplay={{ delay: 4500, disableOnInteraction: true }}
              loop={filteredMedia.length > 2}
              className="w-full"
            >
              {filteredMedia.map((item) => (
                <SwiperSlide key={item.id} className="h-auto">
                  <MediaItemCard item={item} onSelect={setLightboxItem} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <aside className="lg:col-span-3 rounded-lg border border-brand-border bg-brand-surface p-5 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-textSecondary">
                  Galería
                </span>
                <span className="font-mono text-sm font-bold text-brand-primaryText">
                  {filteredMedia.length} fotos
                </span>
              </div>
              <p className="text-sm text-brand-textSecondary leading-relaxed">
                Sector de musculación, pesos libres, cardio y entrenamiento funcional preparados para entrenar sin esperas.
              </p>
              <div className="flex items-start gap-2.5 text-xs font-semibold text-brand-textPrimary bg-brand-bg p-3 rounded-md border border-brand-border">
                <MapPin className="w-4 h-4 text-brand-primaryText shrink-0 mt-0.5" />
                <span>{GYM_BRAND_CONFIG.contact.address}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  aria-label="Foto anterior"
                  className="min-h-[48px] rounded-md border border-brand-border bg-brand-bg hover:border-brand-primary text-brand-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  aria-label="Siguiente foto"
                  className="min-h-[48px] rounded-md border border-brand-border bg-brand-bg hover:border-brand-primary text-brand-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] px-4 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Agendar visita</span>
              </a>
            </div>
          </aside>
        </div>
      </div>

      {lightboxItem && (
        <MediaLightboxModal item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
    </section>
  );
}
