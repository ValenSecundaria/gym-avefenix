"use client";

import React from "react";
import { Camera, Video, Maximize2 } from "lucide-react";
import type { MediaItem } from "./media.types";

interface MediaItemCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
}

export function MediaItemCard({ item, onSelect }: MediaItemCardProps) {
  if (item.type === "video") {
    return (
      <div className="group relative rounded-2xl bg-[#17171C] border border-[#2C2D35] hover:border-[#F95716]/60 overflow-hidden shadow-lg transition-all flex flex-col h-full">
        <div className="relative w-full aspect-video bg-black overflow-hidden">
          <video
            src={item.src}
            poster={item.poster}
            playsInline
            muted
            loop
            autoPlay={false}
            controls
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0B0C]/80 backdrop-blur-md border border-[#2C2D35] text-[#FFB300] text-xs font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Video</span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="absolute top-3 right-3 p-2 rounded-xl bg-[#0B0B0C]/80 hover:bg-[#F95716] text-[#F4F5F7] border border-[#2C2D35] transition-colors"
            title="Ampliar video"
          >
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5 flex flex-col justify-between flex-1 gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F95716]">{item.category}</span>
          <h3 className="text-lg font-bold text-[#F4F5F7] group-hover:text-[#F95716] transition-colors">{item.title}</h3>
          <p className="text-xs sm:text-sm text-[#8A909A] leading-relaxed">{item.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative rounded-2xl bg-[#17171C] border border-[#2C2D35] hover:border-[#F95716]/60 overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="relative w-full aspect-video overflow-hidden bg-[#0B0B0C]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0B0C]/80 backdrop-blur-md border border-[#2C2D35] text-[#F4F5F7] text-xs font-bold uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-[#F95716]" aria-hidden="true" />
          <span>Foto</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0B0C]/85 border border-[#F95716] text-[#F4F5F7] text-xs font-bold uppercase tracking-wider shadow-xl">
            <Maximize2 className="w-4 h-4 text-[#F95716]" aria-hidden="true" />
            <span>Ver Foto</span>
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col justify-between flex-1 gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FFB300]">{item.category}</span>
        <h3 className="text-lg font-bold text-[#F4F5F7] group-hover:text-[#F95716] transition-colors">{item.title}</h3>
        <p className="text-xs sm:text-sm text-[#8A909A] leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}
