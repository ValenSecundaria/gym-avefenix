"use client";

import React, { useState } from "react";
import { Check, KeyRound, Loader2, Trash2, X, CreditCard, Edit3 } from "lucide-react";
import type { ProfessorAccountItem } from "@/types";
import { resetProfessorPassword, deleteProfessorAccount, updateProfessorDni } from "@/actions/accounts.actions";
import { PasswordInput } from "@/components/ui/PasswordInput";

const SMALL_BTN = "min-h-[36px] px-3 rounded-lg border border-fx-border bg-fx-surface hover:bg-fx-hover text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40";

interface Props {
  account: ProfessorAccountItem;
  onChanged: (msg: string) => void;
  onError: (err: string) => void;
}

export function ProfessorAccountRow({ account, onChanged, onError }: Props) {
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState<string | null>(null);
  const [editingDni, setEditingDni] = useState(false);
  const [dniValue, setDniValue] = useState(account.dni || "");

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordDraft) return;
    setBusy(true);
    try {
      const res = await resetProfessorPassword(account.id, passwordDraft);
      if (res.success) {
        setPasswordDraft(null);
        onChanged("Contraseña actualizada con éxito.");
      } else onError(res.error || "No se pudo cambiar la contraseña");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDni = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await updateProfessorDni(account.id, dniValue.trim() || null);
      if (res.success) {
        setEditingDni(false);
        onChanged(`DNI de ${account.name} actualizado.`);
      } else onError(res.error || "No se pudo actualizar el DNI");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      const res = await deleteProfessorAccount(account.id);
      if (res.success) onChanged(`Cuenta de ${account.name} borrada.`);
      else onError(res.error || "No se pudo borrar la cuenta");
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <li className="p-3.5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-fx-text">{account.name}</div>
          <div className="text-xs text-fx-muted flex flex-wrap items-center gap-2 mt-0.5">
            <span>Usuario: <strong className="font-mono text-fx-text">{account.username}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              DNI: <strong className="font-mono text-fx-text">{account.dni || "Sin DNI"}</strong>
              <button type="button" onClick={() => setEditingDni(!editingDni)} className="text-fx-orange hover:underline text-[10px] ml-1">
                {editingDni ? "Cerrar" : "Editar"}
              </button>
            </span>
            <span>•</span>
            <span>{account.paymentsCount} cobros</span>
          </div>
        </div>

        {confirmDelete ? (
          <span className="flex items-center gap-2">
            <span className="text-xs text-fx-text">¿Borrar?</span>
            <button type="button" onClick={() => setConfirmDelete(false)} disabled={busy} className={SMALL_BTN}>No</button>
            <button type="button" onClick={handleDelete} disabled={busy} className="min-h-[36px] px-3 rounded-lg bg-fx-red text-white text-xs font-bold flex items-center gap-1">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Sí
            </button>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <button type="button" onClick={() => setPasswordDraft("")} disabled={busy} className={SMALL_BTN}>
              <KeyRound className="w-3.5 h-3.5 text-fx-orange" /> Contraseña
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy} className={`${SMALL_BTN} text-fx-red`}>
              <Trash2 className="w-3.5 h-3.5" /> Borrar
            </button>
          </span>
        )}
      </div>

      {editingDni && (
        <form onSubmit={handleSaveDni} className="flex items-center gap-2 pt-1">
          <input
            value={dniValue}
            onChange={(e) => setDniValue(e.target.value.replace(/\D/g, ""))}
            placeholder="DNI del profesor..."
            maxLength={10}
            className="min-h-[36px] px-3 rounded-lg bg-fx-base border border-fx-border text-xs text-fx-text"
          />
          <button type="submit" disabled={busy} className="min-h-[36px] px-3 rounded-lg bg-fx-orange text-white text-xs font-bold">
            Guardar DNI
          </button>
        </form>
      )}

      {passwordDraft !== null && (
        <form onSubmit={handlePassword} className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex-1 min-w-[160px] flex">
            <PasswordInput
              autoFocus
              autoComplete="new-password"
              value={passwordDraft}
              onChange={(e) => setPasswordDraft(e.target.value)}
              placeholder="Nueva contraseña (mín 6)"
              className="w-full min-h-[36px] px-3 rounded-lg bg-fx-base border border-fx-border text-xs text-fx-text"
            />
          </div>
          <button type="button" onClick={() => setPasswordDraft(null)} className={SMALL_BTN}>Cancelar</button>
          <button type="submit" disabled={busy || passwordDraft.length < 6} className="min-h-[36px] px-3 rounded-lg bg-fx-orange text-white text-xs font-bold">
            Guardar
          </button>
        </form>
      )}
    </li>
  );
}
