"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, MapPin } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import type { MediaItem } from "./media.types";
import { MediaLightboxModal } from "./MediaLightboxModal";
import { GalleryThumbStrip } from "./GalleryThumbStrip";

const SECTOR_FILTERS = [
  { id: "all", label: "Todos los Sectores" },
  { id: "musculación", label: "Musculación" },
  { id: "funcional", label: "Potencia & Funcional" },
  { id: "cardio", label: "Cardio" },
] as const;

const ALL_MEDIA: MediaItem[] = GYM_BRAND_CONFIG.assets.galleryImages.map((img, i) => ({
  id: `brand-media-${i}`,
  type: "image",
  category: img.category || "Musculación",
  title: img.title,
  src: img.src,
  description: img.description,
}));

export function GymGalleryCarousel() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  const filteredMedia =
    filter === "all"
      ? ALL_MEDIA
      : ALL_MEDIA.filter((item) => item.category.toLowerCase() === filter.toLowerCase());

  const safeIndex = filteredMedia.length > 0 ? selectedIndex % filteredMedia.length : 0;
  const activeItem = filteredMedia[safeIndex] ?? null;

  const handleSelectFilter = (nextFilter: string) => {
    setFilter(nextFilter);
    setSelectedIndex(0);
  };

  const stepSlide = (delta: -1 | 1) => {
    if (filteredMedia.length === 0) return;
    setSelectedIndex((safeIndex + delta + filteredMedia.length) % filteredMedia.length);
  };

  return (
    <section
      id="instalaciones"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-brand-bg border-b-2 border-brand-border"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-brand-border">
          <div className="max-w-xl space-y-2">
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-brand-primaryText block">
              {"//"} PLANTA DE ENTRENAMIENTO • {GYM_BRAND_CONFIG.contact.address}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-brand-textPrimary tracking-tight">
              Instalaciones y Equipamiento
            </h2>
            <p className="text-base text-brand-textSecondary">
              Recorré los sectores de fuerza, máquinas y acondicionamiento de {GYM_BRAND_CONFIG.identity.name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar sectores de instalaciones">
            {SECTOR_FILTERS.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectFilter(tab.id)}
                  aria-pressed={active}
                  className={`min-h-[48px] px-4 rounded-md text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? "bg-brand-primary text-[#0A0B0D] border border-brand-primary shadow-md shadow-brand-primary/20"
                      : "bg-brand-surface text-brand-textSecondary border border-brand-border hover:border-brand-primary hover:text-brand-textPrimary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {!activeItem ? (
          <div className="p-10 rounded-lg bg-brand-surface border border-brand-border text-center space-y-2">
            <p className="text-lg font-bold text-brand-textPrimary">Sector en actualización</p>
            <p className="text-sm text-brand-textSecondary">
              Acercate a conocer nuestras instalaciones en {GYM_BRAND_CONFIG.contact.address}, {GYM_BRAND_CONFIG.identity.city}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Visor panorámico + ficha técnica lateral integrada */}
            <div className="grid grid-cols-1 lg:grid-cols-12 rounded-lg bg-brand-surface border-2 border-brand-border overflow-hidden shadow-2xl">
              <div className="lg:col-span-8 relative aspect-[16/9] bg-brand-bg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.src}
                  alt={activeItem.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-sm bg-brand-bg/90 border border-brand-primary/60 font-mono text-xs font-extrabold uppercase tracking-wider text-brand-primaryText">
                    SECTOR {String(safeIndex + 1).padStart(2, "0")} {"//"} {activeItem.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-sm bg-brand-bg/90 border border-brand-border font-mono text-xs font-bold text-brand-textPrimary">
                    {safeIndex + 1} / {filteredMedia.length}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 p-6 sm:p-7 border-t lg:border-t-0 lg:border-l border-brand-border flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand-primaryText block">
                    [ FICHA DE SECTOR ]
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-brand-textPrimary">
                    {activeItem.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-brand-textSecondary leading-relaxed">
                    {activeItem.description}
                  </p>
                  <div className="pt-3 border-t border-brand-border flex items-center gap-2 text-xs font-mono text-brand-textSecondary">
                    <MapPin className="w-4 h-4 text-brand-primaryText shrink-0" aria-hidden="true" />
                    <span>{GYM_BRAND_CONFIG.contact.address} • {GYM_BRAND_CONFIG.identity.city}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepSlide(-1)}
                    aria-label="Sector anterior"
                    className="min-h-[48px] min-w-[48px] rounded-md bg-brand-bg hover:bg-brand-surfaceHover border border-brand-border text-brand-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepSlide(1)}
                    aria-label="Siguiente sector"
                    className="min-h-[48px] min-w-[48px] rounded-md bg-brand-bg hover:bg-brand-surfaceHover border border-brand-border text-brand-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxItem(activeItem)}
                    aria-label={`Ampliar ${activeItem.title}`}
                    className="flex-1 min-h-[48px] px-4 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] text-xs sm:text-sm font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Ampliar Vista</span>
                  </button>
                </div>
              </div>
            </div>

            <GalleryThumbStrip
              items={filteredMedia}
              activeIndex={safeIndex}
              onSelect={setSelectedIndex}
            />
          </div>
        )}
      </div>

      {lightboxItem && (
        <MediaLightboxModal item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
    </section>
  );
}
