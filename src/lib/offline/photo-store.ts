// Fotos de socios guardadas en el dispositivo (IndexedDB "gym_photo_store"), offline-first:
// toda foto se guarda acá ANTES de intentar subirla, y solo se da por sincronizada cuando el servidor
// confirma que la guardó. Si se corta internet o se cierra el navegador, la foto sigue acá.
// Las imágenes van como Blob en IndexedDB (nunca en localStorage).

export type PhotoSyncStatus = "PENDING" | "SYNCING" | "SYNCED" | "ERROR";

export interface LocalMemberPhoto {
  photoId: string;
  /** Socio en la base. null mientras el alta se hizo sin internet y todavía no se subió. */
  memberId: string | null;
  /** Alta sin internet a la que pertenece la foto (cola de altas pendientes). */
  pendingClientId: string | null;
  dni: string;
  /** Momento en que se sacó la foto: define el nombre del archivo en el servidor (evita duplicados). */
  capturedAt: number;
  blob: Blob;
  status: PhotoSyncStatus;
  attempts: number;
  lastError: string | null;
  /** No reintentar antes de este momento (epoch ms). */
  nextAttemptAt: number;
  /** Cuándo empezó la subida en curso: si el navegador se cerró a mitad, se retoma. */
  syncingSince: number | null;
  /** true = el servidor la rechazó (archivo dañado, socio eliminado): no se reintenta sola. */
  permanentError: boolean;
  serverFilename: string | null;
  syncedAt: number | null;
}

const DB_NAME = "gym_photo_store";
const DB_VERSION = 1;
const STORE = "photos";
const CHANGE_CHANNEL = "gym_member_photos";

const PHOTO_SIZE_PX = 400;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB no disponible"));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "photoId" });
        store.createIndex("memberId", "memberId", { unique: false });
        store.createIndex("pendingClientId", "pendingClientId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest | void): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));
        // Se resuelve recién cuando la transacción quedó escrita en disco.
        tx.oncomplete = () => resolve((request ? request.result : undefined) as T);
        const fail = () => reject((request ? request.error : null) ?? tx.error);
        tx.onerror = fail;
        tx.onabort = fail;
      })
  );
}

// ---- Aviso de cambios (misma pestaña + otras ventanas, como la pantalla de ingreso) ----
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (channel || typeof window === "undefined" || !("BroadcastChannel" in window)) return channel;
  try {
    channel = new BroadcastChannel(CHANGE_CHANNEL);
    channel.onmessage = () => listeners.forEach((l) => l());
  } catch {
    channel = null;
  }
  return channel;
}

function notifyChange() {
  listeners.forEach((l) => l());
  getChannel()?.postMessage("changed");
}

export function subscribeLocalPhotos(listener: () => void): () => void {
  getChannel();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---- Optimización de la imagen antes de guardarla ----

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Recorta al centro y achica a 400x400 en WebP (~20-40 KB). Si el navegador no sabe generar WebP
 * (Safari viejo), JPEG. El servidor la vuelve a normalizar igual.
 */
export async function optimizePhoto(source: string | Blob): Promise<Blob> {
  const input = typeof source === "string" ? await dataUrlToBlob(source) : source;
  const bitmap = await createImageBitmap(input);
  try {
    const size = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = PHOTO_SIZE_PX;
    canvas.height = PHOTO_SIZE_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) return input;
    ctx.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, PHOTO_SIZE_PX, PHOTO_SIZE_PX);
    const webp = await canvasToBlob(canvas, "image/webp", 0.82);
    if (webp && webp.type === "image/webp") return webp;
    return (await canvasToBlob(canvas, "image/jpeg", 0.85)) ?? input;
  } finally {
    bitmap.close();
  }
}

function newPhotoId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

// ---- API ----

/**
 * Guarda la foto en el dispositivo (primer paso, antes de cualquier subida). Devuelve el registro.
 * Va asociada a un socio existente (memberId) o a un alta sin internet (pendingClientId).
 */
