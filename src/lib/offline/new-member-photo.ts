// Foto del alta de un socio, offline-first: se guarda en el dispositivo ANTES de mandar el alta.
// Mientras el socio no existe en la base, la foto queda asociada a un id temporal; después se pasa al
// socio real (alta online) o al alta guardada sin internet (que la asocia al socio cuando se sube).
import {
  deletePhotosOfPendingClient,
  linkPhotosToMember,
  relinkPendingPhotos,
  savePhotoLocally,
} from "./photo-store";

export interface StashedPhoto {
  /** Id temporal de las fotos guardadas. null = no hubo foto o no se pudo guardar en el dispositivo. */
  tempId: string | null;
  /** Foto a mandar dentro del alta (solo si no se pudo guardar en el dispositivo: comportamiento anterior). */
  inlinePhoto: string | undefined;
}

function newTempId(): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `new-${random}`;
}

export async function stashNewMemberPhoto(photoBase64: string | null | undefined, dni: string): Promise<StashedPhoto> {
  if (!photoBase64) return { tempId: null, inlinePhoto: undefined };
  const tempId = newTempId();
  try {
    await savePhotoLocally({ photo: photoBase64, dni, pendingClientId: tempId });
    return { tempId, inlinePhoto: undefined };
  } catch (error) {
    // IndexedDB no disponible (modo privado, disco lleno): la foto viaja con el alta como antes.
    console.warn("[fotos] No se pudo guardar la foto en el dispositivo:", error);
    return { tempId: null, inlinePhoto: photoBase64 };
  }
}

/** El alta se creó en la base: la foto pasa al socio y se sube en segundo plano. */
export async function attachStashedPhotoToMember(stash: StashedPhoto, memberId: string, dni: string): Promise<void> {
  if (stash.tempId) await linkPhotosToMember(stash.tempId, memberId, dni).catch(() => {});
}

/** El alta quedó guardada sin internet: la foto pasa a esa alta pendiente. */
export async function attachStashedPhotoToPendingMember(stash: StashedPhoto, pendingClientId: string): Promise<void> {
  if (stash.tempId) await relinkPendingPhotos(stash.tempId, pendingClientId).catch(() => {});
}

/** El alta no se hizo (datos rechazados, DNI repetido): la foto no tiene a quién pertenecer. */
export async function discardStashedPhoto(stash: StashedPhoto): Promise<void> {
  if (stash.tempId) await deletePhotosOfPendingClient(stash.tempId).catch(() => {});
}
