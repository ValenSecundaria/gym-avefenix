import { prisma } from "@/lib/prisma";
import type { BatchCheckInPayload } from "@/types";

// Guarda el lote de ingresos de la cola local. Se descartan los de socios que ya no existen
// (eliminados después de pasar por el molinete): si no, la clave foránea hace fallar todo el lote
// y la cola no se podría vaciar nunca.
export async function insertCheckInBatch(items: BatchCheckInPayload[]): Promise<number> {
  if (items.length === 0) return 0;

  const memberIds = [...new Set(items.map((item) => item.memberId))];
  const existing = await prisma.member.findMany({ where: { id: { in: memberIds } }, select: { id: true } });
  const existingIds = new Set(existing.map((m) => m.id));
  const valid = items.filter((item) => existingIds.has(item.memberId));
  if (valid.length === 0) return 0;

  const inserted = await prisma.checkIn.createMany({
    data: valid.map((item) => ({
      memberId: item.memberId,
      status: item.status,
      createdAt: new Date(item.createdAt),
      isSynced: true,
    })),
  });
  return inserted.count;
}
