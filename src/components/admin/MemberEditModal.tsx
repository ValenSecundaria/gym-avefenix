"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Camera, Check, Loader2, MessageCircle, RotateCcw, Trash2, User, UserMinus, UserPen, X } from "lucide-react";
import type { MemberDetail } from "@/types";
import { formatDateAR } from "@/lib/utils";
import {
  deleteMemberPermanently,
  getMemberDetail,
  setMemberActive,
  updateMember,
} from "@/actions/members.actions";
import { WebcamCapture } from "./WebcamCapture";
import { sanitizeNameInput, sanitizePhoneInput } from "@/lib/validations/member.schema";
import { MemberHistory, MemberSummary } from "./MemberHistory";
import { WhatsAppEditModal, type WhatsAppMessageTarget } from "./WhatsAppEditModal";

interface MemberEditModalProps {
  memberId: string | null;
  onClose: () => void;
  /** Se llama después de guardar, dar de baja, reactivar o eliminar, con el mensaje para el aviso. */
  onChanged: (message: string) => void;
}

const INPUT_CLS =
  "w-full min-h-[48px] px-4 rounded-xl bg-fx-base border border-fx-border focus:border-fx-orange focus:outline-none text-sm text-fx-text";
const LABEL_CLS = "block text-xs font-bold uppercase tracking-wider text-fx-muted mb-1.5";

const STATUS_LABEL: Record<MemberDetail["membershipStatus"], { text: string; cls: string }> = {
  ACTIVA: { text: "Cuota al día", cls: "bg-fx-green/15 text-fx-green border-fx-green/40" },
  VENCIDA: { text: "Cuota vencida", cls: "bg-fx-red/15 text-fx-red border-fx-red/40" },
  CANCELADA: { text: "Cancelada", cls: "bg-fx-red/15 text-fx-red border-fx-red/40" },
  SIN_MEMBRESIA: { text: "Sin plan", cls: "bg-fx-hover text-fx-muted border-fx-border" },
};

type DangerStep = null | "deactivate" | "delete";

export function MemberEditModal({ memberId, onClose, onChanged }: MemberEditModalProps) {
  if (!memberId) return null;
  // key: al abrir otro socio el formulario arranca de cero.
  return <MemberEditDialog key={memberId} memberId={memberId} onClose={onClose} onChanged={onChanged} />;
}

