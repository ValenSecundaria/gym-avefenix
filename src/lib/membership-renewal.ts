// Regla de renovación de cuota (la usan el cobro en el servidor y la vista previa del modal de cobro).
// - Paga antes de que venza: se suma desde el vencimiento.
// - Paga con hasta RENEWAL_GRACE_DAYS días de atraso: se renueva desde la fecha de vencimiento
//   (vencía el 09/12, paga el 13/12 -> nuevo vencimiento 08/01).
// - Más atraso (o sin cuota previa): el período completo desde el día del pago.

export const RENEWAL_GRACE_DAYS = 4;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const AR_UTC_OFFSET_MS = 3 * 60 * 60 * 1000; // Argentina = UTC-3, sin horario de verano

/** Días de calendario en hora argentina entre dos fechas (13/12 - 09/12 = 4, sin importar la hora). */
function calendarDaysBetween(from: Date, to: Date): number {
  const day = (d: Date) => Math.floor((d.getTime() - AR_UTC_OFFSET_MS) / MS_PER_DAY);
  return day(to) - day(from);
}

export interface RenewalResult {
  validUntil: Date;
  /** Días de atraso (0 si todavía no venció o no tenía cuota). */
  daysLate: number;
  /** De dónde se cuenta el período nuevo. */
  from: "VENCIMIENTO" | "HOY";
}

export function computeRenewal(currentValidUntil: Date | null, now: Date, durationDays: number): RenewalResult {
  const period = durationDays * MS_PER_DAY;
  if (!currentValidUntil) return { validUntil: new Date(now.getTime() + period), daysLate: 0, from: "HOY" };

  if (currentValidUntil > now) {
    return { validUntil: new Date(currentValidUntil.getTime() + period), daysLate: 0, from: "VENCIMIENTO" };
  }

  const daysLate = Math.max(0, calendarDaysBetween(currentValidUntil, now));
  const fromExpiry = new Date(currentValidUntil.getTime() + period);
  // Un pase corto (ej. diario) contado desde el vencimiento podría quedar ya vencido: ahí se cuenta desde hoy.
  if (daysLate <= RENEWAL_GRACE_DAYS && fromExpiry > now) {
    return { validUntil: fromExpiry, daysLate, from: "VENCIMIENTO" };
  }
  return { validUntil: new Date(now.getTime() + period), daysLate, from: "HOY" };
}
