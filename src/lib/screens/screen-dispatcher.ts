// Orquestador de pantallas duales para gimnasio (Notebook / Pantalla HDMI).
// Utiliza Window Management API (window.getScreenDetails) y fallback inteligente.

export interface ScreenDispatchResult {
  success: boolean;
  hasMultipleScreens: boolean;
  secondaryOpened: boolean;
  popupBlocked: boolean;
  secondaryWindow?: WindowProxy | null;
  error?: string;
}

interface ScreenDetailedLike {
  isPrimary?: boolean;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  availLeft?: number;
  availTop?: number;
  availWidth?: number;
  availHeight?: number;
}

interface ScreenDetailsLike {
  screens: ScreenDetailedLike[];
}

/**
 * getScreenDetails() hace que el navegador muestre "Gestionar ventanas en todas tus pantallas".
 * Solo vale la pena pedirlo si hay un segundo monitor conectado (screen.isExtended no requiere permiso)
 * y si no fue rechazado antes (en ese caso no se vuelve a insistir).
 */
async function shouldQueryScreenDetails(): Promise<boolean> {
  const screenInfo = window.screen as Screen & { isExtended?: boolean };
  if (screenInfo.isExtended === false) return false;
  try {
    const status = await navigator.permissions.query({ name: "window-management" as PermissionName });
    return status.state !== "denied";
  } catch {
    // Navegador sin soporte para consultar este permiso: se intenta igual.
    return true;
  }
}

/** Consulta los monitores físicos mediante la Window Management API si está soportada. */
export async function getConnectedScreens(): Promise<{
  supported: boolean;
  screens: ScreenDetailedLike[];
}> {
  if (typeof window === "undefined") {
    return { supported: false, screens: [] };
  }

  const win = window as unknown as {
    getScreenDetails?: () => Promise<ScreenDetailsLike>;
  };

  if (typeof win.getScreenDetails === "function" && (await shouldQueryScreenDetails())) {
    try {
      const details = await win.getScreenDetails();
      if (details && Array.isArray(details.screens) && details.screens.length > 0) {
        return { supported: true, screens: details.screens };
      }
    } catch (err) {
      console.warn("[ScreenDispatcher] Permiso de Window Management no concedido o rechazado:", err);
    }
  }

  // Fallback si la API no está disponible o no tiene permiso
  return {
    supported: false,
    screens: [
      {
        isPrimary: true,
        left: 0,
        top: 0,
        width: window.screen.width,
        height: window.screen.height,
        availLeft: 0,
        availTop: 0,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
      },
    ],
  };
}

/**
 * El login y el panel van siempre en la pantalla principal (la de la notebook); el monitor secundario
 * queda para la pantalla de ingreso. Si la ventana arrancó en el secundario, se la mueve a la principal.
 * Solo consulta los monitores si el permiso de "gestión de ventanas" ya está concedido (no muestra carteles).
 * moveTo/resizeTo solo funcionan en ventanas de app (PWA instalada, Chrome --app) o abiertas por script:
 * en una pestaña común el navegador lo ignora y no pasa nada.
 */
export async function ensureOnPrimaryScreen(): Promise<boolean> {
  if (typeof window === "undefined" || isMobileDevice()) return false;
  const screenInfo = window.screen as Screen & { isExtended?: boolean };
  if (screenInfo.isExtended === false) return false;

  const win = window as unknown as {
    getScreenDetails?: () => Promise<ScreenDetailsLike & { currentScreen?: ScreenDetailedLike }>;
  };
  if (typeof win.getScreenDetails !== "function") return false;
  try {
    const status = await navigator.permissions.query({ name: "window-management" as PermissionName });
    if (status.state !== "granted") return false;
    const details = await win.getScreenDetails();
    const primary = details.screens.find((s) => s.isPrimary);
    if (!primary || details.currentScreen?.isPrimary !== false) return false;
    window.moveTo(primary.availLeft ?? primary.left ?? 0, primary.availTop ?? primary.top ?? 0);
    window.resizeTo(primary.availWidth ?? window.outerWidth, primary.availHeight ?? window.outerHeight);
    return true;
  } catch {
    return false;
  }
}

/** Celular o tablet: pantalla táctil sin mouse, o angosta. Ahí solo se usa el panel de administración. */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const touchOnly = window.matchMedia("(pointer: coarse) and (hover: none)").matches;
  return touchOnly || window.matchMedia("(max-width: 767px)").matches;
}

/**
 * true solo si se puede asegurar que hay un único monitor: screen.isExtended === false (Chrome/Edge, sin permiso)
 * o la Window Management API devolvió una sola pantalla. Si no se puede saber, devuelve false.
 */
