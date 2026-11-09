// Canal de comunicación en tiempo real inter-pantallas (BroadcastChannel 'gym_channel').
// Permite que la pantalla de Check-in notifique al Dashboard de recepción sin recargas,
// y que el Dashboard envíe comandos a la pantalla del socio.
import type { CachedMember, CheckInVerificationResult, LiveCheckInItem } from "@/types";

export const GYM_BROADCAST_CHANNEL_NAME = "gym_channel";

export type GymBroadcastMessage =
  | { type: "CHECKIN_EVENT"; payload: CheckInVerificationResult }
  | { type: "CHECKIN_LOGGED"; checkIn: LiveCheckInItem }
  | { type: "MEMBER_UPDATED"; member: CachedMember }
  | { type: "REFRESH_DASHBOARD" }
  | { type: "RESET_CHECKIN" }
  | { type: "SESSION_LOGOUT" }
  | { type: "REQUEST_FULLSCREEN" }
  // Teclas del teclado numérico capturadas en otra ventana y reenviadas al Check-In.
  | { type: "CHECKIN_KEY"; key: CheckInKey }
  // Latido de la ventana de Check-In: avisa que está abierta para recibir teclas.
  | { type: "CHECKIN_ALIVE" };

export type CheckInKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "Backspace" | "Clear" | "Enter";

const NUMPAD_CODES: Record<string, CheckInKey> = {
  Numpad0: "0",
  Numpad1: "1",
  Numpad2: "2",
  Numpad3: "3",
  Numpad4: "4",
  Numpad5: "5",
  Numpad6: "6",
  Numpad7: "7",
  Numpad8: "8",
  Numpad9: "9",
  NumpadEnter: "Enter",
  NumpadDecimal: "Backspace",
  NumpadSubtract: "Backspace",
  NumpadMultiply: "Clear",
  NumpadDivide: "Clear",
};

/**
 * Traduce una tecla física a una tecla del Check-In.
 * Se usa `code` (posición física) y no `key`, así funciona con Bloq Num activado o no.
 * `numpadOnly` limita a las teclas del teclado numérico (para el panel de recepción).
 */
export function toCheckInKey(e: KeyboardEvent, numpadOnly: boolean): CheckInKey | null {
  if (e.ctrlKey || e.altKey || e.metaKey) return null;
  const fromNumpad = NUMPAD_CODES[e.code];
  if (fromNumpad) return fromNumpad;
  // Algunos teclados numéricos USB mandan Enter/Borrar con código común: se reconocen por su ubicación.
  if (e.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
    if (e.key === "Enter") return "Enter";
    if (e.key === "Backspace" || e.key === "Delete") return "Backspace";
  }
  if (numpadOnly) return null;
  if (/^[0-9]$/.test(e.key)) return e.key as CheckInKey;
  if (e.key === "Backspace" || e.key === "Delete") return "Backspace";
  if (e.key === "Enter") return "Enter";
  if (e.key === "Escape") return "Clear";
  return null;
}

class GymChannelManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(msg: GymBroadcastMessage) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(GYM_BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<GymBroadcastMessage>) => {
          if (event.data && typeof event.data.type === "string") {
            this.listeners.forEach((listener) => {
              try {
                listener(event.data);
              } catch (err) {
                console.error("[gym_channel] Error en listener:", err);
              }
            });
          }
        };
      } catch (e) {
        console.warn("[gym_channel] BroadcastChannel no soportado o bloqueado:", e);
      }
    }
  }

  public postMessage(message: GymBroadcastMessage): void {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn("[gym_channel] Error al emitir mensaje:", err);
      }
    }
  }

  public subscribe(listener: (msg: GymBroadcastMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const gymBroadcast = new GymChannelManager();
