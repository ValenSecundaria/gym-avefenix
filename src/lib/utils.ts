import { buildWhatsAppUrl } from "@/lib/whatsapp-dispatcher";

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
 * Enlace wa.me de la web pública (escribirle al gimnasio). Sin un teléfono válido abre WhatsApp para elegir
 * el contacto. Los avisos a socios del panel usan lib/whatsapp-dispatcher.
 */
export function buildWhatsAppLink(phone: string | null | undefined, message: string): string {
  return buildWhatsAppUrl(phone, message, "auto") ?? `https://wa.me/?text=${encodeURIComponent(message)}`;
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
