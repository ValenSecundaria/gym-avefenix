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
  | { type: "REQUEST_FULLSCREEN" };

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
