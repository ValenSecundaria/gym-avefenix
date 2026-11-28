import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getBasePhotosDir, resolveSafePhotoPath } from "@/lib/security/safe-path";

export function getLocalPhotosDir(): string {
  return getBasePhotosDir();
}

// -------------------------------------------------------------
// DÓNDE SE GUARDAN LAS FOTOS (en el servidor)
// - Supabase Storage, bucket PRIVADO (si están SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY). Nadie lo lee
//   directo: la foto la entrega /api/members/[dni]/photo leyéndola con la clave del servidor.
// - Disco de la notebook (LOCAL_PHOTOS_PATH) cuando el servidor corre ahí: copia para que el molinete
//   siga mostrando fotos sin internet.
// - En Vercel sin Supabase no hay dónde guardarlas (el disco de Vercel se borra en cada deploy).
// En la base solo se guarda el nombre del archivo (member-DNI-timestamp.webp), igual en los dos lugares.
// Nunca se pisa una foto con otro contenido: cada foto nueva tiene un nombre nuevo, y volver a subir
// la misma foto (reintento) escribe exactamente el mismo archivo.
// -------------------------------------------------------------

export const PHOTO_SIZE_PX = 400;
const PHOTO_QUALITY = 82;

interface CloudConfig {
  url: string;
  key: string;
  bucket: string;
}

function getCloudConfig(): CloudConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key, bucket: process.env.SUPABASE_PHOTOS_BUCKET?.trim() || "member-photos" };
}

export function isCloudStorageConfigured(): boolean {
  return getCloudConfig() !== null;
}

function canUseLocalDisk(): boolean {
  return !process.env.VERCEL;
}

function objectUrl(cloud: CloudConfig, photoFilename: string): string {
  return `${cloud.url}/storage/v1/object/${encodeURIComponent(cloud.bucket)}/${encodeURIComponent(photoFilename)}`;
}

function authHeaders(cloud: CloudConfig): Record<string, string> {
  return { Authorization: `Bearer ${cloud.key}`, apikey: cloud.key };
}

async function uploadToCloud(cloud: CloudConfig, photoFilename: string, data: Buffer): Promise<void> {
  const res = await fetch(objectUrl(cloud, photoFilename), {
    method: "POST",
    headers: {
      ...authHeaders(cloud),
      "Content-Type": "image/webp",
      "Cache-Control": "31536000",
      // Mismo nombre = misma foto (reintento): se reescribe el mismo contenido, no se duplica.
      "x-upsert": "true",
    },
    body: new Uint8Array(data),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`Supabase Storage respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

/** Lee una foto del bucket privado. null si no existe o no hay conexión con Supabase. */
export async function readMemberPhotoFromCloud(photoFilename: string): Promise<Buffer | null> {
  const cloud = getCloudConfig();
  if (!cloud || !resolveSafePhotoPath(photoFilename)) return null;
  try {
    const res = await fetch(objectUrl(cloud, photoFilename), {
      headers: authHeaders(cloud),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function writeToDisk(photoFilename: string, data: Buffer): Promise<boolean> {
  const safeFilePath = resolveSafePhotoPath(photoFilename);
  if (!safeFilePath) throw new Error("Ruta de archivo de foto inválida o insegura");
  try {
    await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(safeFilePath), { recursive: true });
    await fs.writeFile(/*turbopackIgnore: true*/ safeFilePath, data);
    return true;
  } catch (error) {
    console.warn("[photo-storage] No se pudo guardar la copia local de la foto:", error);
    return false;
  }
}

/** Copia en el disco de la notebook de una foto bajada del bucket (para verla después sin internet). */
export async function cacheMemberPhotoOnDisk(photoFilename: string, data: Buffer): Promise<void> {
  if (!canUseLocalDisk()) return;
  await writeToDisk(photoFilename, data);
}

/** Achica y normaliza cualquier imagen recibida a WebP 400x400 (también descarta datos raros del archivo). */
export async function normalizeMemberPhoto(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(PHOTO_SIZE_PX, PHOTO_SIZE_PX, { fit: "cover", position: "center" })
    .webp({ quality: PHOTO_QUALITY })
    .toBuffer();
}

export interface StoredPhotoResult {
  /** Quedó guardada en el disco de la notebook. */
  savedLocally: boolean;
  /** Quedó guardada en Supabase (o Supabase no está configurado y no hace falta). */
  cloudSynced: boolean;
}

/**
 * Guarda la foto (ya normalizada) con su nombre definitivo. Si Supabase está configurado pero no
 * responde y hay copia en disco, devuelve cloudSynced = false para que el dispositivo vuelva a intentar.
 */
export async function storeMemberPhoto(photoFilename: string, webp: Buffer): Promise<StoredPhotoResult> {
  if (!resolveSafePhotoPath(photoFilename)) throw new Error("Nombre de foto inválido");
  const cloud = getCloudConfig();
  if (!cloud && !canUseLocalDisk()) {
    throw new Error("No hay dónde guardar fotos: configurá Supabase Storage en el servidor.");
  }

  const savedLocally = canUseLocalDisk() ? await writeToDisk(photoFilename, webp) : false;

  if (!cloud) {
    if (!savedLocally) throw new Error("No se pudo guardar la foto en el disco");
    return { savedLocally, cloudSynced: true };
  }

  try {
    await uploadToCloud(cloud, photoFilename, webp);
    return { savedLocally, cloudSynced: true };
  } catch (error) {
    if (!savedLocally) throw error;
    console.warn("[photo-storage] Supabase no respondió (la foto queda en disco y se reintenta):", error);
    return { savedLocally, cloudSynced: false };
  }
}

/** Alta / edición con la foto incluida en el pedido (altas sin internet guardadas antes de este cambio). */
export async function saveMemberPhotoToDisk(dni: string, photoBase64: string): Promise<string | null> {
  if (!isCloudStorageConfigured() && !canUseLocalDisk()) {
    console.warn("[photo-storage] Servidor en Vercel sin Supabase Storage: la foto no se guarda (disco temporal).");
    return null;
  }
  const cleanDni = dni.replace(/\D/g, "");
  const cleanBase64 = photoBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  const webpBuffer = await normalizeMemberPhoto(Buffer.from(cleanBase64, "base64"));
  const photoFilename = `member-${cleanDni}-${Date.now()}.webp`;
  await storeMemberPhoto(photoFilename, webpBuffer);
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

// Solo se usa al eliminar definitivamente a un socio (o si falla el guardado del socio).
// Best-effort: si el archivo ya no existe o la ruta es inválida, no hay nada que borrar.
export async function deleteMemberPhotoFromDisk(photoFilename: string | null | undefined): Promise<void> {
  if (!photoFilename) return;
  const safeFilePath = resolveSafePhotoPath(photoFilename);
  if (!safeFilePath) return;
  const cloud = getCloudConfig();
  if (cloud) {
    try {
      await fetch(`${cloud.url}/storage/v1/object/${encodeURIComponent(cloud.bucket)}`, {
        method: "DELETE",
        headers: { ...authHeaders(cloud), "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: [photoFilename] }),
      });
    } catch {
      // Sin conexión: la foto queda huérfana en el bucket, no afecta a nadie.
    }
  }
  if (!canUseLocalDisk()) return;
  try {
    await fs.unlink(/*turbopackIgnore: true*/ safeFilePath);
  } catch {
    // ENOENT u otro error de disco: la foto queda huérfana, no afecta al socio.
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
