import React from "react";
import { MessageCircle, CalendarClock, UserCheck, User } from "lucide-react";
import type { AbsentMemberItem } from "@/types";
import { buildWhatsAppLink, formatDateAR } from "@/lib/utils";
import { ABSENT_DAYS_THRESHOLD } from "@/lib/constants";
import { EditMemberButton } from "./EditMemberButton";

interface AbsentMembersTableProps {
  absentMembers: AbsentMemberItem[];
  onEditMember: (memberId: string) => void;
}

export function AbsentMembersTable({ absentMembers, onEditMember }: AbsentMembersTableProps) {
  if (absentMembers.length === 0) {
    return (
      <div className="bg-fx-surface border border-fx-border rounded-2xl p-10 text-center">
        <CalendarClock className="w-10 h-10 text-fx-green mx-auto mb-3" />
        <h3 className="text-lg font-bold text-fx-text">Sin socios ausentes prolongados</h3>
        <p className="text-sm text-fx-muted mt-1">
          No hay socios con más de {ABSENT_DAYS_THRESHOLD} días sin asistir al gimnasio.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Banner de Recuperación (Stitch Screen 2 Tab C) */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-fx-amber/10 border border-fx-amber/40 text-fx-text">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-fx-amber/20 flex items-center justify-center text-fx-amber shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg text-fx-text">
              {absentMembers.length} Socios Ausentes (+{ABSENT_DAYS_THRESHOLD} días sin marcar ingreso)
            </div>
            <div className="text-xs text-fx-muted">
              Dejaron de venir al gimnasio. Campaña de reactivación Fénix recomendada.
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Recontacto */}
      <div className="flex flex-col gap-3">
        {absentMembers.map((member) => {
          const waMessage = `¡Hola ${member.fullName}! Te escribimos de Gimnasio Ave Fénix. Hace ${member.daysAbsent} días que no te vemos entrenar y queríamos saber cómo estás. ¡Te esperamos esta semana para retomar con toda la energía!`;
          const waUrl = buildWhatsAppLink(member.phone, waMessage);

          return (
            <div
              key={member.id}
              className="p-4 sm:p-5 rounded-xl bg-fx-base border border-fx-border hover:border-fx-amber/40 flex flex-wrap items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-fx-amber/15 border border-fx-amber/40 overflow-hidden flex items-center justify-center text-fx-amber shrink-0">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-fx-text">{member.fullName}</div>
                  <div className="font-mono text-xs text-fx-muted mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span className="text-fx-amber font-semibold">
                      Último ingreso: {member.daysAbsent} días atrás ({member.lastCheckInAt ? formatDateAR(member.lastCheckInAt) : "Sin ingresos"})
                    </span>
                    <span>•</span>
                    <span>Plan: {member.planName}</span>
                    {member.phone && (
                      <>
                        <span>•</span>
                        <span>Tel: {member.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-5 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-fx-base text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Recontactar por WhatsApp</span>
                </a>
                <EditMemberButton fullName={member.fullName} onClick={() => onEditMember(member.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
