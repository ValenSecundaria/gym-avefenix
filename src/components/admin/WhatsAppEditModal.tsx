"use client";

import React, { useState, useEffect } from "react";
import { X, MessageCircle, Send, Phone, User } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

export interface WhatsAppMessageTarget {
  fullName: string;
  phone: string;
  defaultMessage: string;
}

interface WhatsAppEditModalProps {
  target: WhatsAppMessageTarget | null;
  onClose: () => void;
}

export function WhatsAppEditModal({ target, onClose }: WhatsAppEditModalProps) {
  if (!target) return null;
  // key: al abrir el modal para otro socio, el mensaje arranca de nuevo con el precargado.
  return (
    <WhatsAppEditDialog
      key={`${target.phone}|${target.fullName}|${target.defaultMessage}`}
      target={target}
      onClose={onClose}
    />
  );
}

function WhatsAppEditDialog({ target, onClose }: { target: WhatsAppMessageTarget; onClose: () => void }) {
  const [message, setMessage] = useState(target.defaultMessage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const url = buildWhatsAppLink(target.phone, trimmedMessage);
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-fx-surface border border-fx-border w-full max-w-lg rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 sm:p-7 flex flex-col gap-5 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-4 border-b border-fx-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="whatsapp-modal-title" className="text-lg font-extrabold text-fx-text tracking-tight">
                Enviar Aviso por WhatsApp
              </h2>
              <p className="text-xs text-fx-muted">Personalizá el mensaje antes de abrir la conversación.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Destinatario */}
        <div className="p-3.5 rounded-xl bg-fx-base border border-fx-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-fx-text font-bold">
            <User className="w-4 h-4 text-fx-orange shrink-0" />
            <span className="truncate">{target.fullName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-fx-muted font-mono">
            <Phone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span>{target.phone}</span>
          </div>
        </div>

        {/* Formulario de edición del mensaje */}
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsapp-message-input" className="block text-xs font-bold uppercase tracking-wider text-fx-muted">
              Mensaje a enviar
            </label>
            <textarea
              id="whatsapp-message-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribí el mensaje para el socio..."
              required
              className="w-full p-3.5 rounded-xl bg-fx-base border border-fx-border focus:border-[#25D366] focus:outline-none text-sm text-fx-text resize-y min-h-[120px] transition-colors leading-relaxed"
            />
            <span className="text-[11px] text-fx-muted text-right">
              Podés agregar recordatorios, promociones o notas sobre horarios especiales.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-fx-border">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] px-5 rounded-xl bg-fx-base border border-fx-border text-fx-muted hover:text-fx-text font-semibold text-sm cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className="min-h-[46px] px-6 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-[#0B0B0C] font-extrabold text-sm inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Continuar a WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