export async function savePhotoLocally(params: {
  photo: string | Blob;
  dni: string;
  memberId?: string | null;
  pendingClientId?: string | null;
}): Promise<LocalMemberPhoto> {
  const blob = await optimizePhoto(params.photo);
  const record: LocalMemberPhoto = {
    photoId: newPhotoId(),
    memberId: params.memberId ?? null,
    pendingClientId: params.pendingClientId ?? null,
    dni: params.dni,
    capturedAt: Date.now(),
    blob,
    status: "PENDING",
    attempts: 0,
    lastError: null,
    nextAttemptAt: 0,
    syncingSince: null,
    permanentError: false,
    serverFilename: null,
    syncedAt: null,
  };
  await run<IDBValidKey>("readwrite", (s) => s.add(record));
  notifyChange();
  return record;
}

export async function listLocalPhotos(): Promise<LocalMemberPhoto[]> {
  try {
    return (await run<LocalMemberPhoto[]>("readonly", (s) => s.getAll())) ?? [];
  } catch {
    return [];
  }
}

export async function getLocalPhoto(photoId: string): Promise<LocalMemberPhoto | undefined> {
  return run<LocalMemberPhoto | undefined>("readonly", (s) => s.get(photoId));
}

export async function putLocalPhoto(record: LocalMemberPhoto): Promise<void> {
  await run<IDBValidKey>("readwrite", (s) => s.put(record));
  notifyChange();
}

/** Pasa a un socio real las fotos de un registro temporal (alta sin internet, o alta en curso). */
export async function linkPhotosToMember(pendingClientId: string, memberId: string, dni?: string): Promise<number> {
  const db = await openDb();
  const count = await new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const index = tx.objectStore(STORE).index("pendingClientId");
    let linked = 0;
    const cursorReq = index.openCursor(IDBKeyRange.only(pendingClientId));
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) return;
      const record = cursor.value as LocalMemberPhoto;
      cursor.update({ ...record, memberId, pendingClientId: null, dni: dni ?? record.dni, nextAttemptAt: 0 });
      linked++;
      cursor.continue();
    };
    tx.oncomplete = () => resolve(linked);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  if (count > 0) notifyChange();
  return count;
}

/** Cambia de registro temporal (ej.: el alta no llegó al servidor y pasa a la cola de altas sin internet). */
export async function relinkPendingPhotos(fromClientId: string, toClientId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const cursorReq = tx.objectStore(STORE).index("pendingClientId").openCursor(IDBKeyRange.only(fromClientId));
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) return;
      cursor.update({ ...(cursor.value as LocalMemberPhoto), pendingClientId: toClientId });
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  notifyChange();
}

/** Borra las fotos de un alta que no se va a hacer (rechazada por datos o descartada a mano). */
export async function deletePhotosOfPendingClient(pendingClientId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const cursorReq = tx.objectStore(STORE).index("pendingClientId").openCursor(IDBKeyRange.only(pendingClientId));
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) return;
      cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  notifyChange();
}

const SYNCED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Limpieza: solo se borran fotos YA sincronizadas (el servidor tiene su copia) que quedaron viejas o
 * que fueron reemplazadas por otra foto sincronizada más nueva del mismo socio. Nunca una pendiente.
 */
export async function pruneSyncedPhotos(now = Date.now()): Promise<void> {
  const all = await listLocalPhotos();
  const newestSyncedByMember = new Map<string, number>();
  for (const p of all) {
    if (p.status === "SYNCED" && p.memberId) {
      newestSyncedByMember.set(p.memberId, Math.max(newestSyncedByMember.get(p.memberId) ?? 0, p.capturedAt));
    }
  }
  const toDelete = all.filter(
    (p) =>
      p.status === "SYNCED" &&
      ((p.syncedAt !== null && now - p.syncedAt > SYNCED_RETENTION_MS) ||
        (p.memberId !== null && p.capturedAt < (newestSyncedByMember.get(p.memberId) ?? 0)))
  );
  if (toDelete.length === 0) return;
  await run<void>("readwrite", (s) => {
    toDelete.forEach((p) => s.delete(p.photoId));
  });
  notifyChange();
}
