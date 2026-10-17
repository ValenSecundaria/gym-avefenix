export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrencyARS(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateAR(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "Sin fecha";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatTimeAR(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "--:--";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "--:--";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function buildWhatsAppLink(phone: string | null | undefined, message: string): string {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  const normalizedPhone = cleanPhone.startsWith("54")
    ? cleanPhone
    : cleanPhone
      ? `549${cleanPhone}`
      : "";
  const encodedMsg = encodeURIComponent(message);
  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;
}

export function getMemberPhotoUrl(dni: string, photoFilename?: string | null): string | null {
  if (!photoFilename) return null;
  return `/api/members/${encodeURIComponent(dni)}/photo?v=${encodeURIComponent(photoFilename)}`;
}

export function getStartOfWeekMonday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
