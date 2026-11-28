// Preferencia de cómo abrir WhatsApp desde el panel. Se guarda en cada computadora (localStorage):
// la de recepción puede tener WhatsApp Desktop instalado y otra usar solo el navegador.
import { dispatchWhatsApp, WHATSAPP_TARGETS, type WhatsAppTarget } from "@/lib/whatsapp-dispatcher";

const STORAGE_KEY = "gym_whatsapp_mode_v1";

/** Sin preferencia guardada, recepción usa WhatsApp Web en su navegador (Chrome o Edge). */
export const DEFAULT_WHATSAPP_TARGET: WhatsAppTarget = "web";

export function getWhatsAppTarget(): WhatsAppTarget {
  try {
    // toLowerCase: las versiones anteriores guardaban "AUTO" / "WEB" / "APP".
    const saved = window.localStorage.getItem(STORAGE_KEY)?.toLowerCase() as WhatsAppTarget | undefined;
    return saved && WHATSAPP_TARGETS.includes(saved) ? saved : DEFAULT_WHATSAPP_TARGET;
  } catch {
    return DEFAULT_WHATSAPP_TARGET;
  }
}

export function setWhatsAppTarget(target: WhatsAppTarget): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, target);
  } catch {
    // Almacenamiento bloqueado: se usa el modo por defecto.
  }
}

/** Abre la conversación según la preferencia de esta computadora. Devuelve false si el teléfono es inválido. */
export function openWhatsApp(phone: string, message: string): boolean {
  return dispatchWhatsApp(phone, message, getWhatsAppTarget());
}
