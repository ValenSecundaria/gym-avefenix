import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckInMonitorClient } from "@/components/check-in/CheckInMonitorClient";
import { GYM_BRAND_CONFIG } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `Terminal de Check-In | ${GYM_BRAND_CONFIG.identity.name}`,
  description: "Monitor público de validación de ingreso de socios por DNI.",
  robots: { index: false, follow: false },
};

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg text-brand-textPrimary flex items-center justify-center p-8">
          <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <CheckInMonitorClient />
    </Suspense>
  );
}
