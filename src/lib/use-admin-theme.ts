"use client";

import { useCallback, useState } from "react";
import { ADMIN_THEME_COOKIE } from "@/lib/constants";

export type AdminTheme = "dark" | "light";

// Preferencia de tema del panel, guardada en una cookie de este navegador.
// El server la lee al renderizar /admin, así la página llega con el tema correcto (sin parpadeo).
export function useAdminTheme(initialTheme: AdminTheme) {
  const [theme, setTheme] = useState<AdminTheme>(initialTheme);
  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      document.cookie = `${ADMIN_THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);
  return { theme, toggleTheme };
}
