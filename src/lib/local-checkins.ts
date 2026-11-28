import type { LiveCheckInItem } from "@/types";
import { getPendingCheckIns, getMemberFromCache } from "@/lib/db/indexed-db";
import { getMemberPhotoUrl } from "@/lib/utils";

// Ingresos de hoy que siguen en la cola local (todavía no subidos a la base en el lote horario).
// La lista del servidor no los tiene: sin esto, cada refresco "borraba" los ingresos del día.
export async function getTodayLocalCheckIns(): Promise<LiveCheckInItem[]> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const pending = await getPendingCheckIns();
  const items: LiveCheckInItem[] = [];
  for (const p of pending) {
    if (new Date(p.createdAt) < startOfToday) continue;
    const cached = p.fullName ? undefined : await getMemberFromCache(p.dni);
    items.push({
      id: `pending_${p.id}`,
      memberId: p.memberId,
      dni: p.dni,
      fullName: p.fullName ?? cached?.fullName ?? `DNI ${p.dni}`,
      photoUrl: getMemberPhotoUrl(p.dni, p.photoFilename ?? cached?.photoFilename),
      planName: p.planName ?? cached?.planName ?? "Sin plan",
      status: p.status,
      createdAt: p.createdAt,
    });
  }
  return items;
}
