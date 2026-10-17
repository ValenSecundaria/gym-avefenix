import type { Metadata } from "next";
import { verifyAndCheckIn } from "@/actions/checkin.actions";
import { CheckInMonitorClient } from "@/components/check-in/CheckInMonitorClient";

export const metadata: Metadata = {
  title: "Terminal de Check-In | Gimnasio Ave Fénix",
  description: "Monitor público de validación de ingreso de socios por DNI.",
};

export default function CheckInPage() {
  async function handleVerifyDni(dni: string) {
    "use server";
    return verifyAndCheckIn(dni);
  }

  return <CheckInMonitorClient onVerifyDni={handleVerifyDni} />;
}
