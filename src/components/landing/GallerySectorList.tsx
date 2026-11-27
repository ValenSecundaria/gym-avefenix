"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import type { MediaItem } from "./media.types";

interface GallerySectorListProps {
  items: MediaItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function GallerySectorList({ items, selectedIndex, onSelect }: GallerySectorListProps) {
  return (
    <div className="lg:col-span-5 flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => {
          const selected = idx === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer min-h-[84px] ${
                selected
                  ? "bg-brand-surface border-brand-primary shadow-md"
                  : "bg-brand-surface/60 border-brand-border hover:bg-brand-surface hover:border-brand-border"
              }`}
            >
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primaryText block">
                  {item.category}
                </span>
                <span className="text-base font-extrabold text-brand-textPrimary block truncate">
                  {item.title}
                </span>
                <span className="text-xs text-brand-textSecondary line-clamp-1">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <a
        href={GYM_BRAND_CONFIG.contact.googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-[64px] p-4 rounded-2xl bg-brand-surface hover:bg-brand-surfaceHover border border-brand-border flex items-center justify-between gap-3 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primaryText flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary block">
              Visitanos en persona
            </span>
            <span className="text-sm font-extrabold text-brand-textPrimary block truncate">
              {GYM_BRAND_CONFIG.contact.address} • {GYM_BRAND_CONFIG.identity.city}
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-brand-primaryText shrink-0">Ver mapa →</span>
      </a>
    </div>
  );
}