function isSingleScreen(supported: boolean, screens: ScreenDetailedLike[]): boolean {
  const screenInfo = window.screen as Screen & { isExtended?: boolean };
  if (screenInfo.isExtended === false) return true;
  return supported && screens.length === 1;
}

/**
 * Despliega la terminal de Check-In (/check-in) en el monitor secundario.
 * Si detecta múltiples pantallas, calcula las coordenadas exactas de la pantalla externa.
 * En el celular no se abre: la pantalla de ingreso es solo para la PC de recepción.
 * Con skipIfSingleScreen (apertura automática al ingresar) y un solo monitor detectado, no abre nada:
 * la ventana de ingreso taparía el panel. Se puede abrir igual desde el botón "Abrir pantalla de ingreso".
 */

let registeredSecondaryWindow: WindowProxy | null = null;

export function registerSecondaryWindow(win: WindowProxy | null): void {
  registeredSecondaryWindow = win;
}

export function getSecondaryWindow(): WindowProxy | null {
  if (registeredSecondaryWindow && !registeredSecondaryWindow.closed) {
    return registeredSecondaryWindow;
  }
  return null;
}

export function closeSecondaryScreen(): void {
  try {
    if (registeredSecondaryWindow && !registeredSecondaryWindow.closed) {
      registeredSecondaryWindow.close();
    }
  } catch (err) {
    console.warn("[ScreenDispatcher] No se pudo cerrar la ventana secundaria por referencia directa:", err);
  }
  registeredSecondaryWindow = null;
}

export function closeCurrentScreen(): void {
  if (typeof window === "undefined") return;
  try {
    window.close();
  } catch {
    // ignore
  }
  // Si window.close() fue bloqueado por el navegador (ej: no abierta por script),
  // como fallback visual seguro redirigimos a login o cerramos interacci�n.
  if (!window.closed) {
    setTimeout(() => {
      if (!window.closed) {
        window.location.replace("/login");
      }
    }, 150);
  }
}

export async function dispatchScreens(
  options: { skipIfSingleScreen?: boolean } = {}
): Promise<ScreenDispatchResult> {
  if (typeof window === "undefined" || isMobileDevice()) {
    return { success: false, hasMultipleScreens: false, secondaryOpened: false, popupBlocked: false };
  }

  try {
    const { supported, screens } = await getConnectedScreens();
    const secondaryScreen = screens.find((s) => s.isPrimary === false);
    const hasMultipleScreens = Boolean(secondaryScreen);

    if (options.skipIfSingleScreen && !hasMultipleScreens && isSingleScreen(supported, screens)) {
      return { success: true, hasMultipleScreens: false, secondaryOpened: false, popupBlocked: false };
    }

    let windowFeatures = "menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes";

    if (secondaryScreen) {
      // Se usa el tamaño total del monitor (no el "avail", que descuenta la barra de tareas).
      // La pantalla completa real la pide la propia ventana de Check-In al cargar o con la primera tecla.
      const left = secondaryScreen.left ?? secondaryScreen.availLeft ?? 0;
      const top = secondaryScreen.top ?? secondaryScreen.availTop ?? 0;
      const width = secondaryScreen.width ?? secondaryScreen.availWidth ?? window.screen.width;
      const height = secondaryScreen.height ?? secondaryScreen.availHeight ?? window.screen.height;
      windowFeatures += `,left=${left},top=${top},width=${width},height=${height}`;
    }

    const secondaryWindow = window.open("/check-in", "CheckInWindow", windowFeatures);
    if (secondaryWindow) {
      registerSecondaryWindow(secondaryWindow);
    }

    if (!secondaryWindow || secondaryWindow.closed || typeof secondaryWindow.closed === "undefined") {
      return {
        success: false,
        hasMultipleScreens,
        secondaryOpened: false,
        popupBlocked: true,
        error: "El navegador bloqueó la ventana emergente de Check-In.",
      };
    }

    // Solicitar foco y fullscreen en la ventana secundaria
    try {
      secondaryWindow.focus();
    } catch {
      // ignore
    }

    return {
      success: true,
      hasMultipleScreens,
      secondaryOpened: true,
      popupBlocked: false,
      secondaryWindow,
    };
  } catch (error) {
    console.error("[ScreenDispatcher] Error al orquestar pantallas:", error);
    return {
      success: false,
      hasMultipleScreens: false,
      secondaryOpened: false,
      popupBlocked: false,
      error: "Ocurrió un error al preparar las pantallas.",
    };
  }
}
