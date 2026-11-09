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

/**
 * Cómo se abre WhatsApp:
 * - AUTO: wa.me (el sistema elige: app en el celular, página intermedia en la PC). Es el de la web pública.
 * - WEB: WhatsApp Web en el navegador (web.whatsapp.com).
 * - APP: WhatsApp Desktop instalado en Windows (protocolo whatsapp://).
 */
export type WhatsAppMode = "AUTO" | "WEB" | "APP";

export function buildWhatsAppLink(phone: string | null | undefined, message: string, mode: WhatsAppMode = "AUTO"): string {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  const normalizedPhone = cleanPhone.startsWith("54")
    ? cleanPhone
    : cleanPhone
      ? `549${cleanPhone}`
      : "";
  const encodedMsg = encodeURIComponent(message);
  if (mode === "WEB") {
    return `https://web.whatsapp.com/send?${normalizedPhone ? `phone=${normalizedPhone}&` : ""}text=${encodedMsg}`;
  }
  if (mode === "APP") {
    return `whatsapp://send?${normalizedPhone ? `phone=${normalizedPhone}&` : ""}text=${encodedMsg}`;
  }
  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;
}

export function getMemberPhotoUrl(dni: string, photoFilename?: string | null): string {
  if (!photoFilename) return "/UserImage.png";
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
