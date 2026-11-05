import React, { Suspense } from "react";
import { connection } from "next/server";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Files } from "@/components/landing/Files";
import { PlansSection } from "@/components/landing/PlansSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { Footer } from "@/components/landing/Footer";
import { getActiveMembersCount } from "@/actions/dashboard.actions";
import { getPublicPlans } from "@/lib/public-plans";

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
