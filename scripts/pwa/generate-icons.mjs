// Genera los íconos oficiales de la PWA (192x192, 512x512 y maskable) a partir de public/Logo.jpeg.
// Uso: npm run pwa:icons
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "public", "Logo.jpeg");
const OUT_DIR = path.join(ROOT, "public", "icons");
// El logo tiene fondo negro puro: el letterbox negro lo integra sin bordes visibles.
const BACKGROUND = { r: 0, g: 0, b: 0, alpha: 1 };

async function renderIcon(size, fileName, safeZoneRatio = 1) {
  const inner = Math.round(size * safeZoneRatio);
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: BACKGROUND })
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, fileName));

  console.log(`✔ ${fileName} (${size}x${size})`);
}

await mkdir(OUT_DIR, { recursive: true });
await renderIcon(192, "icon-192x192.png");
await renderIcon(512, "icon-512x512.png");
// Maskable: el contenido debe quedar dentro de la "safe zone" (80% central) para no recortarse.
await renderIcon(512, "icon-maskable-512x512.png", 0.8);
