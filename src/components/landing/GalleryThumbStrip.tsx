"use client";

import React from "react";
import type { MediaItem } from "./media.types";

interface GalleryThumbStripProps {
  items: MediaItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function GalleryThumbStrip({ items, activeIndex, onSelect }: GalleryThumbStripProps) {
  return (
    <div
      role="tablist"
      aria-label="Seleccionar sector de instalaciones"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {items.map((item, idx) => {
        const selected = idx === activeIndex;
        const code = String(idx + 1).padStart(2, "0");
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(idx)}
            className={`w-full min-h-[76px] p-3 rounded-md border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
              selected
                ? "bg-brand-surface border-brand-primary border-t-4 border-t-brand-primary shadow-md"
                : "bg-brand-surface/60 border-brand-border hover:bg-brand-surface hover:border-brand-primary/50"
            }`}
          >
            <div className="relative w-20 h-14 rounded-sm overflow-hidden bg-brand-bg border border-brand-border shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt="" className="w-full h-full object-cover" />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-bg/90 font-mono text-[10px] font-black text-brand-primaryText">
                {code}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand-primaryText block truncate">
                {item.category}
              </span>
              <span className="text-sm font-extrabold text-brand-textPrimary block truncate">
                {item.title}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
