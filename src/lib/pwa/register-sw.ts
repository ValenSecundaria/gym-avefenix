// Registro del Service Worker y precalentamiento de rutas de la PWA.
// Cumple con la especificación de pwa-screen-manager.md y Regla 01.

let installPromptEvent: Event | null = null;

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      // Si hay una nueva versión disponible, activarla sin bloquear
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("[PWA] Nueva versión disponible del Service Worker.");
          }
        });
      });
    } catch (err) {
      console.warn("[PWA] No se pudo registrar el Service Worker:", err);
    }
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    // Guardar evento para eventual prompt manual sin alterar la interfaz gráfica actual
    installPromptEvent = e;
  });
}

/** Precalienta rutas autenticadas enviando el mensaje al Service Worker activo. */
export function warmCacheRoutes(urls: string[]): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const sw = navigator.serviceWorker.controller;
  if (sw && sw.state === "activated") {
    sw.postMessage({ type: "WARM_ROUTES", urls });
  } else {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: "WARM_ROUTES", urls });
    });
  }
}

export function getDeferredInstallPrompt(): Event | null {
  return installPromptEvent;
}
