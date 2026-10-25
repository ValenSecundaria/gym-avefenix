import type { MetadataRoute } from "next";

// Manifest de la PWA instalable (Edge/Chrome en Windows 10/11).
// Next.js lo sirve en /manifest.webmanifest e inyecta automáticamente el <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Gimnasio Ave Fénix",
    short_name: "Ave Fénix",
    description:
      "Sistema de gestión y control de acceso del Gimnasio Ave Fénix: panel de recepción y terminal de check-in para doble pantalla.",
    lang: "es-AR",
    dir: "ltr",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#0B0B0C",
    theme_color: "#F95716",
    categories: ["business", "productivity", "health"],
    // Si la app ya está abierta, relanzarla enfoca la ventana existente en lugar de duplicarla.
    launch_handler: { client_mode: "focus-existing" },
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Panel de Recepción",
        short_name: "Recepción",
        url: "/admin",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Terminal de Check-In",
        short_name: "Check-In",
        url: "/check-in",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
