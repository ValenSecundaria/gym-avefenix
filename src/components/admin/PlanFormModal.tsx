"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Tags, X } from "lucide-react";
import type { DisciplineItem, PlanAdminItem, PlanCategoryType } from "@/types";
import { savePlan } from "@/actions/plans.actions";

interface PlanFormModalProps {
  /** null = cerrado; "new" = alta; un plan = edición. */
  plan: PlanAdminItem | "new" | null;
  disciplines: DisciplineItem[];
  defaultDisciplineId?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const INPUT_CLS =
  "w-full min-h-[48px] px-4 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text";
const LABEL_CLS = "block text-xs font-bold uppercase tracking-wider text-fx-muted mb-1.5";

export const PLAN_CATEGORY_LABEL: Record<PlanCategoryType, string> = {
  MENSUAL_LIBRE: "Mensual libre",
  MENSUAL_DIAS: "Mensual por días",
  DIARIO: "Pase diario",
};

const CATEGORY_HELP: Record<PlanCategoryType, string> = {
  MENSUAL_LIBRE: "30 días, puede venir todos los días.",
  MENSUAL_DIAS: "30 días, con un máximo de días por semana.",
  DIARIO: "Vale por 1 día.",
};

export function PlanFormModal(props: PlanFormModalProps) {
  if (!props.plan) return null;
  const key = props.plan === "new" ? "new" : props.plan.id;
  return <PlanFormDialog key={key} {...props} plan={props.plan} />;
}

function PlanFormDialog({
  plan,
  disciplines,
  defaultDisciplineId,
  onClose,
  onSaved,
}: PlanFormModalProps & { plan: PlanAdminItem | "new" }) {
  const editing = plan === "new" ? null : plan;
  const selectable = disciplines.filter((d) => d.isActive || d.id === editing?.disciplineId);
  const [name, setName] = useState(editing?.name ?? "");
  const [disciplineId, setDisciplineId] = useState(
    editing?.disciplineId ?? defaultDisciplineId ?? selectable[0]?.id ?? ""
  );
  const [category, setCategory] = useState<PlanCategoryType>(editing?.category ?? "MENSUAL_LIBRE");
  const [days, setDays] = useState(
    editing?.category === "MENSUAL_DIAS" && editing.allowedDaysPerWeek ? editing.allowedDaysPerWeek : 3
  );
  const [price, setPrice] = useState(editing ? String(editing.price) : "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isSaving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSaving, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const priceNumber = Number(price.replace(/\./g, "").replace(",", "."));
    if (name.trim().length < 3) return setError("Poné un nombre de al menos 3 letras.");
    if (!disciplineId) return setError("Elegí la disciplina del plan.");
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) return setError("Poné un precio mayor a cero.");

    setIsSaving(true);
    try {
      const res = await savePlan({
        id: editing?.id,
        name: name.trim(),
        disciplineId,
        category,
        allowedDaysPerWeek: category === "MENSUAL_DIAS" ? days : null,
        price: priceNumber,
      });
      if (!res.success) return setError(res.error || "No se pudo guardar el plan.");
      onSaved(editing ? `Plan ${name.trim()} actualizado.` : `Plan ${name.trim()} creado. Ya se puede elegir en el alta.`);
      onClose();
    } catch {
      setError("Sin conexión: el plan no se guardó.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="plan-form-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-fx-surface border border-fx-border w-full max-w-lg rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 flex flex-col gap-4 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-fx-border">
          <h2 id="plan-form-title" className="text-lg font-extrabold text-fx-text flex items-center gap-2">
            <Tags className="w-5 h-5 text-fx-orange" />
            {editing ? "Editar plan" : "Nuevo plan"}
          </h2>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Cerrar" className="w-10 h-10 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-sm text-fx-text">
            <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="plan-name" className={LABEL_CLS}>Nombre del plan *</label>
          <input id="plan-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Funcional 2 días" className={INPUT_CLS} />
        </div>

        <div>
          <label htmlFor="plan-discipline" className={LABEL_CLS}>Disciplina *</label>
          <select id="plan-discipline" value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)} className={INPUT_CLS}>
            {selectable.map((d) => (
              <option key={d.id} value={d.id}>{d.name}{d.isActive ? "" : " (desactivada)"}</option>
            ))}
          </select>
        </div>

        <div>
          <span className={LABEL_CLS}>Tipo de plan *</span>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo de plan">
            {(Object.keys(PLAN_CATEGORY_LABEL) as PlanCategoryType[]).map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={`min-h-[48px] px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${category === c ? "bg-fx-orange text-white border-fx-orange" : "bg-fx-base border-fx-border text-fx-muted hover:text-fx-text"}`}>
                {PLAN_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <p className="text-xs text-fx-muted mt-1.5">{CATEGORY_HELP[category]}</p>
        </div>

        {category === "MENSUAL_DIAS" && (
          <div>
            <span className={LABEL_CLS}>Días por semana *</span>
            <div className="grid grid-cols-6 gap-2" role="group" aria-label="Días por semana">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button key={n} type="button" onClick={() => setDays(n)} aria-pressed={days === n} className={`min-h-[44px] rounded-xl text-sm font-bold border cursor-pointer ${days === n ? "bg-fx-orange/20 border-fx-orange text-fx-text" : "bg-fx-base border-fx-border text-fx-muted hover:text-fx-text"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="plan-price" className={LABEL_CLS}>Precio (ARS) *</label>
          <input id="plan-price" type="text" inputMode="decimal" required value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="Ej: 18500" className={`${INPUT_CLS} font-mono`} />
          {editing && editing.currentMembersCount > 0 && (
            <p className="text-xs text-fx-muted mt-1.5">
              Los {editing.currentMembersCount} socios con la cuota al día no cambian; el precio nuevo se aplica desde su próximo cobro.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-fx-border">
          <button type="button" onClick={onClose} disabled={isSaving} className="min-h-[48px] px-5 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text font-semibold text-sm cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={isSaving} className="min-h-[48px] px-6 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {editing ? "Guardar cambios" : "Crear plan"}
          </button>
        </div>
      </form>
    </div>
  );
}
