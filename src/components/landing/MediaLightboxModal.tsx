"use client";

import React from "react";
import { X } from "lucide-react";
import type { MediaItem } from "./media.types";

interface MediaLightboxModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export function MediaLightboxModal({ item, onClose }: MediaLightboxModalProps) {
  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-brand-border bg-brand-bg">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-brand-surfaceHover text-brand-primaryText">
              {item.category}
            </span>
            <h4 className="text-base sm:text-lg font-extrabold text-brand-textPrimary">{item.title}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-brand-surface hover:bg-brand-surfaceHover text-brand-textPrimary border border-brand-border transition-colors cursor-pointer"
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

        <div className="p-4 sm:p-5 bg-brand-bg border-t border-brand-border flex items-center justify-between">
          <p className="text-sm text-brand-textSecondary leading-relaxed">{item.description}</p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-surfaceHover hover:bg-brand-border text-brand-textPrimary text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ml-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
