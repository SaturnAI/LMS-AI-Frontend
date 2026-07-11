"use client";

import { useEffect, useState } from "react";
import { getProfile, type Profile } from "./api";

export type AuthState =
  | { status: "loading" }
  | { status: "authed"; profile: Profile }
  | { status: "guest" };

/**
 * Resolves the current session once on mount via GET /api/get_profile.
 * `guest` covers both a real 401 and an unreachable backend.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getProfile().then((res) => {
      if (!active) return;
      setState(res.ok ? { status: "authed", profile: res.data } : { status: "guest" });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
