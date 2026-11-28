"use client";

import React, { useState } from "react";
import { AlertTriangle, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { useLocalPhotoCounts } from "@/lib/offline/use-local-photos";
import { retryLocalPhotosNow } from "@/lib/offline/photo-sync";

/** Aviso (mismo estilo que el de altas pendientes) cuando hay fotos de socios sin subir en esta PC. */
export function PendingPhotosNotice() {
  const { pending, errors } = useLocalPhotoCounts();
  const [isSyncing, setIsSyncing] = useState(false);
  if (pending === 0 && errors === 0) return null;

  const retry = async () => {
    setIsSyncing(true);
    try {
      await retryLocalPhotosNow();
    } catch {
      // Sin conexión: queda para el próximo intento automático.
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-fx-orange/10 border border-fx-orange text-sm text-fx-text">
      <div className="flex flex-col gap-1">
        {pending > 0 && (
          <span className="flex items-center gap-2.5 font-bold">
            <CloudOff className="w-5 h-5 text-fx-orange shrink-0" />
            <span>
              {pending === 1 ? "1 foto guardada en esta PC, pendiente de subir" : `${pending} fotos guardadas en esta PC, pendientes de subir`}
              <span className="font-normal text-fx-muted"> · se ven igual y se suben solas</span>
            </span>
          </span>
        )}
        {errors > 0 && (
          <span className="flex items-center gap-2.5 font-bold text-fx-red">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              {errors === 1 ? "1 foto no se pudo subir" : `${errors} fotos no se pudieron subir`}
              <span className="font-normal text-fx-muted"> · siguen guardadas en esta PC</span>
            </span>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => void retry()}
        disabled={isSyncing}
        className="min-h-[40px] px-4 rounded-xl bg-fx-orange text-white text-xs font-bold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        <span>{isSyncing ? "Subiendo..." : "Subir ahora"}</span>
      </button>
    </div>
  );
}
