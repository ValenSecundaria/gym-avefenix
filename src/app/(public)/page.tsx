import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PlansSection } from "@/components/landing/PlansSection";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { Footer } from "@/components/landing/Footer";

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PlansSection />
        <ScheduleSection />
      </main>
      <Footer />
    </div>
  );
}
