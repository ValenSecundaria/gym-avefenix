import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { connection } from "next/server";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PlansSection } from "@/components/landing/PlansSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { Footer } from "@/components/landing/Footer";
import { getActiveMembersCount } from "@/actions/dashboard.actions";
import { getPublicPlans } from "@/lib/public-plans";

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
