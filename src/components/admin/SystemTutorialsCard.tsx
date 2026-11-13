"use client";

import React from "react";
import { ListVideo, ExternalLink, PlaySquare } from "lucide-react";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

export function SystemTutorialsCard() {
  const tutorialsUrl = GYM_BRAND_CONFIG.assets.tutorialsPlaylistUrl;
  return (
    <div className="w-full py-4 space-y-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-extrabold text-fx-text flex items-center gap-2">
          <ListVideo className="w-5 h-5 text-red-500" />
          Tutoriales del Sistema
        </h3>
        <p className="text-sm text-fx-muted mt-1 leading-relaxed">
          Videos explicativos con las funcionalidades clave del sistema, resolución de dudas y cómo operar día a día.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-fx-surface border border-fx-border flex flex-col justify-between gap-5 flex-1">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <PlaySquare className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-fx-text">Playlist Oficial de Capacitación</h4>
            <p className="text-xs text-fx-muted leading-relaxed">
              Guías paso a paso para recepción, gestión de cuotas, cobros, asistencia y solución de problemas comunes.
            </p>
          </div>
        </div>

        <a
          href={tutorialsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <PlaySquare className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>Ver Playlist en YouTube</span>
          <ExternalLink className="w-4 h-4 opacity-75" />
        </a>
      </div>
    </div>
  );
}
