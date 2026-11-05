import { prisma } from "@/lib/prisma";

export function getArgentinaCutoff(checkInDate: Date): Date {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(checkInDate);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const year = get("year");
  const month = get("month");
  const day = get("day");

  // 22:05 hs en Argentina (UTC-3) equivale a las 01:05 UTC del día siguiente
  return new Date(Date.UTC(year, month - 1, day, 25, 5, 0, 0));
}

export async function autoCloseExpiredShifts(now = new Date()): Promise<number> {
  try {
    const openShifts = await prisma.teacherShift.findMany({
      where: { checkOut: null },
      orderBy: { checkIn: "asc" },
    });

    let closedCount = 0;
    for (const shift of openShifts) {
      const cutoff = getArgentinaCutoff(shift.checkIn);
      if (now.getTime() >= cutoff.getTime()) {
        const diffMs = Math.max(0, cutoff.getTime() - shift.checkIn.getTime());
        const totalMinutes = Math.round(diffMs / 60000);
        const note = shift.notes
          ? `${shift.notes} - Cierre automático (22:05 hs)`
          : "Cierre automático (22:05 hs)";

        await prisma.teacherShift.update({
          where: { id: shift.id },
          data: {
            checkOut: cutoff,
            totalMinutes,
            notes: note,
          },
        });
        closedCount++;
      }
    }
    return closedCount;
  } catch (error) {
    console.error("[autoCloseExpiredShifts] Error:", error);
    return 0;
  }
}
