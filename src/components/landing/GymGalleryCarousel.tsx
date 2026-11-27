"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { FILTER_TABS, type MediaItem } from "./media.types";
import { MediaLightboxModal } from "./MediaLightboxModal";
import { GallerySectorList } from "./GallerySectorList";

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
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-brand-bg border-b border-brand-border"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-primaryText">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Recorrido por sectores</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-textPrimary tracking-tight">
              Espacios diseñados para tu progreso
            </h2>
            <p className="text-base text-brand-textSecondary">
              Explorá cada área de entrenamiento de {GYM_BRAND_CONFIG.identity.name} en {GYM_BRAND_CONFIG.contact.address}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar sectores de la galería">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectFilter(tab.id)}
                  aria-pressed={active}
                  className={`min-h-[48px] px-5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                      : "bg-brand-surface text-brand-textSecondary border border-brand-border hover:border-brand-primary/50 hover:text-brand-textPrimary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {!activeItem ? (
          <div className="p-10 rounded-3xl bg-brand-surface border border-brand-border text-center space-y-2">
            <p className="text-lg font-bold text-brand-textPrimary">Sector en actualización</p>
            <p className="text-sm text-brand-textSecondary">
              Acercate a conocer nuestras instalaciones en {GYM_BRAND_CONFIG.contact.address}, {GYM_BRAND_CONFIG.identity.city}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 rounded-3xl bg-brand-surface border border-brand-border border-t-4 border-t-brand-primary overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="relative aspect-[16/10] w-full bg-brand-bg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeItem.src} alt={activeItem.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-brand-bg/85 backdrop-blur-md border border-brand-border text-xs font-bold uppercase tracking-wider text-brand-primaryText">
                    {activeItem.category}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-brand-bg/85 backdrop-blur-md border border-brand-border font-mono text-xs font-bold text-brand-textPrimary">
                    {safeIndex + 1} / {filteredMedia.length}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-brand-textPrimary">{activeItem.title}</h3>
                  <p className="text-sm sm:text-base text-brand-textSecondary leading-relaxed">{activeItem.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => stepSlide(-1)}
                    aria-label="Sector anterior"
                    className="min-h-[48px] min-w-[48px] rounded-2xl bg-brand-bg hover:bg-brand-surfaceHover border border-brand-border text-brand-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepSlide(1)}
                    aria-label="Siguiente sector"
                    className="min-h-[48px] min-w-[48px] rounded-2xl bg-brand-bg hover:bg-brand-surfaceHover border border-brand-border text-brand-textPrimary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxItem(activeItem)}
                    aria-label={`Ampliar ${activeItem.title}`}
                    className="min-h-[48px] px-4 rounded-2xl bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Ampliar</span>
                  </button>
                </div>
              </div>
            </div>

            <GallerySectorList items={filteredMedia} selectedIndex={safeIndex} onSelect={setSelectedIndex} />
          </div>
        )}
      </div>

      {lightboxItem && <MediaLightboxModal item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </section>
  );
}
