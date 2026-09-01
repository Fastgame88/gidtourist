"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ensureTelegramSession,
  selectedPlaceId,
  setSelectedPlaceIdStorage,
  stage2Fetch,
  telegramStartParam,
  trackEvent,
  waitForTelegramWebApp,
  type Stage2Context,
  type Stage2User,
} from "./stage2-api";

type Coordinates = { lat: number; lng: number; source: "qr" | "gps" };

type TouristRuntimeValue = {
  context: Stage2Context | null;
  user: Stage2User | null;
  location: Coordinates | null;
  loading: boolean;
  apiOnline: boolean;
  selectedPlaceId: string;
  language: "uk" | "en" | "pl";
  setSelectedPlaceId: (id: string) => void;
  requestLocation: () => Promise<Coordinates | null>;
  setLanguage: (language: "uk" | "en" | "pl") => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const TouristRuntimeContext = createContext<TouristRuntimeValue | null>(null);

export function TouristRuntimeProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<Stage2Context | null>(null);
  const [user, setUser] = useState<Stage2User | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setSelected(selectedPlaceId());
    let cancelled = false;
    void (async () => {
      let resolvedContext: Stage2Context | null = null;
      await waitForTelegramWebApp(1500);
      const startParam = telegramStartParam();
      try {
        const ctx = await stage2Fetch<Stage2Context>(`/context/${encodeURIComponent(startParam)}`);
        resolvedContext = ctx;
        if (cancelled) return;
        setContext(ctx);
        setLocation({ lat: Number(ctx.place?.lat ?? ctx.region.lat), lng: Number(ctx.place?.lng ?? ctx.region.lng), source: "qr" });
        setApiOnline(true);
      } catch {
        if (!cancelled) setApiOnline(false);
      }

      const auth = await ensureTelegramSession();
      if (!cancelled && auth?.user) {
        setUser(auth.user);
        const trackKey = `gid-tourist-stage2-opened:${startParam}`;
        const alreadyTracked = typeof window !== "undefined" && window.sessionStorage.getItem(trackKey) === "1";
        if (!alreadyTracked) {
          void trackEvent("app_opened", { regionId: resolvedContext?.region.id, placeId: resolvedContext?.place?.id, payload: { start_param: startParam } });
          void trackEvent("qr_scanned", { regionId: resolvedContext?.region.id, placeId: resolvedContext?.place?.id, payload: { start_param: startParam, source: resolvedContext?.qr.source } });
          if (typeof window !== "undefined") window.sessionStorage.setItem(trackKey, "1");
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const setSelectedPlaceId = (id: string) => {
    setSelected(id);
    setSelectedPlaceIdStorage(id);
  };

  const requestLocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return null;
    return new Promise<Coordinates | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = { lat: position.coords.latitude, lng: position.coords.longitude, source: "gps" as const };
          setLocation(next);
          resolve(next);
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      );
    });
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.geolocation) return;
    let cancelled = false;
    const syncLocation = async () => {
      try {
        const permission = navigator.permissions?.query ? await navigator.permissions.query({ name: "geolocation" as PermissionName }) : null;
        if (cancelled || permission?.state === "denied") return;
        const point = await requestLocation();
        if (point && !cancelled) window.localStorage.setItem("gid-tourist-geolocation-approved", "1");
      } catch {
        if (!cancelled) {
          const point = await requestLocation();
          if (point) window.localStorage.setItem("gid-tourist-geolocation-approved", "1");
        }
      }
    };
    void syncLocation();
    return () => { cancelled = true; };
  }, []);

  const refreshProfile = async () => {
    try {
      const next = await stage2Fetch<Stage2User>("/me");
      setUser(next);
    } catch {
      // Public browsing remains available without a session.
    }
  };

  const setLanguage = async (language: "uk" | "en" | "pl") => {
    setUser((prev) => prev ? { ...prev, selected_language: language } : prev);
    try {
      const next = await stage2Fetch<Stage2User>("/me", { method: "PATCH", body: JSON.stringify({ selected_language: language }) });
      setUser(next);
    } catch {
      // Keep the local language choice if the API is temporarily unavailable.
    }
  };

  const value = useMemo<TouristRuntimeValue>(() => ({
    context,
    user,
    location,
    loading,
    apiOnline,
    selectedPlaceId: selected,
    language: (user?.selected_language === "en" || user?.selected_language === "pl") ? user.selected_language : "uk",
    setSelectedPlaceId,
    requestLocation,
    setLanguage,
    refreshProfile,
  }), [context, user, location, loading, apiOnline, selected]);

  return <TouristRuntimeContext.Provider value={value}>{children}</TouristRuntimeContext.Provider>;
}

export function useTouristRuntime() {
  const value = useContext(TouristRuntimeContext);
  if (!value) throw new Error("useTouristRuntime must be used inside TouristRuntimeProvider");
  return value;
}
