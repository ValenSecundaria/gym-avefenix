import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckInMonitorClient } from "@/components/check-in/CheckInMonitorClient";

export const metadata: Metadata = {
  title: "Terminal de Check-In | Gimnasio Ave Fénix",
  description: "Monitor público de validación de ingreso de socios por DNI.",
};

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex items-center justify-center p-8">
          <div className="w-10 h-10 rounded-full border-2 border-[#F95716] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CheckInMonitorClient />
    </Suspense>
  );
}
