"use client";

import React, { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useAuthSession } from "@/context/auth-session-context";
import { gymBroadcast } from "@/lib/screens/broadcast-channel";
import { getPendingCheckIns, removeSyncedCheckIns } from "@/lib/db/indexed-db";
import { syncBatchCheckInsAction } from "@/actions/sync.actions";

interface LogoutButtonProps {
  collapsed?: boolean;
  className?: string;
  onLogoutStart?: () => void;
}

export function LogoutButton({
  collapsed = false,
  className = "",
  onLogoutStart,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuthSession();

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    onLogoutStart?.();

    try {
      // 1. Flush de seguridad del lote pendiente de check-ins antes de salir
      try {
        const pending = await getPendingCheckIns();
        if (pending.length > 0) {
          const payload = pending.map((p) => ({
            memberId: p.memberId,
            status: p.status,
            createdAt: p.createdAt,
          }));
          const res = await syncBatchCheckInsAction(payload);
          if (res.success) {
            const ids = pending.map((p) => p.id!).filter((id): id is number => typeof id === "number");
            await removeSyncedCheckIns(ids);
          }
        }
      } catch (err) {
        console.warn("[LogoutButton] Error sincronizando lote antes de salir:", err);
      }

      // 2. Notificar inmediatamente por BroadcastChannel para sincronizar pantallas
      gymBroadcast.postMessage({ type: "RESET_CHECKIN" });
      gymBroadcast.postMessage({ type: "SESSION_LOGOUT" });

      // 3. Destruir sesión en el contexto, Server Action de cookies e IndexedDB/storage
      await logout();

      // 4. Garantizar limpieza total de almacenamiento de sesión en ventana
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.clear();
        } catch {
          // Ignorar si sessionStorage está deshabilitado
        }
      }
    } catch (error) {
      console.error("[LogoutButton] Error al procesar salida:", error);
    } finally {
      // 5. Redirección segura reemplazando el historial para impedir volver con botón Atrás
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-busy={isLoggingOut}
      aria-label="Cerrar Sesión"
      title={collapsed ? "Cerrar Sesión" : undefined}
      className={`group relative w-full min-h-[48px] rounded-xl flex items-center gap-3 text-sm font-bold border transition-all cursor-pointer select-none bg-fx-surface text-fx-muted border-fx-border hover:bg-fx-red/10 hover:text-fx-red hover:border-fx-red/40 focus:outline-none focus:ring-2 focus:ring-fx-red/40 focus:border-fx-red disabled:opacity-60 disabled:cursor-not-allowed ${
        collapsed ? "justify-center px-0" : "px-3.5"
      } ${className}`}
    >
      {isLoggingOut ? (
        <Loader2 className="w-5 h-5 shrink-0 animate-spin text-fx-red" />
      ) : (
        <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-0.5 text-inherit" />
      )}

      {!collapsed && (
        <span className="flex-1 text-left tracking-tight">
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
        </span>
      )}
    </button>
  );
}
