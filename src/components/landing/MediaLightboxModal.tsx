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
        className="relative max-w-4xl w-full bg-[#17171C] border border-[#2C2D35] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2C2D35] bg-[#0B0B0C]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#23232A] text-[#F95716]">
              {item.category}
            </span>
            <h4 className="text-base sm:text-lg font-extrabold text-[#F4F5F7]">{item.title}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#17171C] hover:bg-[#23232A] text-[#F4F5F7] border border-[#2C2D35] transition-colors cursor-pointer"
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

        <div className="p-4 sm:p-5 bg-[#0B0B0C] border-t border-[#2C2D35] flex items-center justify-between">
          <p className="text-sm text-[#8A909A] leading-relaxed">{item.description}</p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#23232A] hover:bg-[#2C2D35] text-[#F4F5F7] text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ml-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
