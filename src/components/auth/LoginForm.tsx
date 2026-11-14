"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, User, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuthSession } from "@/context/auth-session-context";
import { dispatchScreens, ensureOnPrimaryScreen } from "@/lib/screens/screen-dispatcher";
import { ADMIN_HOME, homePathFor } from "@/lib/auth/auth-constants";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";
import { ManualLaunchScreen } from "./ManualLaunchScreen";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsManualLaunch, setNeedsManualLaunch] = useState(false);
  const [homePath, setHomePath] = useState<string>(ADMIN_HOME);

  useEffect(() => {
    void ensureOnPrimaryScreen();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowPassword(false);
    setIsLoading(true);

    try {
      const outcome = await login(username.trim(), password);
      if (!outcome.ok) {
        setError(outcome.error || "Credenciales inválidas");
        setIsLoading(false);
        return;
      }

      const userData = outcome.session.user;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("gym_user", JSON.stringify(userData));
        sessionStorage.setItem("gym_auth_time", Date.now().toString());

        try {
          const syncPayload = { type: "TERMINAL_AUTH_SYNC", user: userData, timestamp: Date.now() };
          localStorage.setItem("gym_terminal_sync", JSON.stringify(syncPayload));
          window.dispatchEvent(new CustomEvent("gym:terminal-sync", { detail: syncPayload }));
        } catch {
          // Ignorar si StorageEvent está restringido
        }
      }

      const home = homePathFor(userData);
      setHomePath(home);

      const dispatchRes = await dispatchScreens({ skipIfSingleScreen: true });
      if (dispatchRes.popupBlocked) {
        setNeedsManualLaunch(true);
        setIsLoading(false);
        return;
      }

      router.push(home);
      router.refresh();
    } catch {
      setError("Error de conexión al intentar iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLaunch = async () => {
    setIsLoading(true);
    await dispatchScreens();
    router.push(homePath);
    router.refresh();
  };

  if (needsManualLaunch) {
    return <ManualLaunchScreen isLoading={isLoading} onLaunch={handleManualLaunch} />;
  }

  return (
    <div className="w-full max-w-md bg-[#17171C] border border-[#2C2D35] rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-primary flex items-center justify-center shadow-[0_8px_24px_rgba(0,87,217,0.3)] mb-4">
          <Image
            src={GYM_BRAND_CONFIG.assets.logoLogin}
            alt={GYM_BRAND_CONFIG.identity.shortName}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-[#F4F5F7] uppercase tracking-tight">
          Acceso <span className="text-brand-primaryText">Recepción</span>
        </h1>
        <p className="text-sm text-[#8A909A] mt-1">
          Ingresá tus credenciales para administrar {GYM_BRAND_CONFIG.identity.name}
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-brand-alert/20 border border-brand-alert text-sm text-[#F4F5F7]">
          <AlertCircle className="w-5 h-5 text-brand-alertText shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A909A] mb-2">Usuario</label>
          <div className="relative">
            <User className="w-5 h-5 text-[#8A909A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresá tu usuario"
              autoComplete="username"
              className="w-full min-h-[48px] pl-11 pr-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] focus:border-brand-primary focus:outline-none text-sm text-[#F4F5F7]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A909A] mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-[#8A909A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full min-h-[48px] pl-11 pr-12 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] focus:border-brand-primary focus:outline-none text-sm text-[#F4F5F7]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-[#8A909A] hover:text-[#F4F5F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[48px] mt-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,87,217,0.25)] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <span>Ingresar al Panel</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#2C2D35] flex items-center justify-end text-xs text-[#8A909A]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#F4F5F7] hover:text-brand-primaryText font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}
