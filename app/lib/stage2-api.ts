"use client";

export type Stage2User = {
  id: string;
  telegram_id?: string | null;
  telegram_username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  selected_language?: string;
  role?: string;
  phone?: string | null;
};

export type Stage2Place = {
  id: string;
  region_id: string;
  category_slug: string;
  category_name?: string;
  subcategory?: string | null;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string | null;
  telegram?: string | null;
  website?: string | null;
  image_url?: string | null;
  rating: number;
  review_count: number;
  price_level?: number | null;
  work_hours?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  details?: Record<string, unknown>;
  translations?: Record<string, unknown>;
  tags?: string[];
  distance_m?: number | null;
  is_open_now?: boolean | null;
  status?: string;
  source?: "partner" | "google";
  is_partner?: boolean;
};

export type Stage2Category = {
  slug: string;
  name: string;
  name_en?: string | null;
  name_pl?: string | null;
  subcategories?: string[];
  filter_config?: Record<string, boolean>;
};

export type Stage2PlaceTypeTemplate = {
  id: string;
  category_slug: string;
  place_type: string;
  label: string;
  default_services: string[];
  fields?: Record<string, unknown>;
  sort_order?: number;
};

export type Stage2GeoSuggestion = { place_id: string; text: string; main_text: string; secondary_text: string };
export type Stage2GeoDetails = { place_id: string; formatted_address: string; lat: number; lng: number; city: string; region: string; street: string; house: string };

export type Stage2Context = {
  qr: { id: string; startParam: string; type: string; source: string };
  region: { id: string; name: string; nameEn?: string; namePl?: string; lat: number; lng: number; communityUrl?: string | null };
  place: Stage2Place | null;
};

type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: { start_param?: string; user?: { id?: number; first_name?: string; last_name?: string; username?: string; language_code?: string } };
};

type TelegramWindow = Window & { Telegram?: { WebApp?: TelegramWebApp } };

const TOKEN_KEY = "gid-tourist-stage2-session";
const SELECTED_PLACE_KEY = "gid-tourist-selected-place";

export function apiBase() {
  // Use the same-origin Next.js proxy so Telegram WebView/browser requests do not depend on CORS.
  return "/api/stage2";
}

export function sessionToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setSessionToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function selectedPlaceId() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(SELECTED_PLACE_KEY) ?? "";
}

export function setSelectedPlaceIdStorage(id: string) {
  if (typeof window === "undefined") return;
  if (id) window.sessionStorage.setItem(SELECTED_PLACE_KEY, id);
  else window.sessionStorage.removeItem(SELECTED_PLACE_KEY);
}

export async function stage2Fetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const authToken = token ?? sessionToken();
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
  const response = await fetch(`${apiBase()}${path.startsWith("/") ? path : `/${path}`}`, { ...init, headers, cache: "no-store" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `API ${response.status}`);
  }
  return response.json() as Promise<T>;
}


export async function waitForTelegramWebApp(timeoutMs = 2500) {
  if (typeof window === "undefined") return undefined;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const webApp = (window as TelegramWindow).Telegram?.WebApp;
    if (webApp) return webApp;
    await new Promise((resolve) => window.setTimeout(resolve, 75));
  }
  return (window as TelegramWindow).Telegram?.WebApp;
}

export function telegramStartParam() {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_DEFAULT_QR_START_PARAM || "hotel-girskyi-zatyshok";
  const webApp = (window as TelegramWindow).Telegram?.WebApp;
  const fromTelegram = webApp?.initDataUnsafe?.start_param;
  const params = new URLSearchParams(window.location.search);
  return fromTelegram || params.get("tgWebAppStartParam") || params.get("startapp") || params.get("start") || process.env.NEXT_PUBLIC_DEFAULT_QR_START_PARAM || "hotel-girskyi-zatyshok";
}

export async function ensureTelegramSession(): Promise<{ token: string; user: Stage2User } | null> {
  const existing = sessionToken();
  if (existing) {
    try {
      const user = await stage2Fetch<Stage2User>("/me", {}, existing);
      return { token: existing, user };
    } catch {
      setSessionToken("");
    }
  }

  if (typeof window === "undefined") return null;
  const webApp = await waitForTelegramWebApp();
  const initData = webApp?.initData ?? "";
  const fallbackUser = webApp?.initDataUnsafe?.user ?? {
    id: 900000001,
    first_name: "Тестовий",
    last_name: "Користувач",
    username: "gid_tourist_test",
    language_code: "uk",
  };
  try {
    const result = await stage2Fetch<{ token: string; user: Stage2User }>("/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData, devUser: fallbackUser }),
    }, "");
    setSessionToken(result.token);
    return result;
  } catch {
    return null;
  }
}

export async function trackEvent(eventType: string, data: { regionId?: string; placeId?: string; payload?: Record<string, unknown> } = {}) {
  if (!sessionToken()) return;
  try {
    await stage2Fetch("/events", {
      method: "POST",
      body: JSON.stringify({ event_type: eventType, region_id: data.regionId, place_id: data.placeId, payload: data.payload ?? {} }),
    });
  } catch {
    // Analytics must never block navigation.
  }
}

export async function adminStage2Fetch<T>(path: string, adminKey = "", init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (adminKey) headers.set("x-admin-key", adminKey);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const response = await fetch(`/api/stage2-admin/${cleanPath}`, { ...init, headers, cache: "no-store" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    try {
      const parsed = JSON.parse(text) as { message?: string };
      throw new Error(parsed.message || `API ${response.status}`);
    } catch (error) {
      if (error instanceof Error && error.message !== `Unexpected end of JSON input`) throw error;
      throw new Error(text || `API ${response.status}`);
    }
  }
  return response.json() as Promise<T>;
}
