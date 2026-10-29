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
 * Despliega la terminal de Check-In (/check-in) en el monitor secundario.
 * Si detecta múltiples pantallas, calcula las coordenadas exactas de la pantalla externa.
 */
export async function dispatchScreens(): Promise<ScreenDispatchResult> {
  if (typeof window === "undefined") {
    return { success: false, hasMultipleScreens: false, secondaryOpened: false, popupBlocked: false };
  }

  try {
    const { screens } = await getConnectedScreens();
    const secondaryScreen = screens.find((s) => s.isPrimary === false);
    const hasMultipleScreens = Boolean(secondaryScreen);

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
