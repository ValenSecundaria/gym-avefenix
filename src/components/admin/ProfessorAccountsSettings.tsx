"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, GraduationCap, KeyRound, Loader2, Plus, Trash2, X } from "lucide-react";
import type { ProfessorAccountItem } from "@/types";
import {
  createProfessorAccount,
  deleteProfessorAccount,
  listProfessorAccounts,
  resetProfessorPassword,
} from "@/actions/accounts.actions";

const INPUT_CLS =
  "w-full min-h-[48px] px-4 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text";
const LABEL_CLS = "block text-xs font-bold uppercase tracking-wider text-fx-muted mb-1.5";
const SMALL_BTN_BASE =
  "min-h-[40px] px-3 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
const SMALL_BTN = `${SMALL_BTN_BASE} bg-fx-surface border-fx-border hover:bg-fx-hover`;
const SMALL_BTN_PRIMARY = `${SMALL_BTN_BASE} bg-fx-orange border-fx-orange text-white hover:bg-fx-orange/90`;
const SMALL_BTN_DANGER = `${SMALL_BTN_BASE} bg-fx-red border-fx-red text-white hover:bg-fx-red/90`;

type Feedback = { type: "success" | "error"; message: string } | null;

// Cuentas de profesor: dan altas, registran cobros y ven métricas, sin datos de plata.
export function ProfessorAccountsSettings() {
  const [accounts, setAccounts] = useState<ProfessorAccountItem[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; username: string; password: string } | null>(null);
  const [passwordDraft, setPasswordDraft] = useState<{ id: string; password: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const run = async (id: string, action: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await action();
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "No se pudo completar la acción." });
        return false;
      }
      setFeedback({ type: "success", message: ok });
      setReloadKey((k) => k + 1);
      return true;
    } catch {
      setFeedback({ type: "error", message: "Sin conexión: no se guardaron los cambios." });
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const ok = await run("new", () => createProfessorAccount(draft), `Cuenta de ${draft.name.trim()} creada. Ya puede ingresar con su usuario.`);
    if (ok) setDraft(null);
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordDraft) return;
    const ok = await run(passwordDraft.id, () => resetProfessorPassword(passwordDraft.id, passwordDraft.password), "Contraseña actualizada.");
    if (ok) setPasswordDraft(null);
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-fx-text flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-fx-orange" />
            Cuentas de profesores
          </h3>
          <p className="text-sm text-fx-muted mt-1 leading-relaxed">
            Pueden dar de alta socios, registrar cobros y ver métricas de asistencia. No ven montos, caja ni historial de pagos.
          </p>
        </div>
        {!draft && (
          <button type="button" onClick={() => setDraft({ name: "", username: "", password: "" })} className={`${SMALL_BTN} text-fx-text`}>
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

      {draft && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl bg-fx-base border border-fx-border flex flex-col gap-3">
          <div>
            <label htmlFor="prof-name" className={LABEL_CLS}>Nombre</label>
            <input id="prof-name" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={60} placeholder="Ej: Lucía Gómez" className={INPUT_CLS} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="prof-user" className={LABEL_CLS}>Usuario</label>
              <input id="prof-user" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value.replace(/\s/g, "") })} maxLength={30} autoComplete="off" placeholder="Ej: lucia" className={INPUT_CLS} />
            </div>
            <div>
              <label htmlFor="prof-pass" className={LABEL_CLS}>Contraseña</label>
              <input id="prof-pass" type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} maxLength={72} autoComplete="new-password" placeholder="Mínimo 6 caracteres" className={INPUT_CLS} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className={`${SMALL_BTN} text-fx-muted`}>Cancelar</button>
            <button
              type="submit"
              disabled={busyId !== null || draft.name.trim().length < 2 || draft.username.length < 3 || draft.password.length < 6}
              className={SMALL_BTN_PRIMARY}
            >
              {busyId === "new" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Crear cuenta
            </button>
          </div>
        </form>
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
          {accounts.map((a) => {
            const busy = busyId === a.id;
            return (
              <li key={a.id} className="p-3.5 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-fx-text">{a.name}</div>
                    <div className="text-xs text-fx-muted">
                      Usuario: <span className="font-mono text-fx-text">{a.username}</span> • {a.paymentsCount} cobros registrados
                    </div>
                  </div>
                  {confirmDeleteId === a.id ? (
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-fx-text">¿Borrar la cuenta?</span>
                      <button type="button" onClick={() => setConfirmDeleteId(null)} disabled={busy} className={`${SMALL_BTN} text-fx-muted`}>
                        <X className="w-3.5 h-3.5" /> No
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          run(a.id, () => deleteProfessorAccount(a.id), `Cuenta de ${a.name} borrada.`).finally(() => setConfirmDeleteId(null))
                        }
                        disabled={busy}
                        className={SMALL_BTN_DANGER}
                      >
                        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Sí, borrar
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <button type="button" onClick={() => setPasswordDraft({ id: a.id, password: "" })} disabled={busy} className={`${SMALL_BTN} text-fx-text`}>
                        <KeyRound className="w-3.5 h-3.5 text-fx-orange" /> Contraseña
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteId(a.id)} disabled={busy} aria-label={`Borrar cuenta de ${a.name}`} className={`${SMALL_BTN} text-fx-red`}>
                        <Trash2 className="w-3.5 h-3.5" /> Borrar
                      </button>
                    </span>
                  )}
                </div>
                {passwordDraft?.id === a.id && (
                  <form onSubmit={handlePassword} className="flex flex-wrap items-center gap-2">
                    <label htmlFor={`pass-${a.id}`} className="sr-only">Nueva contraseña de {a.name}</label>
                    <input
                      id={`pass-${a.id}`}
                      type="password"
                      autoFocus
                      value={passwordDraft.password}
                      onChange={(e) => setPasswordDraft({ id: a.id, password: e.target.value })}
                      maxLength={72}
                      autoComplete="new-password"
                      placeholder="Nueva contraseña (mínimo 6)"
                      className={`${INPUT_CLS} flex-1 min-w-[180px]`}
                    />
                    <button type="button" onClick={() => setPasswordDraft(null)} className={`${SMALL_BTN} text-fx-muted`}>Cancelar</button>
                    <button type="submit" disabled={busy || passwordDraft.password.length < 6} className={SMALL_BTN_PRIMARY}>
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Guardar
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
