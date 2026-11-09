// URL pública del sitio para metadatos (OpenGraph, canonical, sitemap, robots).
// En Vercel se toma el dominio de producción; se puede fijar con NEXT_PUBLIC_SITE_URL.
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
}
