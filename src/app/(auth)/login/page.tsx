import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `Iniciar Sesión | ${GYM_BRAND_CONFIG.identity.name}`,
  description: `Acceso para operadores y administración de ${GYM_BRAND_CONFIG.identity.name}.`,
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-textPrimary flex items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
