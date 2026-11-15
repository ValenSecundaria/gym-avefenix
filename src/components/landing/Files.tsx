"use client";

import React, { useState, useId } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { FILTER_TABS, type MediaItem } from "./media.types";
import { MediaItemCard } from "./MediaItemCard";
import { MediaLightboxModal } from "./MediaLightboxModal";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function Files() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const rawId = useId();
  const instanceId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const prevBtnClass = `files-prev-${instanceId}`;
  const nextBtnClass = `files-next-${instanceId}`;
  const paginationClass = `files-pagination-${instanceId}`;

  const mediaList: MediaItem[] = GYM_BRAND_CONFIG.assets.galleryImages.map((item, idx) => ({
    id: `brand-media-${idx}`,
    type: "image",
    title: item.title,
    category: item.category || "Musculación",
    src: item.src,
    description: item.description,
  }));

  const filteredMedia = mediaList.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "photos") return item.type === "image";
    if (activeTab === "videos") return item.type === "video";
    if (activeTab === "musculacion") return item.category === "Musculación";
    if (activeTab === "funcional") return item.category === "Funcional";
    return true;
  });

  return (
    <section id="instalaciones" className="w-full bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 py-16 lg:py-20 border-t-2 border-[#2C2D35] scroll-mt-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-l-brand-primary pl-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-primaryText">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Instalaciones y Comunidad
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F5F7] tracking-tight uppercase mt-1">
              Conocé {GYM_BRAND_CONFIG.identity.name} en Acción
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#8A909A] max-w-md leading-relaxed">
            Explorá nuestras salas de musculación, sectores de cardio, peso libre y el ambiente de entrenamiento en {GYM_BRAND_CONFIG.identity.subdivision}.
          </p>
        </div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-lg bg-[#17171C] border-2 border-[#2C2D35] self-start max-w-full overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
                  isActive ? "bg-brand-primary text-white" : "text-[#8A909A] hover:text-[#F4F5F7] hover:bg-[#23232A]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vista Móvil / Tablet */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
          {filteredMedia.map((item) => (
            <div key={item.id} className="w-full">
              <MediaItemCard item={item} onSelect={setSelectedMedia} />
            </div>
          ))}
        </div>

        {/* Vista PC / Escritorio */}
        <div className="w-full hidden lg:block relative group/carousel">
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              type="button"
              className={`${prevBtnClass} inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#17171C] border border-[#2C2D35] text-[#F4F5F7] hover:border-brand-primary hover:text-brand-primaryText transition-all cursor-pointer`}
              aria-label="Anterior elemento"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className={`${nextBtnClass} inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#17171C] border border-[#2C2D35] text-[#F4F5F7] hover:border-brand-primary hover:text-brand-primaryText transition-all cursor-pointer`}
              aria-label="Siguiente elemento"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Swiper
            key={activeTab}
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={3}
            loop={filteredMedia.length >= 3}
            autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={{ prevEl: `.${prevBtnClass}`, nextEl: `.${nextBtnClass}` }}
            pagination={{
              el: `.${paginationClass}`,
              clickable: true,
              bulletClass: "inline-block w-2.5 h-2.5 rounded-full bg-[#2C2D35] transition-all duration-300 cursor-pointer mx-1.5",
              bulletActiveClass: "!w-8 !bg-brand-primary !rounded-full shadow-[0_0_10px_rgba(0,87,217,0.5)]",
            }}
            className="w-full !pb-12"
          >
            {filteredMedia.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto flex">
                <div className="w-full h-full flex flex-col">
                  <MediaItemCard item={item} onSelect={setSelectedMedia} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className={`${paginationClass} flex items-center justify-center mt-2`} />
        </div>

        <MediaLightboxModal item={selectedMedia} onClose={() => setSelectedMedia(null)} />
      </div>
    </section>
  );
}
