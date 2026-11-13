import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { AuthSessionProvider } from "@/context/auth-session-context";
import { getSiteUrl } from "@/lib/site-url";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: GYM_BRAND_CONFIG.theme.primary,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: GYM_BRAND_CONFIG.identity.name,
  title: `${GYM_BRAND_CONFIG.identity.name} | Sistema de Gestión y Acceso`,
  description: `Plataforma integral de entrenamiento, control de acceso en tiempo real y administración de socios de ${GYM_BRAND_CONFIG.identity.name}.`,
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
      <body className="min-h-full flex flex-col bg-[var(--brand-bg)] text-[var(--brand-text-primary)] selection:bg-[var(--brand-primary)] selection:text-[var(--brand-text-primary)]">
        <ServiceWorkerRegister />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
