import path from "path";

/**
 * Regex estricto para validar identificadores seguros (DNI / código de socio)
 * o nombres de archivo seguros de fotos de perfil.
 */
const SAFE_PHOTO_IDENTIFIER_REGEX =
  /^([a-zA-Z0-9_-]{6,20}|member-[a-zA-Z0-9_-]{6,20}-\d+\.webp|[a-zA-Z0-9_-]{1,40}\.(webp|jpg|jpeg|png))$/i;

/**
 * Normaliza y obtiene el directorio base de almacenamiento de fotos.
 */
export function getBasePhotosDir(): string {
  const customPath = process.env.LOCAL_PHOTOS_PATH?.trim();
  return path.resolve(customPath || "C:/GymData/photos");
}

/**
 * Valida y resuelve de forma segura una ruta de archivo o identificador (DNI / foto),
 * previniendo ataques de Path Traversal y Directory Poisoning.
 *
 * @param dniOrFilename DNI numérico/alfanumérico o nombre de archivo de foto.
 * @returns Ruta absoluta segura resuelta o null si es inválido / inseguro.
 */
export function resolveSafePhotoPath(dniOrFilename: string): string | null {
  if (!dniOrFilename || typeof dniOrFilename !== "string") {
    return null;
  }

  const cleanInput = dniOrFilename.trim();

  // Validar formato estricto con Regex
  if (!SAFE_PHOTO_IDENTIFIER_REGEX.test(cleanInput)) {
    return null;
  }

  // Comprobar que path.basename(dniOrFilename) === dniOrFilename para evitar inyección de rutas
  if (path.basename(cleanInput) !== cleanInput) {
    return null;
  }

  // Resolver la ruta contra process.env.LOCAL_PHOTOS_PATH || "C:/GymData/photos"
  const resolvedBaseDir = getBasePhotosDir();
  const resolvedFilePath = path.resolve(resolvedBaseDir, cleanInput);

  // Normalizar la ruta base y verificar estrictamente que resolvedFilePath.startsWith(resolvedBaseDir + path.sep)
  const baseDirWithSep = resolvedBaseDir.endsWith(path.sep)
    ? resolvedBaseDir
    : `${resolvedBaseDir}${path.sep}`;

  if (!resolvedFilePath.startsWith(baseDirWithSep)) {
    return null;
  }

  return resolvedFilePath;
}
