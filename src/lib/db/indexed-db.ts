import type { CachedMember, PendingCheckIn } from "@/types";

const DB_NAME = "gym_local_db";
const DB_VERSION = 1;
const STORE_MEMBERS = "members_cache";
const STORE_PENDING = "pending_checkins";

let dbPromise: Promise<IDBDatabase> | null = null;

function isAvailable(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

export function openGymDb(): Promise<IDBDatabase> {
  if (!isAvailable()) {
    return Promise.reject(new Error("IndexedDB no disponible en este entorno"));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MEMBERS)) {
        db.createObjectStore(STORE_MEMBERS, { keyPath: "dni" });
      }
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: "id", autoIncrement: true });
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

export async function saveMembersToCache(membersArray: CachedMember[]): Promise<void> {
  if (!isAvailable() || membersArray.length === 0) return;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERS, "readwrite");
    const store = tx.objectStore(STORE_MEMBERS);
    for (const member of membersArray) {
      store.put(member);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Reemplaza todo el catálogo local por el del servidor: así desaparecen los socios eliminados
// o dados de baja que quedaron en la caché (si no, podrían seguir pasando por el molinete).
export async function replaceMembersCache(membersArray: CachedMember[]): Promise<void> {
  if (!isAvailable()) return;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERS, "readwrite");
    const store = tx.objectStore(STORE_MEMBERS);
    store.clear();
    for (const member of membersArray) {
      store.put(member);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeMembersFromCache(dnis: string[]): Promise<void> {
  if (!isAvailable() || dnis.length === 0) return;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERS, "readwrite");
    const store = tx.objectStore(STORE_MEMBERS);
    for (const dni of dnis) {
      store.delete(dni);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMemberFromCache(dni: string): Promise<CachedMember | undefined> {
  if (!isAvailable()) return undefined;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERS, "readonly");
    const request = tx.objectStore(STORE_MEMBERS).get(dni);
    request.onsuccess = () => resolve(request.result as CachedMember | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function updateMemberInCache(
  dni: string,
  partialData: Partial<CachedMember>
): Promise<void> {
  if (!isAvailable()) return;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERS, "readwrite");
    const store = tx.objectStore(STORE_MEMBERS);
    const getReq = store.get(dni);
    getReq.onsuccess = () => {
      const existing = getReq.result as CachedMember | undefined;
      if (!existing) {
        resolve();
        return;
      }
      const updated = { ...existing, ...partialData };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function enqueuePendingCheckIn(
  checkInItem: Omit<PendingCheckIn, "id">
): Promise<number> {
  if (!isAvailable()) return -1;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readwrite");
    const store = tx.objectStore(STORE_PENDING);
    const req = store.add(checkInItem);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingCheckIns(): Promise<PendingCheckIn[]> {
  if (!isAvailable()) return [];
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readonly");
    const request = tx.objectStore(STORE_PENDING).getAll();
    request.onsuccess = () => resolve((request.result as PendingCheckIn[]) || []);
    request.onerror = () => reject(request.error);
  });
}

export async function removeSyncedCheckIns(ids: number[]): Promise<void> {
  if (!isAvailable() || ids.length === 0) return;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, "readwrite");
    const store = tx.objectStore(STORE_PENDING);
    for (const id of ids) {
      store.delete(id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMembersCacheCount(): Promise<number> {
  if (!isAvailable()) return 0;
  const db = await openGymDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERS, "readonly");
    const req = tx.objectStore(STORE_MEMBERS).count();
    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => reject(req.error);
  });
}
