"use client";
import { useCallback, useEffect, useState } from "react";

export interface MeState {
  authenticated: boolean;
  memberNumber?: number;
  credits?: number;
  weekEndsAt?: string;
  votedThisWeek?: "Shelter" | "Food" | "Rent" | null;
}

export function useMe() {
  const [me, setMe] = useState<MeState | null>(null);
  const refresh = useCallback(async () => {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    setMe(await r.json());
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { me, refresh };
}
