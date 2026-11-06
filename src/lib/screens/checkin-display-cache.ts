// Caché local (localStorage) de lo que muestra la pantalla de Check-in.
// Permite que, tras recargar la página o reiniciar la PC del molinete, se siga mostrando
// el último socio HABILITADO y que una alerta (CUOTA_VENCIDA / LIMITE_ALCANZADO) respete
// su minuto restante en lugar de reiniciarse o perderse.
// Se expone como store externo para usar con useSyncExternalStore.
import type { CheckInVerificationResult } from "@/types";

const STORAGE_KEY = "gym_checkin_display_v1";

export interface CheckInDisplayCache {
  lastEnabled: CheckInVerificationResult | null;
  alert: CheckInVerificationResult | null;
  alertUntil: number | null; // epoch ms en que la alerta deja de mostrarse
}

const EMPTY_CACHE: CheckInDisplayCache = { lastEnabled: null, alert: null, alertUntil: null };

const listeners = new Set<() => void>();
// Respaldo en memoria por si localStorage está bloqueado o lleno.
let memoryRaw: string | null = null;
let snapshotRaw: string | null = null;
let snapshotValue: CheckInDisplayCache = EMPTY_CACHE;

function isResult(value: unknown): value is CheckInVerificationResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.memberId === "string" && typeof v.fullName === "string" && typeof v.status === "string";
}

function parse(raw: string | null): CheckInDisplayCache {
  if (!raw) return EMPTY_CACHE;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      lastEnabled: isResult(parsed.lastEnabled) ? parsed.lastEnabled : null,
      alert: isResult(parsed.alert) ? parsed.alert : null,
      alertUntil: typeof parsed.alertUntil === "number" ? parsed.alertUntil : null,
    };
  } catch {
    return EMPTY_CACHE;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryRaw;
  } catch {
    return memoryRaw;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function getCheckInDisplaySnapshot(): CheckInDisplayCache {
  const raw = readRaw();
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshotValue = parse(raw);
  }
  return snapshotValue;
}

export function getCheckInDisplayServerSnapshot(): CheckInDisplayCache {
  return EMPTY_CACHE;
}

export function subscribeCheckInDisplay(listener: () => void): () => void {
  listeners.add(listener);
  // Otra pestaña del mismo navegador modificó el caché
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function writeCheckInDisplayCache(cache: CheckInDisplayCache): void {
  const raw = JSON.stringify(cache);
  memoryRaw = raw;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Almacenamiento lleno o bloqueado: queda solo en memoria.
  }
  notify();
}

export function clearCheckInDisplayCache(): void {
  memoryRaw = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
  notify();
}
