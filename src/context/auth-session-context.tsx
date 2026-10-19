"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthenticatedUser, AuthStatus, ClientSession, LoginOutcome } from "@/types/auth";
import { logoutUser } from "@/actions/auth.actions";
import {
  clearClientSession,
  loginWithOfflineFallback,
  restoreClientSession,
} from "@/lib/auth/login-flow";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  session: ClientSession | null;
  status: AuthStatus;
  login: (username: string, password: string) => Promise<LoginOutcome>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<ClientSession | null>;
}

const AuthSessionContext = createContext<AuthContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("LOADING");

  const syncSession = useCallback(async () => {
    try {
      const restored = await restoreClientSession();
      if (restored) {
        setSession(restored);
        setStatus("AUTHENTICATED");
        return restored;
      } else {
        setSession(null);
        setStatus("UNAUTHENTICATED");
        return null;
      }
    } catch {
      setSession(null);
      setStatus("UNAUTHENTICATED");
      return null;
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    restoreClientSession()
      .then((restored) => {
        if (ignore) return;
        if (restored) {
          setSession(restored);
          setStatus("AUTHENTICATED");
        } else {
          setSession(null);
          setStatus("UNAUTHENTICATED");
        }
      })
      .catch(() => {
        if (ignore) return;
        setSession(null);
        setStatus("UNAUTHENTICATED");
      });
    return () => {
      ignore = true;
    };
  }, []);

  const login = async (username: string, password: string): Promise<LoginOutcome> => {
    const outcome = await loginWithOfflineFallback(username, password);
    if (outcome.ok) {
      setSession(outcome.session);
      setStatus("AUTHENTICATED");
    }
    return outcome;
  };

  const logout = async (): Promise<void> => {
    await clearClientSession();
    try {
      await logoutUser();
    } catch {
      // offline logout
    }
    setSession(null);
    setStatus("UNAUTHENTICATED");
  };

  return (
    <AuthSessionContext.Provider
      value={{
        user: session?.user || null,
        session,
        status,
        login,
        logout,
        refreshSession: syncSession,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession debe ser usado dentro de un AuthSessionProvider");
  }
  return ctx;
}
