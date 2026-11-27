"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import type { MediaItem } from "./media.types";

interface MediaLightboxModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export function MediaLightboxModal({ item, onClose }: MediaLightboxModalProps) {
  useEffect(() => {
    if (!item) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-brand-surface border-2 border-brand-border rounded-lg overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-bg">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-sm bg-brand-surface border border-brand-primary/50 text-brand-primaryText">
              {item.category}
            </span>
            <h4 className="text-base sm:text-lg font-black uppercase text-brand-textPrimary">{item.title}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] rounded-md bg-brand-surface hover:bg-brand-surfaceHover text-brand-textPrimary border border-brand-border flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar vista previa"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative w-full max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
          {item.type === "video" ? (
            <video src={item.src} poster={item.poster} controls autoPlay playsInline className="max-h-[70vh] w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt={item.title} className="max-h-[70vh] w-full object-contain" />
          )}
        </div>

        <div className="p-4 bg-brand-bg border-t border-brand-border flex items-center justify-between gap-4">
          <p className="text-sm text-brand-textSecondary leading-relaxed">{item.description}</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-5 rounded-md bg-brand-primary hover:bg-brand-primaryHover text-[#0A0B0D] text-xs font-black uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
