import React, { useState } from "react";
import { MessageCircle, CreditCard, CheckCircle2, Wallet, User } from "lucide-react";
import type { DebtorMemberItem } from "@/types";
import { formatCurrencyARS, formatDateAR } from "@/lib/utils";
import { EditMemberButton } from "./EditMemberButton";
import { WhatsAppEditModal, type WhatsAppMessageTarget } from "./WhatsAppEditModal";

interface DebtorsTableProps {
  debtors: DebtorMemberItem[];
  onRegisterPayment: (debtor: DebtorMemberItem) => void;
  onEditMember: (memberId: string) => void;
}

export function DebtorsTable({ debtors, onRegisterPayment, onEditMember }: DebtorsTableProps) {
  const [waTarget, setWaTarget] = useState<WhatsAppMessageTarget | null>(null);

  if (debtors.length === 0) {
    return (
      <div className="bg-fx-surface border border-fx-border rounded-2xl p-10 text-center">
        <CheckCircle2 className="w-10 h-10 text-fx-green mx-auto mb-3" />
        <h3 className="text-lg font-bold text-fx-text">No hay cuotas vencidas pendientes</h3>
        <p className="text-sm text-fx-muted mt-1">
          Todos los socios activos se encuentran al día con su membresía.
        </p>
      </div>
    );
  }

  const totalDebt = debtors.reduce((acc, d) => acc + (d.planPrice || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Banner Resumen de Mora (Stitch Screen 2 Tab B) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-fx-red/10 border border-fx-red/40 text-fx-text">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-fx-red/20 flex items-center justify-center text-fx-red shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg text-fx-text">
              {debtors.length} {debtors.length === 1 ? "Socio con Pago Pendiente" : "Socios con Pago Pendiente"}
            </div>
            <div className="text-xs text-fx-muted">
              Total estimado a renovar:{" "}
              <span className="text-fx-red font-mono font-bold">{formatCurrencyARS(totalDebt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Deudores */}
      <div className="flex flex-col gap-3">
        {debtors.map((debtor) => {
          const waMessage = `¡Hola ${debtor.fullName}! Te escribimos de Gimnasio Ave Fénix para recordarte que tu cuota del plan ${debtor.planName} venció el ${formatDateAR(debtor.validUntil)}. ¡Te esperamos en recepción para renovarla!`;

          return (
            <div
              key={debtor.id}
              className="p-4 sm:p-5 rounded-xl bg-fx-base border border-fx-border hover:border-fx-red/40 flex flex-wrap items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-fx-red/20 border border-fx-red/50 overflow-hidden flex items-center justify-center text-fx-red shrink-0">
                  {debtor.photoUrl ? (
                    <img src={debtor.photoUrl} alt={debtor.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-fx-text">{debtor.fullName}</div>
                  <div className="font-mono text-xs text-fx-muted mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>DNI: {debtor.dni}</span>
                    <span>•</span>
                    <span className="text-fx-red font-semibold">
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

              <div className="w-full sm:w-auto flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="font-mono font-extrabold text-2xl text-fx-red">
                  {formatCurrencyARS(debtor.planPrice)}
                </span>
                <div className="w-full sm:w-auto flex items-center gap-2.5 [&>button:not(:last-child)]:flex-1 sm:[&>button]:flex-none [&>button]:justify-center">
                  {debtor.phone ? (
                    <button
                      type="button"
                      onClick={() =>
                        setWaTarget({
                          fullName: debtor.fullName,
                          phone: debtor.phone!,
                          defaultMessage: waMessage,
                        })
                      }
                      className="min-h-[48px] px-4 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Aviso WhatsApp</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onRegisterPayment(debtor)}
                    className="min-h-[48px] px-5 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-[0_2px_10px_rgba(249,87,22,0.3)] transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cobrar Cuota</span>
                  </button>
                  <EditMemberButton fullName={debtor.fullName} onClick={() => onEditMember(debtor.id)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <WhatsAppEditModal target={waTarget} onClose={() => setWaTarget(null)} />
    </div>
  );
}
