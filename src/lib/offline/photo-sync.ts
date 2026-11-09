// Subida de las fotos guardadas en el dispositivo (ver photo-store.ts).
// Garantías:
//  1. Una sola subida a la vez, en la pestaña y entre pestañas/ventanas (Web Locks).
//  2. La foto local se marca SYNCED solo cuando el servidor confirma que la guardó (también en Supabase).
//  3. Reintentar es seguro: el servidor arma el nombre del archivo con DNI + momento de la foto, así que
//     una respuesta perdida o un doble envío reescribe el mismo archivo y no duplica nada.
//  4. Si se corta internet o el navegador se cierra a mitad de una subida, la foto vuelve a PENDING.
import { uploadMemberPhoto } from "@/actions/member-photos.actions";
import { updateMemberInCache } from "@/lib/db/indexed-db";
import { listLocalPhotos, pruneSyncedPhotos, putLocalPhoto, type LocalMemberPhoto } from "./photo-store";

const LOCK_NAME = "gym-photo-sync";
/** Una subida "SYNCING" más vieja que esto quedó cortada (pestaña cerrada): se retoma. */
const STALE_SYNCING_MS = 2 * 60 * 1000;
const BASE_RETRY_MS = 15_000;
const MAX_RETRY_MS = 30 * 60 * 1000;

export interface PhotoSyncSummary {
  synced: number;
  failed: number;
  remaining: number;
  offline: boolean;
  skipped: boolean;
}

function backoff(attempts: number): number {
  return Math.min(BASE_RETRY_MS * 2 ** Math.max(0, attempts - 1), MAX_RETRY_MS);
}

function isDue(p: LocalMemberPhoto, now: number): boolean {
  if (!p.memberId || p.permanentError) return false;
  if (p.status === "SYNCED") return false;
  if (p.status === "SYNCING") return p.syncingSince === null || now - p.syncingSince > STALE_SYNCING_MS;
  return p.nextAttemptAt <= now;
}

function extensionFor(blob: Blob): string {
  return blob.type === "image/jpeg" ? "jpg" : "webp";
}

async function uploadOne(photo: LocalMemberPhoto): Promise<"synced" | "failed" | "offline"> {
  const syncing: LocalMemberPhoto = { ...photo, status: "SYNCING", syncingSince: Date.now() };
  await putLocalPhoto(syncing);

  const form = new FormData();
  form.set("memberId", photo.memberId!);
  form.set("capturedAt", String(photo.capturedAt));
  form.set("photo", photo.blob, `${photo.photoId}.${extensionFor(photo.blob)}`);

  let res;
  try {
    res = await uploadMemberPhoto(form);
  } catch {
    // Sin red o servidor caído: sigue pendiente, se reintenta al volver la conexión.
    await putLocalPhoto({ ...syncing, status: "PENDING", syncingSince: null, nextAttemptAt: Date.now() + BASE_RETRY_MS });
    return "offline";
  }

  const attempts = photo.attempts + 1;
  if (!res.success || !res.data) {
    await putLocalPhoto({
      ...syncing,
      status: "ERROR",
      syncingSince: null,
      attempts,
      lastError: res.error || "El servidor no aceptó la foto",
      nextAttemptAt: Date.now() + backoff(attempts),
    });
    return "failed";
  }

  const { status, photoFilename, message } = res.data;
  if (status === "applied" || status === "superseded") {
    await putLocalPhoto({
      ...syncing,
      status: "SYNCED",
      syncingSince: null,
      attempts,
      lastError: null,
      serverFilename: photoFilename ?? null,
      syncedAt: Date.now(),
    });
    // La pantalla de ingreso usa la caché de socios: se le pasa el archivo nuevo.
    if (status === "applied" && photoFilename) {
      updateMemberInCache(photo.dni, { photoFilename }).catch(() => {});
    }
    return "synced";
  }

  if (status === "cloud_pending") {
    // Guardada en la notebook pero no en Supabase: se vuelve a intentar más tarde (sin duplicar).
    await putLocalPhoto({
      ...syncing,
      status: "PENDING",
      syncingSince: null,
      attempts,
      lastError: message ?? "Falta subirla a la nube",
      serverFilename: photoFilename ?? null,
      nextAttemptAt: Date.now() + backoff(attempts),
    });
    return "failed";
  }

  // invalid / member_missing: no tiene sentido reintentar solo. La foto queda guardada en el dispositivo.
  await putLocalPhoto({
    ...syncing,
    status: "ERROR",
    syncingSince: null,
    attempts,
    permanentError: true,
    lastError: message ?? "El servidor rechazó la foto",
  });
  return "failed";
}

async function runSync(): Promise<PhotoSyncSummary> {
  const summary: PhotoSyncSummary = { synced: 0, failed: 0, remaining: 0, offline: false, skipped: false };
  const now = Date.now();
  const due = (await listLocalPhotos()).filter((p) => isDue(p, now)).sort((a, b) => a.capturedAt - b.capturedAt);

  for (const photo of due) {
    const outcome = await uploadOne(photo);
    if (outcome === "synced") summary.synced++;
    else if (outcome === "failed") summary.failed++;
    else {
      summary.offline = true;
      break;
    }
  }

  if (!summary.offline) await pruneSyncedPhotos().catch(() => {});
  summary.remaining = (await listLocalPhotos()).filter((p) => p.status !== "SYNCED").length;
  return summary;
}

/** Botón "Subir ahora": saltea la espera entre reintentos (no toca las rechazadas por el servidor). */
export async function retryLocalPhotosNow(): Promise<PhotoSyncSummary> {
  const waiting = (await listLocalPhotos()).filter(
    (p) => p.memberId && !p.permanentError && (p.status === "PENDING" || p.status === "ERROR") && p.nextAttemptAt > 0
  );
  for (const p of waiting) await putLocalPhoto({ ...p, nextAttemptAt: 0 });
  return syncLocalPhotosNow();
}

let inFlight: Promise<PhotoSyncSummary> | null = null;

export function syncLocalPhotosNow(): Promise<PhotoSyncSummary> {
  if (inFlight) return inFlight;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return Promise.resolve({ synced: 0, failed: 0, remaining: 0, offline: true, skipped: true });
  }
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  const task = (async (): Promise<PhotoSyncSummary> => {
    if (!locks) return runSync();
    // ifAvailable: si otra ventana ya está subiendo, esta no envía nada (evita envíos dobles).
    return await locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
      if (!lock) return { synced: 0, failed: 0, remaining: 0, offline: false, skipped: true };
      return runSync();
    });
  })();
  const tracked = task.finally(() => {
    inFlight = null;
  });
  inFlight = tracked;
  return tracked;
}
