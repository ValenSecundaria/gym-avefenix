"use client";

import React from "react";
import { CloudOff, Loader2, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import type { PendingMember } from "@/lib/offline/pending-members-store";

interface PendingMembersBannerProps {
  pending: PendingMember[];
  isSyncing: boolean;
  onSyncNow: () => void;
  onDiscard: (clientId: string) => void;
}

export function PendingMembersBanner({ pending, isSyncing, onSyncNow, onDiscard }: PendingMembersBannerProps) {
  if (pending.length === 0) return null;
  const waiting = pending.filter((p) => !p.blocked);
  const blocked = pending.filter((p) => p.blocked);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-fx-orange/10 border border-fx-orange text-sm text-fx-text">
      {waiting.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-bold">
            <CloudOff className="w-5 h-5 text-fx-orange shrink-0" />
            <span>
              {waiting.length === 1
                ? "1 socio guardado en esta PC, pendiente de subir"
                : `${waiting.length} socios guardados en esta PC, pendientes de subir`}
              <span className="font-normal text-fx-muted"> · se suben solos al volver internet</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing}
            className="min-h-[40px] px-4 rounded-xl bg-fx-orange text-white text-xs font-bold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isSyncing ? "Subiendo..." : "Subir ahora"}</span>
          </button>
        </div>
      )}

      {blocked.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 font-bold text-fx-red">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Altas guardadas que el servidor rechazó (revisar a mano)</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {blocked.map((p) => (
              <li
                key={p.clientId}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-fx-base border border-fx-border"
              >
                <span>
                  <span className="font-bold">{p.input.fullName}</span>
                  <span className="font-mono text-fx-muted"> · DNI {p.input.dni}</span>
                  {p.lastError && <span className="block text-xs text-fx-muted">{p.lastError}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => onDiscard(p.clientId)}
                  className="min-h-[36px] px-3 rounded-lg border border-fx-border text-xs text-fx-muted hover:text-fx-text inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Descartar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
