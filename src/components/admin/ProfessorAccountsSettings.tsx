"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, GraduationCap, Loader2, Plus } from "lucide-react";
import type { ProfessorAccountItem } from "@/types";
import { listProfessorAccounts } from "@/actions/accounts.actions";
import { ProfessorCreateForm } from "./professor-accounts/ProfessorCreateForm";
import { ProfessorAccountRow } from "./professor-accounts/ProfessorAccountRow";

type Feedback = { type: "success" | "error"; message: string } | null;

export function ProfessorAccountsSettings() {
  const [accounts, setAccounts] = useState<ProfessorAccountItem[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listProfessorAccounts()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setAccounts(res.data);
        else setFeedback({ type: "error", message: res.error || "No se pudieron cargar las cuentas." });
      })
      .catch(() => !cancelled && setFeedback({ type: "error", message: "Sin conexión: no se pudieron cargar las cuentas." }));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="max-w-xl mx-auto w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-fx-text flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-fx-orange" />
            Cuentas de profesores
          </h3>
          <p className="text-sm text-fx-muted mt-1 leading-relaxed">
            Permite a los profesores acceder a su panel, registrar cobros y fichar entrada/salida con su DNI.
          </p>
        </div>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="min-h-[40px] px-3.5 rounded-lg border border-fx-border bg-fx-surface hover:bg-fx-hover text-xs font-bold text-fx-text flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-fx-orange" /> Nueva cuenta
          </button>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm font-medium ${
            feedback.type === "success" ? "bg-fx-green/10 border-fx-green text-fx-green" : "bg-fx-red/10 border-fx-red text-fx-red"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {isCreating && (
        <ProfessorCreateForm
          onCreated={(name) => {
            setIsCreating(false);
            setFeedback({ type: "success", message: `Cuenta de ${name} creada exitosamente.` });
            setReloadKey((k) => k + 1);
          }}
          onCancel={() => setIsCreating(false)}
          onError={(err) => setFeedback({ type: "error", message: err })}
        />
      )}

      {accounts === null ? (
        !feedback && (
          <div className="py-6 flex items-center justify-center gap-2 text-sm text-fx-muted">
            <Loader2 className="w-4 h-4 animate-spin text-fx-orange" /> Cargando cuentas...
          </div>
        )
      ) : accounts.length === 0 ? (
        <p className="text-sm text-fx-muted p-4 rounded-xl border border-dashed border-fx-border">Todavía no hay cuentas de profesores.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-fx-border rounded-xl border border-fx-border bg-fx-base">
          {accounts.map((a) => (
            <ProfessorAccountRow
              key={a.id}
              account={a}
              onChanged={(msg) => {
                setFeedback({ type: "success", message: msg });
                setReloadKey((k) => k + 1);
              }}
              onError={(err) => setFeedback({ type: "error", message: err })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
