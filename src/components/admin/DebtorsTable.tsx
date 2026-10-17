import React from "react";
import { MessageCircle, CreditCard, CheckCircle2, Wallet, User } from "lucide-react";
import type { DebtorMemberItem } from "@/types";
import { buildWhatsAppLink, formatCurrencyARS, formatDateAR } from "@/lib/utils";

interface DebtorsTableProps {
  debtors: DebtorMemberItem[];
  onRegisterPayment: (debtor: DebtorMemberItem) => void;
}

export function DebtorsTable({ debtors, onRegisterPayment }: DebtorsTableProps) {
  if (debtors.length === 0) {
    return (
      <div className="bg-[#17171C] border border-[#2C2D35] rounded-2xl p-10 text-center">
        <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#F4F5F7]">No hay cuotas vencidas pendientes</h3>
        <p className="text-sm text-[#8A909A] mt-1">
          Todos los socios activos se encuentran al día con su membresía.
        </p>
      </div>
    );
  }

  const totalDebt = debtors.reduce((acc, d) => acc + (d.planPrice || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Banner Resumen de Mora (Stitch Screen 2 Tab B) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#D92614]/10 border border-[#D92614]/40 text-[#F4F5F7]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#D92614]/20 flex items-center justify-center text-[#D92614] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg text-[#F4F5F7]">
              {debtors.length} {debtors.length === 1 ? "Socio con Pago Pendiente" : "Socios con Pago Pendiente"}
            </div>
            <div className="text-xs text-[#8A909A]">
              Total estimado a renovar:{" "}
              <span className="text-[#D92614] font-mono font-bold">{formatCurrencyARS(totalDebt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Deudores */}
      <div className="flex flex-col gap-3">
        {debtors.map((debtor) => {
          const waMessage = `¡Hola ${debtor.fullName}! Te escribimos de Gimnasio Ave Fénix para recordarte que tu cuota del plan ${debtor.planName} venció el ${formatDateAR(debtor.validUntil)}. ¡Te esperamos en recepción para renovarla!`;
          const waUrl = buildWhatsAppLink(debtor.phone, waMessage);

          return (
            <div
              key={debtor.id}
              className="p-4 sm:p-5 rounded-xl bg-[#0B0B0C] border border-[#2C2D35] hover:border-[#D92614]/40 flex flex-wrap items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D92614]/20 border border-[#D92614]/50 overflow-hidden flex items-center justify-center text-[#D92614] shrink-0">
                  {debtor.photoUrl ? (
                    <img src={debtor.photoUrl} alt={debtor.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-[#F4F5F7]">{debtor.fullName}</div>
                  <div className="font-mono text-xs text-[#8A909A] mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>DNI: {debtor.dni}</span>
                    <span>•</span>
                    <span className="text-[#D92614] font-semibold">
                      Venció: {formatDateAR(debtor.validUntil)} ({debtor.daysOverdue}d mora)
                    </span>
                    {debtor.phone && (
                      <>
                        <span>•</span>
                        <span>Tel: {debtor.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="font-mono font-extrabold text-xl text-[#D92614]">
                  {formatCurrencyARS(debtor.planPrice)}
                </span>
                <div className="flex items-center gap-2.5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[48px] px-4 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Aviso WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onRegisterPayment(debtor)}
                    className="min-h-[48px] px-5 rounded-xl bg-[#F95716] hover:bg-[#F95716]/90 text-[#F4F5F7] text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-[0_2px_10px_rgba(249,87,22,0.3)] transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cobrar Cuota</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
