import React from "react";
import { CalendarCheck, Clock, CreditCard, Wallet } from "lucide-react";
import type { AccessStatusType, MemberDetail } from "@/types";
import { formatCurrencyARS, formatDateAR, formatTimeAR } from "@/lib/utils";

const CHECKIN_LABEL: Record<AccessStatusType, { text: string; cls: string }> = {
  HABILITADO: { text: "Ingresó", cls: "text-fx-green" },
  CUOTA_VENCIDA: { text: "Rechazado: cuota vencida", cls: "text-fx-red" },
  LIMITE_ALCANZADO: { text: "Rechazado: límite de ingresos", cls: "text-fx-amber" },
};

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-fx-base border border-fx-border">
      <div className="text-[11px] font-bold uppercase tracking-wider text-fx-muted flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-fx-orange" />
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-fx-text">{value}</div>
    </div>
  );
}

// Resumen de la cuota y últimos movimientos del socio (solo lectura).
export function MemberSummary({ member }: { member: MemberDetail }) {
  const weekly =
    member.allowedDaysPerWeek !== null
      ? `${member.daysUsedThisWeek} de ${member.allowedDaysPerWeek} días`
      : `${member.daysUsedThisWeek} días (libre)`;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat icon={Wallet} label="Cuota" value={member.planPrice !== null ? formatCurrencyARS(member.planPrice) : "Sin plan"} />
      <Stat icon={CalendarCheck} label="Vence" value={member.validUntil ? formatDateAR(member.validUntil) : "Sin fecha"} />
      <Stat icon={Clock} label="Esta semana" value={weekly} />
      <Stat
        icon={Clock}
        label="Último ingreso"
        value={member.lastCheckInAt ? `${formatDateAR(member.lastCheckInAt)} ${formatTimeAR(member.lastCheckInAt)}` : "Nunca"}
      />
    </div>
  );
}

export function MemberHistory({ member }: { member: MemberDetail }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-fx-border">
      <section aria-labelledby="history-payments">
        <h3 id="history-payments" className="text-xs font-bold uppercase tracking-wider text-fx-muted mb-2 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-fx-orange" />
          Últimos pagos ({member.recentPayments.length} de {member.paymentsCount})
        </h3>
        {member.recentPayments.length === 0 ? (
          <p className="text-sm text-fx-muted">Sin pagos registrados.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-fx-border rounded-xl border border-fx-border bg-fx-base">
            {member.recentPayments.map((p) => (
              <li key={p.id} className="px-3 py-2 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-semibold text-fx-text">{formatDateAR(p.paidAt)}</div>
                  <div className="text-xs text-fx-muted truncate">
                    {p.planName ?? "Sin plan"} • {p.method === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                  </div>
                </div>
                <span className="font-mono font-bold text-fx-text shrink-0">{formatCurrencyARS(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="history-checkins">
        <h3 id="history-checkins" className="text-xs font-bold uppercase tracking-wider text-fx-muted mb-2 flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-fx-orange" />
          Últimos ingresos ({member.recentCheckIns.length} de {member.checkInsCount})
        </h3>
        {member.recentCheckIns.length === 0 ? (
          <p className="text-sm text-fx-muted">Todavía no registró ingresos.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-fx-border rounded-xl border border-fx-border bg-fx-base">
            {member.recentCheckIns.map((c) => {
              const label = CHECKIN_LABEL[c.status];
              return (
                <li key={c.id} className="px-3 py-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-fx-text">
                    {formatDateAR(c.createdAt)} <span className="font-mono text-fx-muted">{formatTimeAR(c.createdAt)} hs</span>
                  </span>
                  <span className={`text-xs font-bold ${label.cls}`}>{label.text}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
