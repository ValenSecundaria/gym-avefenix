"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, User, UserPen, Users } from "lucide-react";
import type { MemberListItem } from "@/types";
import { formatDateAR } from "@/lib/utils";
import { getMembers } from "@/actions/members.actions";

interface MembersSectionProps {
  searchQuery: string;
  /** Cambia cada vez que se edita un socio, para volver a pedir la lista. */
  reloadKey: number;
  onEditMember: (memberId: string) => void;
}

const STATUS_BADGE: Record<MemberListItem["membershipStatus"], { text: string; cls: string }> = {
  ACTIVA: { text: "Al día", cls: "bg-fx-green/15 text-fx-green border-fx-green/40" },
  VENCIDA: { text: "Vencida", cls: "bg-fx-red/15 text-fx-red border-fx-red/40" },
  CANCELADA: { text: "Cancelada", cls: "bg-fx-red/15 text-fx-red border-fx-red/40" },
  SIN_MEMBRESIA: { text: "Sin plan", cls: "bg-fx-hover text-fx-muted border-fx-border" },
};

export function MembersSection({ searchQuery, reloadKey, onEditMember }: MembersSectionProps) {
  const [showInactive, setShowInactive] = useState(false);
  const [members, setMembers] = useState<MemberListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Espera a que se deje de tipear antes de consultar la base.
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getMembers(searchQuery.trim() || undefined, { inactive: showInactive });
        if (cancelled) return;
        if (res.success && res.data) {
          setMembers(res.data);
          setError(null);
        } else {
          setError(res.error || "No se pudo cargar el listado de socios.");
        }
      } catch {
        if (!cancelled) setError("Sin conexión: no se pudo cargar el listado de socios.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, showInactive, reloadKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-fx-base border border-fx-border">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Estado del socio">
          {[
            { value: false, label: "Activos" },
            { value: true, label: "Dados de baja" },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setShowInactive(opt.value)}
              aria-pressed={showInactive === opt.value}
              className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                showInactive === opt.value ? "bg-fx-orange text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-fx-muted inline-flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-fx-orange" />}
          {members ? `${members.length === 100 ? "Primeros 100" : members.length} socios` : ""}
          {members && members.length === 100 && " — buscá por DNI o apellido para encontrar el resto"}
        </span>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-sm text-fx-text">
          <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {members && members.length === 0 && !isLoading ? (
        <div className="bg-fx-surface border border-fx-border rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-fx-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold text-fx-text">
            {searchQuery.trim() ? "Ningún socio coincide con la búsqueda" : showInactive ? "No hay socios dados de baja" : "Todavía no hay socios"}
          </h3>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(members ?? []).map((m) => {
            const badge = STATUS_BADGE[m.membershipStatus];
            return (
              <div key={m.id} className="p-4 rounded-xl bg-fx-base border border-fx-border hover:border-fx-orange/40 flex flex-wrap items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-fx-hover border border-fx-border overflow-hidden flex items-center justify-center shrink-0">
                    {m.photoUrl ? <img src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-fx-muted" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-base text-fx-text">{m.fullName}</div>
                    <div className="font-mono text-xs text-fx-muted mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span>DNI: {m.dni}</span>
                      <span>•</span>
                      <span>{m.planName}</span>
                      {m.validUntil && (
                        <>
                          <span>•</span>
                          <span>Vence: {formatDateAR(m.validUntil)}</span>
                        </>
                      )}
                      {m.phone && (
                        <>
                          <span>•</span>
                          <span>Tel: {m.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${badge.cls}`}>{badge.text}</span>
                  <button
                    type="button"
                    onClick={() => onEditMember(m.id)}
                    className="min-h-[44px] px-4 rounded-xl bg-fx-surface border border-fx-border hover:border-fx-orange text-fx-text text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UserPen className="w-4 h-4 text-fx-orange" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
