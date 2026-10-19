"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Pencil, Plus, Power, Tags, Trash2, X } from "lucide-react";
import type { DisciplineItem, PlanAdminItem, PlanCatalog } from "@/types";
import { formatCurrencyARS } from "@/lib/utils";
import {
  deletePlan,
  getPlanCatalog,
  saveDiscipline,
  setDisciplineActive,
  setPlanActive,
} from "@/actions/plans.actions";
import { PLAN_CATEGORY_LABEL, PlanFormModal } from "./PlanFormModal";

interface PlansAdminSectionProps {
  /** Aviso + refresco del panel (los planes del alta y del cobro salen de ahí). */
  onChanged: (message: string) => void;
}

const SMALL_BTN =
  "min-h-[40px] px-3 rounded-lg bg-fx-surface border border-fx-border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

function planDetail(p: PlanAdminItem): string {
  if (p.category === "MENSUAL_DIAS") return `${p.allowedDaysPerWeek} días por semana • 30 días`;
  if (p.category === "DIARIO") return "Vale 1 día";
  return "Todos los días • 30 días";
}

export function PlansAdminSection({ onChanged }: PlansAdminSectionProps) {
  const [catalog, setCatalog] = useState<PlanCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [disciplineFilter, setDisciplineFilter] = useState<string>("ALL");
  const [editingPlan, setEditingPlan] = useState<PlanAdminItem | "new" | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [disciplineDraft, setDisciplineDraft] = useState<{ id?: string; name: string } | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPlanCatalog()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setCatalog(res.data);
          setError(null);
        } else {
          setError(res.error || "No se pudieron cargar los planes.");
        }
      })
      .catch(() => !cancelled && setError("Sin conexión: no se pudieron cargar los planes."));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const afterChange = (message: string) => {
    onChanged(message);
    setReloadKey((k) => k + 1);
  };

  // Ejecuta una acción y muestra su error en la sección; ok = mensaje para el aviso.
  const run = async (id: string, action: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await action();
      if (!res.success) {
        setError(res.error || "No se pudo completar la acción.");
        return false;
      }
      afterChange(ok);
      return true;
    } catch {
      setError("Sin conexión: no se guardaron los cambios.");
      return false;
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleSaveDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplineDraft) return;
    const name = disciplineDraft.name.trim();
    const saved = await run(
      disciplineDraft.id ?? "new-discipline",
      () => saveDiscipline({ id: disciplineDraft.id, name }),
      disciplineDraft.id ? `Disciplina renombrada a ${name}.` : `Disciplina ${name} creada.`
    );
    if (saved) setDisciplineDraft(null);
  };

  if (!catalog) {
    return (
      <div className="py-10 flex flex-col items-center gap-3 text-sm text-fx-muted">
        {error ? (
          <>
            <AlertCircle className="w-8 h-8 text-fx-red" />
            <span>{error}</span>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-fx-orange" />
            <span>Cargando planes...</span>
          </>
        )}
      </div>
    );
  }

  const disciplinesShown: (DisciplineItem | null)[] =
    disciplineFilter === "ALL" ? [...catalog.disciplines] : catalog.disciplines.filter((d) => d.id === disciplineFilter);
  const orphanPlans = catalog.plans.filter((p) => !p.disciplineId);
  if (disciplineFilter === "ALL" && orphanPlans.length > 0) disciplinesShown.push(null);

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-sm text-fx-text">
          <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-fx-base border border-fx-border">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por disciplina">
          {[{ id: "ALL", name: "Todas" }, ...catalog.disciplines].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDisciplineFilter(d.id)}
              aria-pressed={disciplineFilter === d.id}
              className={`min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                disciplineFilter === d.id ? "bg-fx-orange text-white" : "bg-fx-surface border border-fx-border text-fx-muted hover:text-fx-text"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditingPlan("new")}
          className="min-h-[44px] px-4 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo plan
        </button>
      </div>

      {disciplinesShown.map((d) => {
        const plans = catalog.plans.filter((p) => (d ? p.disciplineId === d.id : !p.disciplineId));
        return (
          <section key={d?.id ?? "sin-disciplina"} aria-label={d?.name ?? "Sin disciplina"} className="flex flex-col gap-2">
            <h3 className="text-sm font-extrabold text-fx-text flex items-center gap-2">
              <Tags className="w-4 h-4 text-fx-orange" />
              {d?.name ?? "Sin disciplina"}
              {d && !d.isActive && (
                <span className="px-2 py-0.5 rounded-md border text-[11px] font-bold bg-fx-amber/15 text-fx-amber border-fx-amber/40">
                  Desactivada: sus planes no se ofrecen
                </span>
              )}
            </h3>
            {plans.length === 0 ? (
              <p className="text-sm text-fx-muted p-4 rounded-xl border border-dashed border-fx-border">
                Todavía no hay planes de {d?.name ?? "esta disciplina"}.
              </p>
            ) : (
              plans.map((p) => {
                const busy = busyId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl bg-fx-base border border-fx-border flex flex-wrap items-center justify-between gap-3 ${p.isActive ? "" : "opacity-60"}`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-base text-fx-text flex flex-wrap items-center gap-2">
                        {p.name}
                        {!p.isActive && (
                          <span className="px-2 py-0.5 rounded-md border text-[11px] font-bold bg-fx-hover text-fx-muted border-fx-border">Desactivado</span>
                        )}
                      </div>
                      <div className="text-xs text-fx-muted mt-0.5">
                        {PLAN_CATEGORY_LABEL[p.category]} • {planDetail(p)} • {p.currentMembersCount} socios al día
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-lg text-fx-orange mr-1">{formatCurrencyARS(p.price)}</span>
                      {confirmDeleteId === p.id ? (
                        <>
                          <span className="text-xs text-fx-text">¿Borrar {p.name}?</span>
                          <button type="button" onClick={() => setConfirmDeleteId(null)} disabled={busy} className={`${SMALL_BTN} text-fx-muted`}>
                            <X className="w-3.5 h-3.5" /> No
                          </button>
                          <button
                            type="button"
                            onClick={() => run(p.id, () => deletePlan(p.id), `Plan ${p.name} borrado.`)}
                            disabled={busy}
                            className={`${SMALL_BTN} bg-fx-red border-fx-red text-white`}
                          >
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Sí, borrar
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => setEditingPlan(p)} disabled={busy} className={`${SMALL_BTN} text-fx-text`}>
                            <Pencil className="w-3.5 h-3.5 text-fx-orange" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              run(p.id, () => setPlanActive(p.id, !p.isActive), p.isActive ? `Plan ${p.name} desactivado: ya no se ofrece en altas ni cobros.` : `Plan ${p.name} activado.`)
                            }
                            disabled={busy}
                            className={`${SMALL_BTN} ${p.isActive ? "text-fx-amber" : "text-fx-green"}`}
                          >
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                            {p.isActive ? "Desactivar" : "Activar"}
                          </button>
                          {p.membershipsCount === 0 && (
                            <button type="button" onClick={() => setConfirmDeleteId(p.id)} disabled={busy} aria-label={`Borrar ${p.name}`} className={`${SMALL_BTN} text-fx-red`}>
                              <Trash2 className="w-3.5 h-3.5" /> Borrar
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        );
      })}

      <section aria-labelledby="disciplines-title" className="flex flex-col gap-3 p-4 rounded-xl bg-fx-base border border-fx-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="disciplines-title" className="text-sm font-extrabold text-fx-text">Disciplinas</h3>
          {!disciplineDraft && (
            <button type="button" onClick={() => setDisciplineDraft({ name: "" })} className={`${SMALL_BTN} text-fx-text`}>
              <Plus className="w-3.5 h-3.5 text-fx-orange" /> Nueva disciplina
            </button>
          )}
        </div>

        {disciplineDraft && (
          <form onSubmit={handleSaveDiscipline} className="flex flex-wrap items-center gap-2">
            <label htmlFor="discipline-name" className="sr-only">Nombre de la disciplina</label>
            <input
              id="discipline-name"
              autoFocus
              value={disciplineDraft.name}
              onChange={(e) => setDisciplineDraft({ ...disciplineDraft, name: e.target.value })}
              placeholder="Ej: Yoga"
              maxLength={40}
              className="flex-1 min-w-[180px] min-h-[44px] px-4 rounded-xl bg-fx-surface border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text"
            />
            <button type="button" onClick={() => setDisciplineDraft(null)} className={`${SMALL_BTN} text-fx-muted`}>
              Cancelar
            </button>
            <button type="submit" disabled={disciplineDraft.name.trim().length < 2 || busyId !== null} className={`${SMALL_BTN} bg-fx-orange border-fx-orange text-white`}>
              <Check className="w-3.5 h-3.5" /> {disciplineDraft.id ? "Guardar nombre" : "Crear"}
            </button>
          </form>
        )}

        <ul className="flex flex-col divide-y divide-fx-border">
          {catalog.disciplines.map((d) => (
            <li key={d.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${d.isActive ? "text-fx-text" : "text-fx-muted line-through"}`}>
                {d.name} <span className="text-xs font-normal text-fx-muted no-underline">({d.plansCount} planes)</span>
              </span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => setDisciplineDraft({ id: d.id, name: d.name })} className={`${SMALL_BTN} text-fx-text`}>
                  <Pencil className="w-3.5 h-3.5 text-fx-orange" /> Renombrar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    run(d.id, () => setDisciplineActive(d.id, !d.isActive), d.isActive ? `Disciplina ${d.name} desactivada.` : `Disciplina ${d.name} activada.`)
                  }
                  disabled={busyId === d.id}
                  className={`${SMALL_BTN} ${d.isActive ? "text-fx-amber" : "text-fx-green"}`}
                >
                  <Power className="w-3.5 h-3.5" /> {d.isActive ? "Desactivar" : "Activar"}
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <PlanFormModal
        plan={editingPlan}
        disciplines={catalog.disciplines}
        defaultDisciplineId={disciplineFilter !== "ALL" ? disciplineFilter : undefined}
        onClose={() => setEditingPlan(null)}
        onSaved={afterChange}
      />
    </div>
  );
}
