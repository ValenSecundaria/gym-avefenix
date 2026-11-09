"use client";

import { useEffect, useSyncExternalStore } from "react";
import { listLocalPhotos, subscribeLocalPhotos, type PhotoSyncStatus } from "./photo-store";
import { syncLocalPhotosNow } from "./photo-sync";

// -------------------------------------------------------------
// Estado en memoria de las fotos guardadas en el dispositivo, para mostrarlas en pantalla.
// Por socio se toma la foto local más nueva; se muestra en lugar de la del servidor solo si es más
// nueva que la que el servidor ya tiene (así una foto sacada en otro equipo después no queda tapada).
// -------------------------------------------------------------

export interface LocalPhotoView {
  photoId: string;
  capturedAt: number;
  status: PhotoSyncStatus;
  permanentError: boolean;
  lastError: string | null;
  url: string;
}

interface Snapshot {
  byMember: Map<string, LocalPhotoView>;
  pending: number;
  errors: number;
}

const EMPTY: Snapshot = { byMember: new Map(), pending: 0, errors: 0 };

let snapshot: Snapshot = EMPTY;
const objectUrls = new Map<string, string>();
const listeners = new Set<() => void>();
let unsubscribeStore: (() => void) | null = null;
let refreshing: Promise<void> | null = null;
let refreshQueued = false;

async function refresh(): Promise<void> {
  if (refreshing) {
    refreshQueued = true;
    return refreshing;
  }
  refreshing = (async () => {
    do {
      refreshQueued = false;
      const photos = await listLocalPhotos();
      const byMember = new Map<string, LocalPhotoView>();
      const alive = new Set<string>();
      let pending = 0;
      let errors = 0;
      for (const p of photos) {
        if (p.status === "ERROR") errors++;
        else if (p.status !== "SYNCED") pending++;
        if (!p.memberId) continue;
        const current = byMember.get(p.memberId);
        if (current && current.capturedAt >= p.capturedAt) continue;
        let url = objectUrls.get(p.photoId);
        if (!url) {
          url = URL.createObjectURL(p.blob);
          objectUrls.set(p.photoId, url);
        }
        byMember.set(p.memberId, {
          photoId: p.photoId,
          capturedAt: p.capturedAt,
          status: p.status,
          permanentError: p.permanentError,
          lastError: p.lastError,
          url,
        });
      }
      for (const view of byMember.values()) alive.add(view.photoId);
      for (const [photoId, url] of objectUrls) {
        if (!alive.has(photoId)) {
          URL.revokeObjectURL(url);
          objectUrls.delete(photoId);
        }
      }
      snapshot = { byMember, pending, errors };
      listeners.forEach((l) => l());
    } while (refreshQueued);
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!unsubscribeStore) {
    unsubscribeStore = subscribeLocalPhotos(() => void refresh());
    void refresh();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && unsubscribeStore) {
      unsubscribeStore();
      unsubscribeStore = null;
    }
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

function useSnapshot(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Momento de la foto que tiene el servidor, sacado de la URL (?v=member-DNI-<ms>.webp). 0 si no tiene. */
function serverPhotoTimestamp(src: string | null | undefined): number {
  if (!src) return 0;
  let decoded = src;
  try {
    decoded = decodeURIComponent(src);
  } catch {
    // URL con caracteres raros: se usa tal cual.
  }
  const match = decoded.match(/[?&]v=member-[^&]*-(\d{10,})\.\w+/);
  return match ? Number(match[1]) : 0;
}

/** Foto local del socio si es más nueva que la del servidor (o el servidor todavía no la tiene). */
export function useLocalMemberPhoto(memberId: string | null | undefined, serverSrc?: string | null): LocalPhotoView | null {
  const { byMember } = useSnapshot();
  if (!memberId) return null;
  const local = byMember.get(memberId);
  if (!local) return null;
  return local.capturedAt > serverPhotoTimestamp(serverSrc) ? local : null;
}

/** Cantidad de fotos que todavía no se subieron y con error, para el aviso del panel. */
export function useLocalPhotoCounts(): { pending: number; errors: number } {
  const { pending, errors } = useSnapshot();
  return { pending, errors };
}

const RETRY_INTERVAL_MS = 30_000;

/**
 * Sube solas las fotos pendientes: al abrir el panel, al volver la conexión, cuando se guarda una
 * foto nueva y cada 30 s mientras quede alguna.
 */
export function usePhotoSync(): void {
  useEffect(() => {
    let disposed = false;
    const trigger = () => {
      if (!disposed) void syncLocalPhotosNow().catch(() => {});
    };
    const unsubscribe = subscribeLocalPhotos(() => {
      // Cambios provocados por la propia subida también avisan: el candado evita subidas dobles.
      window.setTimeout(trigger, 500);
    });
    window.addEventListener("online", trigger);
    const intervalId = window.setInterval(trigger, RETRY_INTERVAL_MS);
    const kickoffId = window.setTimeout(trigger, 0);
    return () => {
      disposed = true;
      unsubscribe();
      window.removeEventListener("online", trigger);
      window.clearInterval(intervalId);
      window.clearTimeout(kickoffId);
    };
  }, []);
}
