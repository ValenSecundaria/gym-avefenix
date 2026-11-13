import type { MetadataRoute } from "next";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: GYM_BRAND_CONFIG.identity.name,
    short_name: GYM_BRAND_CONFIG.identity.shortName,
    description: `Sistema de gestión y control de acceso de ${GYM_BRAND_CONFIG.identity.name}: panel de recepción y terminal de check-in para doble pantalla.`,
    lang: "es-AR",
    dir: "ltr",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: GYM_BRAND_CONFIG.theme.bgCanvas,
    theme_color: GYM_BRAND_CONFIG.theme.primary,
    categories: ["business", "productivity", "health"],
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
