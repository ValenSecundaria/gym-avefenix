"use client";

import React, { useState, useEffect, useRef } from "react";
import type { CheckInVerificationResult, ToggleShiftResult } from "@/types";
import { type CheckInKey } from "@/lib/screens/broadcast-channel";
import { writeCheckInDisplayCache } from "@/lib/screens/checkin-display-cache";
import { useCheckIn } from "@/hooks/use-checkin";
import { useCheckInDisplay, requestFullscreen } from "@/hooks/use-checkin-display";
import { useCheckInKeypad } from "@/hooks/use-checkin-keypad";
import { toggleTeacherShiftAction } from "@/actions/shifts.actions";
import { KeypadInput, DNI_MAX_LENGTH, DNI_MIN_LENGTH } from "./KeypadInput";
import { MemberResultCard } from "./MemberResultCard";
import { TeacherResultCard } from "./TeacherResultCard";
import { IdleDisplay } from "./IdleDisplay";
import { CheckInHeader } from "./CheckInHeader";

const ALERT_DURATION_SECONDS = 60;

export function CheckInMonitorClient({
  onVerifyDni,
}: {
  onVerifyDni?: (dni: string) => Promise<{
    success: boolean;
    data?: CheckInVerificationResult;
    error?: string;
  }>;
}) {
  const [dniInput, setDniInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [teacherResult, setTeacherResult] = useState<ToggleShiftResult | null>(null);
  const dniRef = useRef("");
  const loadingRef = useRef(false);

  const setDni = (val: string) => {
    dniRef.current = val;
    setDniInput(val);
  };

  const { verifyAndLogCheckIn } = useCheckIn();
  const { display, isFullscreen, currentResult } = useCheckInDisplay();

  useEffect(() => {
    if (!teacherResult) return;
    const timer = setTimeout(() => setTeacherResult(null), 6000);
    return () => clearTimeout(timer);
  }, [teacherResult]);

  const handleVerifySubmit = async (dni: string) => {
    const trimmed = dni.trim();
    if (trimmed.length < DNI_MIN_LENGTH || trimmed.length > DNI_MAX_LENGTH) {
      setErrorMsg(`El DNI tiene que tener entre ${DNI_MIN_LENGTH} y ${DNI_MAX_LENGTH} números.`);
      return;
    }
    loadingRef.current = true;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const teacherRes = await toggleTeacherShiftAction({ dni: trimmed });
      if (teacherRes.success && teacherRes.data) {
        setTeacherResult(teacherRes.data);
        setDni("");
        return;
      }

      const response = onVerifyDni ? await onVerifyDni(trimmed) : await verifyAndLogCheckIn(trimmed);
      if (!response.success || !response.data) {
        setErrorMsg(response.error || "No se encontró un socio registrado con ese DNI.");
        setDni("");
        return;
      }
      setDni("");

      if (response.data.status === "HABILITADO") {
        writeCheckInDisplayCache({ lastEnabled: response.data, alert: null, alertUntil: null });
      } else {
        writeCheckInDisplayCache({
          lastEnabled: display.lastEnabled,
          alert: response.data,
          alertUntil: Date.now() + ALERT_DURATION_SECONDS * 1000,
        });
      }
    } catch {
      setErrorMsg("Error de validación al verificar el ingreso. Intentá nuevamente.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  const pressKey = (key: CheckInKey) => {
    if (loadingRef.current) return;
    if (teacherResult) setTeacherResult(null);
    const current = dniRef.current;
    if (key === "Enter") return void handleVerifySubmit(current);
    if (errorMsg) setErrorMsg(null);
    if (key === "Clear") setDni("");
    else if (key === "Backspace") setDni(current.slice(0, -1));
    else if (current.length < DNI_MAX_LENGTH) setDni(current + key);
  };

  useCheckInKeypad(pressKey, () => setDni(""));

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F5F7] flex flex-col p-4 sm:p-6 lg:p-8 select-none cursor-default">
      <CheckInHeader isFullscreen={isFullscreen} onRequestFullscreen={requestFullscreen} />

      <main className="w-full max-w-7xl mx-auto flex-1 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        <div className="lg:col-span-5">
          <KeypadInput value={dniInput} onKey={pressKey} isLoading={isLoading} error={errorMsg} />
        </div>

        <div className="lg:col-span-7 flex items-center justify-center">
          {teacherResult ? (
            <TeacherResultCard result={teacherResult} />
          ) : currentResult ? (
            <MemberResultCard result={currentResult} />
          ) : (
            <IdleDisplay />
          )}
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto pt-3 border-t border-[#2C2D35]/60 flex items-center justify-center text-sm text-[#8A909A] gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
        <span>Listo para ingresar</span>
      </footer>
    </div>
  );
}
