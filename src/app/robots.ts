import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Solo la landing pública se indexa: el panel, la terminal de ingreso y la API quedan fuera.
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/profesor", "/check-in", "/login", "/launch", "/api/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", site).toString(),
    host: site.origin,
  };
}
