import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { AuthSessionProvider } from "@/context/auth-session-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#F95716",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "Gimnasio Ave Fénix | Sistema de Gestión y Acceso",
  description:
    "Plataforma integral de entrenamiento, control de acceso en tiempo real y administración de socios del Gimnasio Ave Fénix.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0C] text-[#F4F5F7] selection:bg-[#F95716] selection:text-[#F4F5F7]">
        <ServiceWorkerRegister />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
