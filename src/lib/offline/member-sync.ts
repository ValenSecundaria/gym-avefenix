// Envío en lote de las altas guardadas sin internet.
// Garantías contra duplicados:
//  1. Un solo proceso de sincronización a la vez (en la pestaña y entre pestañas, vía Web Locks).
//  2. Un alta sólo se borra de la cola cuando el servidor confirma "created" o "already_synced".
//  3. Si una respuesta se pierde y se reenvía, el DNI único en la base hace que vuelva como "already_synced".
import { syncPendingMembers, type PendingMemberSyncResult } from "@/actions/members.actions";
import {
  listPendingMembers,
  removePendingMembers,
  updatePendingMembers,
  type PendingMember,
} from "./pending-members-store";

const MAX_ITEMS_PER_REQUEST = 25;
// Las Server Actions aceptan 1 MB por request: se deja margen para fotos en base64.
const MAX_BYTES_PER_REQUEST = 700 * 1024;
const LOCK_NAME = "gym-member-sync";

export interface MemberSyncSummary {
  created: number;
  alreadySynced: number;
  blocked: number;
  remaining: number;
  /** true si se cortó por falta de conexión (se reintentará). */
  offline: boolean;
  /** true si otra pestaña ya estaba sincronizando y esta no hizo nada. */
  skipped: boolean;
}

function chunkBySize(items: PendingMember[]): PendingMember[][] {
  const chunks: PendingMember[][] = [];
  let current: PendingMember[] = [];
  let currentBytes = 0;
  for (const item of items) {
    const bytes = JSON.stringify(item.input).length + 128;
    if (current.length > 0 && (current.length >= MAX_ITEMS_PER_REQUEST || currentBytes + bytes > MAX_BYTES_PER_REQUEST)) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(item);
    currentBytes += bytes;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

async function runSync(): Promise<MemberSyncSummary> {
  const summary: MemberSyncSummary = {
    created: 0,
    alreadySynced: 0,
    blocked: 0,
    remaining: 0,
    offline: false,
    skipped: false,
  };
  const pending = (await listPendingMembers()).filter((p) => !p.blocked);

  for (const chunk of chunkBySize(pending)) {
    let results: PendingMemberSyncResult[];
    try {
      const res = await syncPendingMembers(
        chunk.map((p) => ({ clientId: p.clientId, createdAt: p.createdAt, input: p.input }))
      );
      if (!res.success || !res.data) throw new Error(res.error || "Respuesta inválida");
      results = res.data;
    } catch {
      // Sin red o servidor caído: lo que no se confirmó sigue en la cola.
      summary.offline = true;
      break;
    }

    const byId = new Map(chunk.map((p) => [p.clientId, p]));
    const toRemove: string[] = [];
    const toUpdate: PendingMember[] = [];
    for (const r of results) {
      const item = byId.get(r.clientId);
      if (!item) continue;
      if (r.status === "created" || r.status === "already_synced") {
        toRemove.push(item.clientId);
        if (r.status === "created") summary.created++;
        else summary.alreadySynced++;
      } else {
        toUpdate.push({
          ...item,
          attempts: item.attempts + 1,
          lastError: r.message ?? null,
          blocked: r.status === "conflict" || r.status === "invalid",
        });
      }
    }
    await removePendingMembers(toRemove);
    await updatePendingMembers(toUpdate);
  }

  const left = await listPendingMembers();
  summary.blocked = left.filter((p) => p.blocked).length;
  summary.remaining = left.length - summary.blocked;
  return summary;
}

let inFlight: Promise<MemberSyncSummary> | null = null;

export function syncPendingMembersNow(): Promise<MemberSyncSummary> {
  if (inFlight) return inFlight;
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  const task = (async (): Promise<MemberSyncSummary> => {
    if (!locks) return runSync();
    // ifAvailable: si otra pestaña ya está sincronizando, esta no envía nada (evita envíos dobles).
    return await locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
      if (!lock) {
        return { created: 0, alreadySynced: 0, blocked: 0, remaining: 0, offline: false, skipped: true };
      }
      return runSync();
    });
  })();
  const tracked = task.finally(() => {
    inFlight = null;
  });
  inFlight = tracked;
  return tracked;
}
