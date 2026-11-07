// Preferencia de cómo abrir WhatsApp desde el panel. Se guarda en cada computadora (localStorage):
// la de recepción puede tener WhatsApp Desktop instalado y el celular de la dueña no.
import { buildWhatsAppLink, type WhatsAppMode } from "@/lib/utils";

const STORAGE_KEY = "gym_whatsapp_mode_v1";
const MODES: WhatsAppMode[] = ["AUTO", "WEB", "APP"];

export function getWhatsAppMode(): WhatsAppMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as WhatsAppMode | null;
    return saved && MODES.includes(saved) ? saved : "AUTO";
  } catch {
    return "AUTO";
  }
}

export function setWhatsAppMode(mode: WhatsAppMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Almacenamiento bloqueado: se usa el modo automático.
  }
}

/** Abre la conversación según la preferencia de esta computadora. */
export function openWhatsApp(phone: string, message: string): void {
  const mode = getWhatsAppMode();
  const url = buildWhatsAppLink(phone, message, mode);
  if (mode === "APP") {
    // whatsapp:// lo abre Windows con la app instalada: en una pestaña nueva quedaría una pestaña en blanco.
    window.location.href = url;
    return;
  }
  // WhatsApp Web reutiliza su pestaña (nombre fijo) en lugar de abrir una nueva sesión cada vez.
  window.open(url, mode === "WEB" ? "whatsapp_web" : "_blank", "noopener,noreferrer");
}
