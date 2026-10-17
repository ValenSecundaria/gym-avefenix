// Wrapper mínimo de IndexedDB para la base "gym_auth_store" (sólo cliente).
import { AUTH_DB_NAME } from "./auth-constants";

const DB_VERSION = 1;

/** "session": sesión activa replicada · "credentials": caché segura de verificadores offline por usuario. */
export type AuthStoreName = "session" | "credentials";
const STORES: AuthStoreName[] = ["session", "credentials"];

let dbPromise: Promise<IDBDatabase> | null = null;

function isAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(AUTH_DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      STORES.forEach((name) => {
        if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name);
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

async function runRequest<T>(
  store: AuthStoreName,
  mode: IDBTransactionMode,
  action: (objectStore: IDBObjectStore) => IDBRequest
): Promise<T | undefined> {
  if (!isAvailable()) return undefined;
  const db = await openDb();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(request.result as T | undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function idbGet<T>(store: AuthStoreName, key: string): Promise<T | undefined> {
  try {
    return await runRequest<T>(store, "readonly", (s) => s.get(key));
  } catch {
    return undefined;
  }
}

export async function idbPut<T>(store: AuthStoreName, key: string, value: T): Promise<void> {
  try {
    await runRequest(store, "readwrite", (s) => s.put(value, key));
  } catch (error) {
    console.warn("[gym_auth_store] No se pudo guardar en IndexedDB:", error);
  }
}

export async function idbDelete(store: AuthStoreName, key: string): Promise<void> {
  try {
    await runRequest(store, "readwrite", (s) => s.delete(key));
  } catch {
    // Si IndexedDB no está disponible no hay nada que borrar.
  }
}

export async function idbClear(store: AuthStoreName): Promise<void> {
  try {
    await runRequest(store, "readwrite", (s) => s.clear());
  } catch {
    // Si IndexedDB no está disponible no hay nada que borrar.
  }
}

