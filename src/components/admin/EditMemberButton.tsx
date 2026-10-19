import React from "react";
import { UserPen } from "lucide-react";

// Botón compacto para abrir la ficha de edición desde cualquier listado de socios.
export function EditMemberButton({ fullName, onClick }: { fullName: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Editar o eliminar a ${fullName}`}
      title="Editar / eliminar socio"
      className="min-h-[48px] min-w-[48px] px-3 rounded-xl bg-fx-surface border border-fx-border hover:border-fx-orange text-fx-muted hover:text-fx-text inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
    >
      <UserPen className="w-4 h-4 text-fx-orange" />
      <span className="hidden sm:inline">Editar</span>
    </button>
  );
}
