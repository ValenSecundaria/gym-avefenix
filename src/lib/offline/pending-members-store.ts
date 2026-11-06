// Cola local (IndexedDB "gym_offline_store") de altas de socios hechas sin internet.
// Cada alta queda guardada en la PC hasta que el servidor confirma que la recibió.
import type { CreateMemberInput } from "@/lib/validations/member.schema";

const DB_NAME = "gym_offline_store";
const DB_VERSION = 1;
const STORE = "pendingMembers";
const CHANGE_EVENT_CHANNEL = "gym_pending_members";

export interface PendingMember {
  clientId: string; // id único generado en la PC: identifica el alta en toda la vida de la cola
  createdAt: number;
  input: CreateMemberInput;
  attempts: number;
  lastError: string | null;
  /** true cuando el servidor la rechazó por datos o DNI en conflicto: requiere revisión manual. */
  blocked: boolean;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB no disponible"));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        const store = request.result.createObjectStore(STORE, { keyPath: "clientId" });
        store.createIndex("dni", "input.dni", { unique: true });
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
        tx.oncomplete = () => resolve((request ? request.result : undefined) as T);
        // El error del request (p. ej. ConstraintError por DNI repetido) es más preciso que el de la transacción.
        const fail = () => reject((request ? request.error : null) ?? tx.error);
        tx.onerror = fail;
        tx.onabort = fail;
      })
  );
}

// ---- Aviso de cambios (misma pestaña + otras pestañas) ----
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (channel || typeof window === "undefined" || !("BroadcastChannel" in window)) return channel;
  try {
    channel = new BroadcastChannel(CHANGE_EVENT_CHANNEL);
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

export function subscribePendingMembers(listener: () => void): () => void {
  getChannel();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---- API ----

function newClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export class PendingDniError extends Error {}

/** Guarda un alta en la cola. Rechaza si ya hay un alta pendiente con el mismo DNI (índice único). */
export async function enqueuePendingMember(input: CreateMemberInput): Promise<PendingMember> {
  const item: PendingMember = {
    clientId: newClientId(),
    createdAt: Date.now(),
    input,
    attempts: 0,
    lastError: null,
    blocked: false,
  };
  try {
    await run<IDBValidKey>("readwrite", (s) => s.add(item));
  } catch (error) {
    if (error instanceof DOMException && error.name === "ConstraintError") {
      throw new PendingDniError(`Ya hay un alta pendiente de subir con el DNI ${input.dni}`);
    }
    throw error;
  }
  notifyChange();
  return item;
}

export async function listPendingMembers(): Promise<PendingMember[]> {
  try {
    const all = await run<PendingMember[]>("readonly", (s) => s.getAll());
    return (all ?? []).sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export async function removePendingMembers(clientIds: string[]): Promise<void> {
  if (clientIds.length === 0) return;
  await run<void>("readwrite", (s) => {
    clientIds.forEach((id) => s.delete(id));
  });
  notifyChange();
}

export async function updatePendingMembers(items: PendingMember[]): Promise<void> {
  if (items.length === 0) return;
  await run<void>("readwrite", (s) => {
    items.forEach((item) => s.put(item));
  });
  notifyChange();
}
