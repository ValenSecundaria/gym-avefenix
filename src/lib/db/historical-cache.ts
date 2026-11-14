import type { HistoricalCheckInItem } from "@/actions/historical-checkins.actions";
import { openGymDb } from "./indexed-db";

export interface CachedHistoricalDate {
  dateKey: string;
  records: HistoricalCheckInItem[];
  lastAccessedAt: number;
}

export const STORE_HISTORICAL_CACHE = "historical_checkins_cache";
const MAX_CACHED_DATES = 2;

function isAvailable(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

export async function getCachedDateCheckIns(
  dateKey: string
): Promise<HistoricalCheckInItem[] | null> {
  if (!isAvailable()) return null;
  try {
    const db = await openGymDb();
    if (!db.objectStoreNames.contains(STORE_HISTORICAL_CACHE)) return null;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORICAL_CACHE, "readwrite");
      const store = tx.objectStore(STORE_HISTORICAL_CACHE);
      const req = store.get(dateKey);

      req.onsuccess = () => {
        const item = req.result as CachedHistoricalDate | undefined;
        if (!item) {
          resolve(null);
          return;
        }
        item.lastAccessedAt = Date.now();
        store.put(item);
        resolve(item.records);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[historical-cache] Error al leer caché:", err);
    return null;
  }
}

export async function saveDateCheckInsToCache(
  dateKey: string,
  records: HistoricalCheckInItem[]
): Promise<void> {
  if (!isAvailable()) return;
  try {
    const db = await openGymDb();
    if (!db.objectStoreNames.contains(STORE_HISTORICAL_CACHE)) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORICAL_CACHE, "readwrite");
      const store = tx.objectStore(STORE_HISTORICAL_CACHE);

      const entry: CachedHistoricalDate = {
        dateKey,
        records,
        lastAccessedAt: Date.now(),
      };
      store.put(entry);

      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const entries = (getAllReq.result as CachedHistoricalDate[]) || [];
        if (entries.length > MAX_CACHED_DATES) {
          // Ordenar de más antiguo a más reciente para desalojar los excedentes (LRU)
          entries.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
          const toRemoveCount = entries.length - MAX_CACHED_DATES;
          for (let i = 0; i < toRemoveCount; i++) {
            store.delete(entries[i].dateKey);
          }
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[historical-cache] Error al guardar caché:", err);
  }
}

export async function getRecentCachedDates(): Promise<string[]> {
  if (!isAvailable()) return [];
  try {
    const db = await openGymDb();
    if (!db.objectStoreNames.contains(STORE_HISTORICAL_CACHE)) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORICAL_CACHE, "readonly");
      const store = tx.objectStore(STORE_HISTORICAL_CACHE);
      const req = store.getAll();

      req.onsuccess = () => {
        const entries = (req.result as CachedHistoricalDate[]) || [];
        entries.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
        resolve(entries.slice(0, MAX_CACHED_DATES).map((e) => e.dateKey));
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[historical-cache] Error al leer fechas recientes:", err);
    return [];
  }
}
