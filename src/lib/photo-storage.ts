import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getBasePhotosDir, resolveSafePhotoPath } from "@/lib/security/safe-path";

export function getLocalPhotosDir(): string {
  return getBasePhotosDir();
}

// Las fotos viven en el disco de la notebook del mostrador (LOCAL_PHOTOS_PATH), donde corre el servidor.
// En Vercel el disco es temporal y se borra en cada deploy: guardar ahí dejaría socios apuntando a
// fotos que ya no existen, así que el socio se guarda sin foto (se usa la imagen por defecto).
function canStorePhotos(): boolean {
  return !process.env.VERCEL;
}

export async function saveMemberPhotoToDisk(
  dni: string,
  photoBase64: string
): Promise<string | null> {
  if (!canStorePhotos()) {
    console.warn("[photo-storage] Servidor en Vercel: la foto no se guarda (disco temporal).");
    return null;
  }
  const cleanDni = dni.replace(/\D/g, "");
  const cleanBase64 = photoBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  const inputBuffer = Buffer.from(cleanBase64, "base64");

  const webpBuffer = await sharp(inputBuffer)
    .resize(400, 400, { fit: "cover", position: "center" })
    .webp({ quality: 82 })
    .toBuffer();

  const photoFilename = `member-${cleanDni}-${Date.now()}.webp`;
  const safeFilePath = resolveSafePhotoPath(photoFilename);
  if (!safeFilePath) {
    throw new Error("Ruta de archivo de foto inválida o insegura");
  }

  const dir = path.dirname(safeFilePath);
  await fs.mkdir(/*turbopackIgnore: true*/ dir, { recursive: true });

  await fs.writeFile(/*turbopackIgnore: true*/ safeFilePath, webpBuffer);
  return photoFilename;
}

export async function readMemberPhotoFromDisk(
  photoFilename: string
): Promise<Buffer | null> {
  if (!photoFilename) return null;
  try {
    const safeFilePath = resolveSafePhotoPath(photoFilename);
    if (!safeFilePath) return null;
    return await fs.readFile(/*turbopackIgnore: true*/ safeFilePath);
  } catch {
    return null;
  }
}

// Best-effort: si el archivo ya no existe o la ruta es inválida, no hay nada que borrar.
export async function deleteMemberPhotoFromDisk(photoFilename: string | null | undefined): Promise<void> {
  if (!photoFilename) return;
  const safeFilePath = resolveSafePhotoPath(photoFilename);
  if (!safeFilePath) return;
  try {
    await fs.unlink(/*turbopackIgnore: true*/ safeFilePath);
  } catch {
    // ENOENT u otro error de disco: la foto vieja queda huérfana, no afecta al socio.
  }
}

export async function generateFallbackAvatarWebp(label = "AF"): Promise<Buffer> {
  const safeText = label.slice(0, 2).toUpperCase();
  const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="#17171C"/>
    <circle cx="200" cy="200" r="188" fill="none" stroke="#F95716" stroke-width="6" stroke-opacity="0.7"/>
    <circle cx="200" cy="155" r="56" fill="#26262F"/>
    <path d="M96 340 C96 270 304 270 304 340" fill="#26262F"/>
    <text x="200" y="376" font-family="sans-serif" font-size="24" font-weight="bold" fill="#F95716" text-anchor="middle">${safeText}</text>
  </svg>`;

  return sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer();
}
