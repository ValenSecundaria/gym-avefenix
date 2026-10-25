/* Service Worker — Gimnasio Ave Fénix
 * - Assets estáticos (JS/CSS/fuentes/imágenes/íconos): Stale-While-Revalidate.
 * - Páginas (navegaciones HTML): red primero con respaldo en caché si se corta internet.
 *   (Servir HTML "stale" primero rompería las redirecciones de sesión y mostraría datos viejos
 *   del panel en vivo; por eso las páginas sólo salen de caché cuando no hay red.)
 * - Requests RSC, Server Actions (POST) y HMR nunca se interceptan.
 */
const VERSION = "v1";
const STATIC_CACHE = `avefenix-static-${VERSION}`;
const PAGES_CACHE = `avefenix-pages-${VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE, PAGES_CACHE];

const PRECACHE_PAGES = ["/login", "/"];
const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
  "/Logo.jpeg",
];

const OFFLINE_HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión | Gimnasio Ave Fénix</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0B0B0C;color:#F4F5F7;font-family:system-ui,sans-serif;text-align:center;padding:24px"><div><p style="color:#F95716;font-weight:800;text-transform:uppercase;letter-spacing:.1em;font-size:12px">Gimnasio Ave Fénix</p><h1 style="font-size:22px;margin:8px 0">Sin conexión a internet</h1><p style="color:#8A909A;font-size:14px">Esta pantalla todavía no está disponible sin conexión. Se reintentará al volver la red.</p></div><script>addEventListener("online",()=>location.reload())</script></body></html>`;

function isCacheableResponse(response) {
  return Boolean(response) && response.ok && response.type === "basic" && !response.redirected;
}

async function cacheIfValid(cacheName, request, response) {
  if (!isCacheableResponse(response)) return;
  // Clonar ANTES de cualquier await: el original puede empezar a consumirse al devolverse al navegador.
  const copy = response.clone();
  const cache = await caches.open(cacheName);
  await cache.put(request, copy);
}

async function precache(cacheName, urls) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, { credentials: "same-origin", cache: "reload" });
        await cacheIfValid(cacheName, url, response);
      } catch {
        // Instalación tolerante: un recurso faltante no debe impedir la instalación del SW.
      }
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([precache(PAGES_CACHE, PRECACHE_PAGES), precache(STATIC_CACHE, PRECACHE_ASSETS)]).then(() =>
      self.skipWaiting()
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !KNOWN_CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isBypassed(request, url) {
  if (request.method !== "GET" || url.origin !== self.location.origin) return true;
  if (request.headers.get("RSC") || request.headers.get("Next-Action") || url.searchParams.has("_rsc")) return true;
  return url.pathname.startsWith("/_next/webpack-hmr") || url.pathname.startsWith("/__nextjs") || url.pathname === "/sw.js";
}

function isStaticAsset(request, url) {
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image")) return true;
  if (url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest") return true;
  if (/^\/api\/members\/[^/]+\/photo$/.test(url.pathname)) return true;
  return ["style", "script", "font", "image"].includes(request.destination);
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(event.request);
  const network = fetch(event.request)
    .then((response) => {
      event.waitUntil(cacheIfValid(STATIC_CACHE, event.request, response));
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}

async function networkFirstPage(event) {
  const { request } = event;
  try {
    const response = await fetch(request);
    // No se espera la escritura en caché: el HTML en streaming (Suspense) se entrega sin demoras.
    event.waitUntil(cacheIfValid(PAGES_CACHE, request, response));
    return response;
  } catch {
    const cache = await caches.open(PAGES_CACHE);
    const cached = (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
    return cached || new Response(OFFLINE_HTML, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (isBypassed(request, url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(event));
    return;
  }
  if (isStaticAsset(request, url)) {
    event.respondWith(staleWhileRevalidate(event));
  }
});

// Precalienta rutas autenticadas (con la cookie de sesión vigente) y sus chunks JS/CSS,
// para que /admin y /check-in abran aunque se corte internet más tarde.
async function warmRoutes(urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
      if (!isCacheableResponse(response)) continue;
      await cacheIfValid(PAGES_CACHE, url, response);
      const html = await response.clone().text();
      const assets = new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || []);
      await precache(STATIC_CACHE, [...assets]);
    } catch {
      // Sin red: se reintentará en el próximo login online.
    }
  }
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "WARM_ROUTES" && Array.isArray(data.urls)) {
    event.waitUntil(warmRoutes(data.urls.filter((u) => typeof u === "string" && u.startsWith("/"))));
  }
});
