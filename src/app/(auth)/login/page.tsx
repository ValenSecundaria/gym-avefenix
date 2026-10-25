import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Gimnasio Ave Fénix",
  description: "Acceso para operadores y administración del Gimnasio Ave Fénix.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
