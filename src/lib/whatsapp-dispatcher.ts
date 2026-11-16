// Avisos por WhatsApp a costo $0 (Click to Chat / Deep Link): el sistema solo abre el chat del socio con
// el texto cargado; el mensaje lo envía el operador desde su sesión. Nada sale en segundo plano.

/**
 * Dónde se abre el chat:
 * - web: WhatsApp Web en el navegador (web.whatsapp.com).
 * - app: WhatsApp instalado en Windows (protocolo whatsapp://).
 * - auto: wa.me (abre la app si está instalada; si no, deriva a WhatsApp Web).
 */
export type WhatsAppTarget = "auto" | "web" | "app";

export const WHATSAPP_TARGETS: WhatsAppTarget[] = ["web", "app", "auto"];

export const INVALID_PHONE_MESSAGE = "Número telefónico incompleto o inválido para WhatsApp";

/** Nombre fijo de la pestaña de WhatsApp Web: los avisos siguientes la reutilizan en vez de abrir otra. */
const WHATSAPP_WEB_WINDOW_NAME = "avefenix_whatsapp_web";

/** Un celular argentino sin prefijos: código de área + número = 10 dígitos. */
const NATIONAL_LENGTH = 10;

/** Quita el "15" de los celulares cargados a la vieja usanza (291 15 4123456). */
function stripMobile15(national: string): string {
  if (national.length !== NATIONAL_LENGTH + 2) return national;
  // Largos posibles del código de área: 2 (solo 11, AMBA), 3 o 4.
  const areaLengths = national.startsWith("11") ? [2, 3, 4] : [3, 4];
  for (const len of areaLengths) {
    if (national.slice(len, len + 2) === "15") return national.slice(0, len) + national.slice(len + 2);
  }
  return national;
}

/**
 * Lleva un teléfono cargado a mano al formato internacional argentino que pide WhatsApp:
 * 549 + código de área + número, solo dígitos. Acepta espacios, guiones, paréntesis, "+54", el 0 del
 * código de área y el 15. Devuelve null si faltan dígitos (sin código de área) o hay caracteres inválidos.
 */
export function normalizeWhatsAppPhone(phone: string | null | undefined): string | null {
  const raw = (phone ?? "").trim();
  if (!raw || /[^\d\s()+.\-]/.test(raw)) return null;

  let digits = raw.replace(/\D/g, "").replace(/^00/, "");
  if (digits.startsWith("54") && digits.length >= NATIONAL_LENGTH + 2) digits = digits.slice(2);
  if (digits.startsWith("9") && digits.length === NATIONAL_LENGTH + 1) digits = digits.slice(1);
  const national = stripMobile15(digits.replace(/^0+/, ""));

  // Los códigos de área argentinos empiezan con 11, 2 o 3: descarta, p. ej., un "15..." cargado sin código de área.
  return national.length === NATIONAL_LENGTH && /^(11|[23])/.test(national) ? `549${national}` : null;
}

export function isValidWhatsAppPhone(phone: string | null | undefined): boolean {
  return normalizeWhatsAppPhone(phone) !== null;
}

/** URL codificada del chat con el mensaje precargado. Devuelve null si el teléfono no sirve para WhatsApp. */
export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
  target: WhatsAppTarget = "auto"
): string | null {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;
  const text = encodeURIComponent(message);
  if (target === "web") return `https://web.whatsapp.com/send?phone=${normalized}&text=${text}`;
  if (target === "app") return `whatsapp://send?phone=${normalized}&text=${text}`;
  return `https://wa.me/${normalized}?text=${text}`;
}

/**
 * Abre el chat del socio con el mensaje listo para enviar. Hay que llamarla dentro del clic del operador
 * (si no, el navegador bloquea la ventana). Devuelve false si el teléfono es inválido y no se abrió nada.
 */
export function dispatchWhatsApp(phone: string | null | undefined, message: string, target: WhatsAppTarget): boolean {
  const url = buildWhatsAppUrl(phone, message, target);
  if (!url) return false;

  if (target === "app") {
    // whatsapp:// lo resuelve Windows. Se dispara desde un iframe oculto y no navegando esta ventana:
    // navegar dispararía "beforeunload" en el panel, que cierra la pantalla de ingreso del otro monitor.
    const frame = document.createElement("iframe");
    frame.style.display = "none";
    frame.src = url;
    document.body.appendChild(frame);
    window.setTimeout(() => frame.remove(), 2000);
    return true;
  }

  if (target === "web") {
    const tab = window.open(url, WHATSAPP_WEB_WINDOW_NAME);
    // Se corta el vínculo con el panel sin usar "noopener", que impediría reutilizar la pestaña.
    if (tab) tab.opener = null;
    return true;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
