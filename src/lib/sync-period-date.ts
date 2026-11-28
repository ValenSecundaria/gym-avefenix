// TODO [TEMPORARY-TRANSITION]: Eliminar junto con el botón "Regularizar".
// Fecha de vencimiento del botón "Regularizar": SIEMPRE hoy + 30 días de calendario.
// Nunca usa el vencimiento que tenía el socio. Ej: hoy 09/11/2026 -> vence 09/12/2026.
// Usa el reloj del sistema operativo (no hace falta ninguna API externa).

export const SYNC_PERIOD_DAYS = 30;
const AR_OFFSET_MS = 3 * 60 * 60 * 1000; // Argentina = UTC-3, sin horario de verano

/** Hoy (hora argentina) + `days` días de calendario, a las 23:59:59 hora argentina. */
export function syncPeriodValidUntil(now: Date = new Date(), days: number = SYNC_PERIOD_DAYS): Date {
  const ar = new Date(now.getTime() - AR_OFFSET_MS); // reloj argentino expresado en UTC
  const endOfDayUtc = Date.UTC(ar.getUTCFullYear(), ar.getUTCMonth(), ar.getUTCDate() + days, 23, 59, 59);
  return new Date(endOfDayUtc + AR_OFFSET_MS);
}
