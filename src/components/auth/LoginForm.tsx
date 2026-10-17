"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Lock, User, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { authenticateUser } from "@/actions/auth.actions";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authenticateUser({ username: username.trim(), password });
      if (!res.success) {
        setError(res.error || "Credenciales inválidas");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión al intentar iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#17171C] border border-[#2C2D35] rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#F95716] flex items-center justify-center shadow-lg shadow-[#F95716]/30 mb-4">
          <Flame className="w-8 h-8 text-[#F4F5F7]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#F4F5F7] uppercase tracking-tight">
          Acceso <span className="text-[#F95716]">Recepción</span>
        </h1>
        <p className="text-sm text-[#8A909A] mt-1">
          Ingresá tus credenciales para administrar el Gimnasio Ave Fénix
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-[#D92614]/20 border border-[#D92614] text-sm text-[#F4F5F7]">
          <AlertCircle className="w-5 h-5 text-[#D92614] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A909A] mb-2">
            Usuario
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-[#8A909A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full min-h-[48px] pl-11 pr-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] focus:border-[#F95716] focus:outline-none text-sm text-[#F4F5F7]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A909A] mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-[#8A909A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[48px] pl-11 pr-4 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] focus:border-[#F95716] focus:outline-none text-sm text-[#F4F5F7]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[48px] mt-2 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-[#F4F5F7] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#F95716]/25 transition-all disabled:opacity-50 cursor-pointer"
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

      <div className="mt-6 pt-5 border-t border-[#2C2D35] flex items-center justify-between text-xs text-[#8A909A]">
        <span>Demo inicial: admin / admin123</span>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#F4F5F7] hover:text-[#F95716] font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}