function MemberEditDialog({ memberId, onClose, onChanged }: { memberId: string } & Omit<MemberEditModalProps, "memberId">) {
  const [waTarget, setWaTarget] = useState<WhatsAppMessageTarget | null>(null);
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [changingPhoto, setChangingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dangerStep, setDangerStep] = useState<DangerStep>(null);
  const [confirmDni, setConfirmDni] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMemberDetail(memberId)
      .then((res) => {
        if (cancelled) return;
        if (!res.success || !res.data) return setLoadError(res.error || "No se pudo cargar el socio.");
        setMember(res.data);
        setFullName(res.data.fullName);
        setDni(res.data.dni);
        setPhone(sanitizePhoneInput(res.data.phone ?? ""));
        setNotes(res.data.notes ?? "");
      })
      .catch(() => !cancelled && setLoadError("Sin conexión: no se pudo cargar el socio."));
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isBusy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isBusy, onClose]);

  // Envuelve cada acción: un corte de red no debe dejar el botón girando para siempre.
  const run = async (action: () => Promise<{ success: boolean; error?: string; message?: string }>) => {
    setError(null);
    setIsBusy(true);
    try {
      const res = await action();
      if (!res.success) return setError(res.error || "No se pudo completar la acción.");
      onChanged(res.message ?? "Cambios guardados.");
      onClose();
    } catch {
      setError("Sin conexión: los cambios no se guardaron. Probá de nuevo cuando vuelva internet.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    const cleanDni = dni.replace(/\D/g, "");
    if (fullName.trim().length < 3) return setError("Ingresá el nombre y apellido del socio.");
    if (cleanDni.length < 6 || cleanDni.length > 8) return setError("El DNI debe tener 6 a 8 dígitos.");
    if (changingPhoto && !newPhoto) return setError("Sacá la foto nueva o cancelá el cambio de foto.");

    void run(async () => {
      const res = await updateMember({
        id: member.id,
        fullName: fullName.trim(),
        dni: cleanDni,
        phone: phone.trim(),
        notes: notes.trim(),
        photoBase64: newPhoto,
      });
      return { ...res, message: `Datos de ${fullName.trim()} actualizados.` };
    });
  };

  const handleSetActive = (isActive: boolean) => {
    if (!member) return;
    void run(async () => {
      const res = await setMemberActive(member.id, isActive);
      return {
        ...res,
        message: isActive
          ? `Se reactivó a ${member.fullName}. Si su cuota está vencida, aparece en Cuotas pendientes.`
          : `Se dio de baja a ${member.fullName}. Su historial de pagos se conserva.`,
      };
    });
  };

  const handleDelete = () => {
    if (!member) return;
    void run(async () => {
      const res = await deleteMemberPermanently(member.id, confirmDni.trim());
      return { ...res, message: `Se eliminó definitivamente a ${member.fullName}.` };
    });
  };

  const status = member ? STATUS_LABEL[member.membershipStatus] : null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="edit-member-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-fx-surface border border-fx-border w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 sm:p-8 flex flex-col gap-6 my-auto">
        <div className="flex items-start justify-between pb-4 border-b border-fx-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fx-orange to-fx-red flex items-center justify-center text-white shrink-0">
              <UserPen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-member-title" className="text-lg sm:text-xl text-fx-text font-extrabold tracking-tight">
                {member ? member.fullName : "Editar socio"}
              </h2>
              {member && (
                <p className="text-xs text-fx-muted flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                  {status && <span className={`px-2 py-0.5 rounded-md border font-bold ${status.cls}`}>{status.text}</span>}
                  {!member.isActive && <span className="px-2 py-0.5 rounded-md border font-bold bg-fx-amber/15 text-fx-amber border-fx-amber/40">Dado de baja</span>}
                  <span>Plan: {member.planName}</span>
                  <span>• Socio desde {formatDateAR(member.createdAt)}</span>
                </p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isBusy} aria-label="Cerrar" className="w-10 h-10 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text flex items-center justify-center cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!member ? (
          <div className="py-10 flex flex-col items-center gap-3 text-sm text-fx-muted">
            {loadError ? (
              <>
                <AlertCircle className="w-8 h-8 text-fx-red" />
                <span>{loadError}</span>
              </>
            ) : (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-fx-orange" />
                <span>Cargando datos del socio...</span>
              </>
            )}
          </div>
        ) : (
          <>
          <MemberSummary member={member} />
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 flex flex-col gap-3">
              {changingPhoto ? (
                <>
                  <WebcamCapture photoDataUrl={newPhoto} onPhotoCapture={setNewPhoto} />
                  <button type="button" onClick={() => { setChangingPhoto(false); setNewPhoto(null); }} disabled={isBusy} className="min-h-[44px] rounded-xl bg-fx-base border border-fx-border text-sm font-semibold text-fx-muted hover:text-fx-text cursor-pointer">
                    Mantener la foto actual
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs sm:text-sm text-fx-text font-bold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-fx-orange" />
                    Foto del socio
                  </span>
                  <div className="w-full aspect-4/3 rounded-xl bg-fx-base border border-fx-border overflow-hidden flex items-center justify-center">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-fx-muted" />
                    )}
                  </div>
                  <button type="button" onClick={() => setChangingPhoto(true)} disabled={isBusy} className="min-h-[48px] w-full rounded-xl bg-fx-hover hover:bg-fx-border border border-fx-border text-sm font-bold text-fx-text inline-flex items-center justify-center gap-2 cursor-pointer">
                    <Camera className="w-4 h-4 text-fx-orange" />
                    {member.photoUrl ? "Cambiar foto" : "Agregar foto"}
                  </button>
                </>
              )}
              <p className="text-xs text-fx-muted">
                {member.checkInsCount} ingresos y {member.paymentsCount} pagos registrados.
              </p>
            </div>

            <div className="md:col-span-7 flex flex-col gap-4">
              {error && (
                <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-fx-red/20 border border-fx-red text-xs sm:text-sm text-fx-text">
                  <AlertCircle className="w-4 h-4 text-fx-red shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label htmlFor="edit-fullName" className={LABEL_CLS}>Nombre y Apellido *</label>
                <input id="edit-fullName" type="text" required value={fullName} onChange={(e) => setFullName(sanitizeNameInput(e.target.value))} placeholder="Ej: Mariano Alejandro Castro" className={INPUT_CLS} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-dni" className={LABEL_CLS}>Número de DNI *</label>
                  <input id="edit-dni" type="text" inputMode="numeric" required value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Ej: 40123456" className={`${INPUT_CLS} font-mono`} />
                </div>
                <div>
                  <label htmlFor="edit-phone" className={LABEL_CLS}>Teléfono / WhatsApp</label>
                  <input id="edit-phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))} placeholder="Ej: 1154923810 (solo números)" className={INPUT_CLS} />
                </div>
              </div>
              <div>
                <label htmlFor="edit-notes" className={LABEL_CLS}>Observaciones</label>
                <textarea id="edit-notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Abonó en dos partes, presenta apto médico..." className={`${INPUT_CLS} py-3 resize-y`} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-fx-border">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onClose} disabled={isBusy} className="min-h-[48px] px-6 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text font-semibold text-sm cursor-pointer">
                    Cancelar
                  </button>
                  {phone.trim() && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        setWaTarget({
                          fullName: fullName.trim() || member.fullName,
                          phone: phone.trim(),
                          defaultMessage:
                            member.membershipStatus === "VENCIDA" && member.validUntil
                              ? `¡Hola ${fullName.trim() || member.fullName}! Te escribimos de Gimnasio Ave Fénix para recordarte que tu cuota del plan ${member.planName} venció el ${formatDateAR(member.validUntil)}. ¡Te esperamos en recepción para renovarla!`
                              : `¡Hola ${fullName.trim() || member.fullName}! Te escribimos de Gimnasio Ave Fénix.`,
                        })
                      }
                      className="min-h-[48px] px-4 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-fx-base text-sm font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Aviso WhatsApp</span>
                    </button>
                  )}
                </div>
                <button type="submit" disabled={isBusy} className="min-h-[50px] px-7 rounded-xl bg-fx-orange hover:bg-fx-orange/90 text-white font-bold text-sm inline-flex items-center gap-2 shadow-[0_4px_20px_rgba(249,87,22,0.4)] disabled:opacity-50 cursor-pointer">
                  {isBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  <span>Guardar cambios</span>
                </button>
              </div>

              <WhatsAppEditModal target={waTarget} onClose={() => setWaTarget(null)} />

              {/* Zona de baja / eliminación: siempre con un paso de confirmación */}
              <div className="mt-2 p-4 rounded-xl border border-fx-red/40 bg-fx-red/5 flex flex-col gap-3">
                {dangerStep === null && (
                  <div className="flex flex-wrap gap-2">
                    {member.isActive ? (
                      <button type="button" onClick={() => setDangerStep("deactivate")} disabled={isBusy} className="min-h-[44px] px-4 rounded-xl bg-fx-base border border-fx-amber/60 text-fx-amber text-sm font-bold inline-flex items-center gap-2 cursor-pointer">
                        <UserMinus className="w-4 h-4" />
                        Dar de baja
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleSetActive(true)} disabled={isBusy} className="min-h-[44px] px-4 rounded-xl bg-fx-base border border-fx-green/60 text-fx-green text-sm font-bold inline-flex items-center gap-2 cursor-pointer">
                        <RotateCcw className="w-4 h-4" />
                        Reactivar socio
                      </button>
                    )}
                    <button type="button" onClick={() => setDangerStep("delete")} disabled={isBusy} className="min-h-[44px] px-4 rounded-xl bg-fx-base border border-fx-red/60 text-fx-red text-sm font-bold inline-flex items-center gap-2 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                      Eliminar definitivamente
                    </button>
                  </div>
                )}

                {dangerStep === "deactivate" && (
                  <>
                    <p className="text-sm text-fx-text">
                      <b>{member.fullName}</b> deja de figurar en el panel y el molinete no lo deja pasar.
                      Sus pagos e ingresos se conservan y se puede reactivar cuando quiera.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setDangerStep(null)} disabled={isBusy} className="min-h-[44px] px-4 rounded-xl bg-fx-base border border-fx-border text-fx-muted text-sm font-semibold cursor-pointer">
                        Volver
                      </button>
                      <button type="button" onClick={() => handleSetActive(false)} disabled={isBusy} className="min-h-[44px] px-4 rounded-xl bg-fx-amber text-fx-base text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50">
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                        Confirmar baja
                      </button>
                    </div>
                  </>
                )}

                {dangerStep === "delete" && (
                  <>
                    <p className="text-sm text-fx-text">
                      Se borra <b>{member.fullName}</b> con sus {member.paymentsCount} pagos y {member.checkInsCount} ingresos.
                      La caja del mes y las métricas cambian. <b>No se puede deshacer.</b> Usalo solo para altas cargadas por error;
                      si el socio dejó de venir, conviene darlo de baja.
                    </p>
                    <label htmlFor="confirm-dni" className={LABEL_CLS}>Escribí el DNI {member.dni} para confirmar</label>
                    <input id="confirm-dni" type="text" inputMode="numeric" autoComplete="off" value={confirmDni} onChange={(e) => setConfirmDni(e.target.value.replace(/\D/g, ""))} className={`${INPUT_CLS} font-mono`} />
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setDangerStep(null); setConfirmDni(""); }} disabled={isBusy} className="min-h-[44px] px-4 rounded-xl bg-fx-base border border-fx-border text-fx-muted text-sm font-semibold cursor-pointer">
                        Volver
                      </button>
                      <button type="button" onClick={handleDelete} disabled={isBusy || confirmDni !== member.dni} className="min-h-[44px] px-4 rounded-xl bg-fx-red text-white text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Eliminar para siempre
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </form>
          <MemberHistory member={member} />
          </>
        )}
      </div>
    </div>
  );
}
