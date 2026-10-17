import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export function getLocalPhotosDir(): string {
  return process.env.LOCAL_PHOTOS_PATH || "C:/GymData/photos";
}

export async function saveMemberPhotoToDisk(
  dni: string,
  photoBase64: string
): Promise<string> {
  const cleanDni = dni.replace(/\D/g, "");
  const cleanBase64 = photoBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  const inputBuffer = Buffer.from(cleanBase64, "base64");

  const webpBuffer = await sharp(inputBuffer)
    .resize(400, 400, { fit: "cover", position: "center" })
    .webp({ quality: 82 })
    .toBuffer();

  const dir = getLocalPhotosDir();
  await fs.mkdir(/*turbopackIgnore: true*/ dir, { recursive: true });

  const photoFilename = `member-${cleanDni}-${Date.now()}.webp`;
  const filePath = path.join(/*turbopackIgnore: true*/ dir, photoFilename);

  await fs.writeFile(/*turbopackIgnore: true*/ filePath, webpBuffer);
  return photoFilename;
}

export async function readMemberPhotoFromDisk(
  photoFilename: string
): Promise<Buffer | null> {
  if (!photoFilename) return null;
  try {
    const safeFilename = path.basename(photoFilename);
    const filePath = path.join(/*turbopackIgnore: true*/ getLocalPhotosDir(), safeFilename);
    return await fs.readFile(/*turbopackIgnore: true*/ filePath);
  } catch {
    return null;
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
