// Elección de cámara para la foto del socio: en el mostrador hay una cámara USB externa y la
// notebook trae su webcam integrada. Se prefiere siempre la externa.

const BASE_VIDEO = { width: { ideal: 640 }, height: { ideal: 480 } };
const STORAGE_KEY = "gym_camera_device_v1";

// Nombres típicos de la cámara de la notebook (Windows/Chrome los muestra así en `label`).
const BUILT_IN_PATTERN = /integrated|internal|built-?in|integrada|interna|facetime|front|frontal|\bir\b|infrared|infrarroja/i;

export function isBuiltInCamera(label: string): boolean {
  return BUILT_IN_PATTERN.test(label);
}

function readSavedDeviceId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveCameraChoice(deviceId: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, deviceId);
  } catch {
    // Almacenamiento bloqueado: se vuelve a elegir sola la próxima vez.
  }
}

export async function listCameras(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  try {
    return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
  } catch {
    return [];
  }
}

/**
 * Cámara preferida: la que se eligió a mano la última vez (si sigue conectada); si no, la primera que
 * no parece integrada; si todas lo parecen (o no hay nombres), la última conectada, que en la notebook
 * suele ser la USB.
 */
export function pickPreferredCamera(cameras: MediaDeviceInfo[]): MediaDeviceInfo | null {
  if (cameras.length === 0) return null;
  const saved = readSavedDeviceId();
  const savedCam = saved ? cameras.find((c) => c.deviceId === saved) : undefined;
  if (savedCam) return savedCam;
  const external = cameras.find((c) => c.label && !isBuiltInCamera(c.label));
  if (external) return external;
  return cameras[cameras.length - 1];
}

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((t) => t.stop());
}

async function openDevice(deviceId: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ video: { ...BASE_VIDEO, deviceId: { exact: deviceId } }, audio: false });
}

/**
 * Abre la cámara externa USB si hay una. Los nombres de las cámaras recién se conocen con el permiso
 * concedido: si todavía no hay nombres, se abre cualquiera (eso pide el permiso), se vuelve a listar
 * y, si la elegida es otra, se cambia a la USB.
 */
export async function openPreferredCamera(): Promise<MediaStream> {
  let cameras = await listCameras();
  const hasLabels = cameras.some((c) => c.label);

  if (hasLabels) {
    const preferred = pickPreferredCamera(cameras);
    if (preferred) {
      try {
        return await openDevice(preferred.deviceId);
      } catch {
        // Desconectada o en uso por otro programa: se sigue con cualquier cámara disponible.
      }
    }
  }

  const stream = await navigator.mediaDevices.getUserMedia({ video: BASE_VIDEO, audio: false });
  cameras = await listCameras();
  const preferred = pickPreferredCamera(cameras);
  const currentId = stream.getVideoTracks()[0]?.getSettings().deviceId;
  if (!preferred || preferred.deviceId === currentId) return stream;
  try {
    const better = await openDevice(preferred.deviceId);
    stopStream(stream);
    return better;
  } catch {
    return stream;
  }
}

/** Pasa a la siguiente cámara conectada y la recuerda como preferida. */
export async function openNextCamera(currentDeviceId: string | undefined): Promise<MediaStream | null> {
  const cameras = await listCameras();
  if (cameras.length < 2) return null;
  const index = cameras.findIndex((c) => c.deviceId === currentDeviceId);
  const next = cameras[(index + 1) % cameras.length];
  const stream = await openDevice(next.deviceId);
  saveCameraChoice(next.deviceId);
  return stream;
}
