"use client";

import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { createProfessorAccount } from "@/actions/accounts.actions";

const INPUT_CLS =
  "w-full min-h-[44px] px-3.5 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text";
const LABEL_CLS = "block text-xs font-bold uppercase tracking-wider text-fx-muted mb-1";

interface Props {
  onCreated: (name: string) => void;
  onCancel: () => void;
  onError: (err: string) => void;
}

export function ProfessorCreateForm({ onCreated, onCancel, onError }: Props) {
  const [draft, setDraft] = useState({ name: "", username: "", password: "", dni: "" });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await createProfessorAccount(draft);
      if (res.success) {
        onCreated(draft.name);
      } else {
        onError(res.error || "No se pudo crear la cuenta");
      }
    } catch {
      onError("Error al conectarse con el servidor");
    } finally {
      setBusy(false);
    }
  };

  const valid = draft.name.trim().length >= 2 && draft.username.length >= 3 && draft.password.length >= 6;

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-fx-base border border-fx-border flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Nombre Completo</label>
          <input
            autoFocus
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            maxLength={60}
            placeholder="Ej: Lucía Gómez"
            className={INPUT_CLS}
            required
          />
        </div>
        <div>
          <label className={LABEL_CLS}>DNI (para fichar en teclado)</label>
          <input
            value={draft.dni}
            onChange={(e) => setDraft({ ...draft, dni: e.target.value.replace(/\D/g, "") })}
            maxLength={10}
            placeholder="Ej: 38123456"
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Usuario de Acceso</label>
          <input
            value={draft.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value.replace(/\s/g, "") })}
            maxLength={30}
            placeholder="Ej: lucia"
            className={INPUT_CLS}
            required
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Contraseña</label>
          <input
            type="password"
            value={draft.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
            maxLength={72}
            placeholder="Mínimo 6 caracteres"
            className={INPUT_CLS}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="min-h-[38px] px-3.5 rounded-lg border border-fx-border text-xs font-bold text-fx-muted hover:bg-fx-hover">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={busy || !valid}
          className="min-h-[38px] px-4 rounded-lg bg-fx-orange hover:bg-fx-orange/90 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Crear cuenta
        </button>
      </div>
    </form>
  );
}
