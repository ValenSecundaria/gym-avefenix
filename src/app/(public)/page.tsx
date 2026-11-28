import React, { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { connection } from "next/server";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PlansSection } from "@/components/landing/PlansSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { Footer } from "@/components/landing/Footer";
import { getActiveMembersCount } from "@/actions/dashboard.actions";
import { getPublicPlans } from "@/lib/public-plans";
import { getSiteUrl } from "@/lib/site-url";

const SEO_TITLE = "Gimnasio Ave Fénix | Musculación y Funcional en Ingeniero White";
const SEO_DESCRIPTION =
  "Gimnasio Ave Fénix en Ingeniero White (Bahía Blanca): musculación, funcional y planes mensuales o por día. Conocé horarios, precios y escribinos por WhatsApp.";

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: ["gimnasio", "Ingeniero White", "Bahía Blanca", "musculación", "funcional", "Ave Fénix", "planes de gimnasio"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Gimnasio Ave Fénix",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [{ url: "/Portada1.png", alt: "Gimnasio Ave Fénix" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: ["/Portada1.png"],
  },
  robots: { index: true, follow: true },
};

// Datos estructurados (schema.org) para que Google muestre el gimnasio con dirección y contacto.
const GYM_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: "Gimnasio Ave Fénix",
  description: SEO_DESCRIPTION,
  image: new URL("/Portada1.png", getSiteUrl()).toString(),
  url: getSiteUrl().origin,
  telephone: "+5492915768403",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Lautaro 3322",
    addressLocality: "Ingeniero White",
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
};

const Files = dynamic(
  () => import("@/components/landing/Files").then((mod) => mod.Files),
  {
    loading: () => (
      <section className="w-full bg-[#0B0B0C] px-4 sm:px-6 lg:px-10 py-20 lg:py-24 border-t border-[#2C2D35]/60">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <div className="w-48 h-8 rounded-full bg-[#17171C] animate-pulse" />
          <div className="w-full h-80 rounded-2xl bg-[#17171C] border border-[#2C2D35] animate-pulse" />
        </div>
      </section>
    ),
  }
);

// La consulta a la BD es dinámica: se aísla en un componente dentro de <Suspense>
// para que el resto de la landing pueda prerenderizarse.
async function HeroWithStats() {
  await connection();
  const activeMembersRes = await getActiveMembersCount();
  const activeMembers = activeMembersRes.success ? activeMembersRes.data : 0;
  return <Hero activeMembers={activeMembers} />;
}

// Los planes y disciplinas son los mismos que se venden en recepción (sección Planes del panel).
async function PlansWithData() {
  await connection();
  const plans = await getPublicPlans();
  return <PlansSection plans={plans} />;
}

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex flex-col">
      <script
        type="application/ld+json"
        // Contenido fijo del propio sitio (no viene del usuario).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(GYM_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Hero />}>
          <HeroWithStats />
        </Suspense>
        <Files />
        <Suspense fallback={<PlansSection />}>
          <PlansWithData />
        </Suspense>
        <ScheduleSection />
      </main>
      <Footer />
    </div>
  );
}
