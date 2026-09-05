"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Ambulance,
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  BadgeCheck,
  Banknote,
  BedDouble,
  Bell,
  Bike,
  CalendarDays,
  CalendarRange,
  CarFront,
  Check,
  ChevronRight,
  ClipboardCheck,
  CircleHelp,
  Clock3,
  Cross,
  ExternalLink,
  Flame,
  FlameKindling,
  Flower2,
  Footprints,
  Gift,
  Globe,
  Grid2X2,
  GripVertical,
  Gauge,
  Headset,
  Heart,
  Hotel,
  Info,
  Image as ImageIcon,
  LifeBuoy,
  Leaf,
  ListChecks,
  LocateFixed,
  LogOut,
  Map,
  MapPin,
  MessageCircle,
  MessageSquareMore,
  Minus,
  Moon,
  MoreVertical,
  MountainSnow,
  Navigation,
  PawPrint,
  Pencil,
  Phone,
  Pill,
  Plus,
  QrCode,
  ReceiptText,
  RefreshCcw,
  Route,
  Save,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Stethoscope,
  SunMedium,
  TentTree,
  Timer,
  Trash2,
  UserRound,
  UsersRound,
  Utensils,
  WalletCards,
  Wifi,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DEFAULT_EMERGENCY_SERVICES,
  readEmergencyServices,
  type EmergencyService,
} from "../../lib/emergency-services";
import type { RoleKey } from "../../lib/navigation";
import { RealMap } from "../real-map";
import { stage2Fetch, trackEvent, type Stage2Category, type Stage2Place, type Stage2Weather } from "../../lib/stage2-api";
import { useTouristRuntime } from "../../lib/tourist-runtime";
import { tr, translateKnownLabel, type TouristLanguage } from "../../lib/tourist-i18n";

type Navigate = (role: RoleKey, slug: string) => void;

type PhotoName =
  | "restaurant"
  | "coffee"
  | "store"
  | "pharmacy"
  | "hotel"
  | "pizza"
  | "burger"
  | "tub"
  | "sauna"
  | "pool"
  | "massage"
  | "excursion"
  | "jeep"
  | "quad"
  | "rafting"
  | "zipline"
  | "van";

const qrPattern = [
  "11111110101",
  "10000010110",
  "10111010101",
  "10111010010",
  "10111010111",
  "10000010010",
  "11111110101",
  "00010001110",
  "10101111001",
  "01110001110",
  "11001110101",
];

function Thumb({ name, className = "" }: { name: PhotoName; className?: string }) {
  return <span className={`gt-photo gt-photo--${name} ${className}`} aria-hidden="true" />;
}

function SearchBar({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (value: string) => void }) {
  return (
    <label className="gt-search">
      <Search size={19} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </label>
  );
}

function Chips({ items, selected, onSelect, displayLabel }: { items: string[]; selected?: string; onSelect?: (item: string) => void; displayLabel?: (item: string) => string }) {
  return (
    <div className="gt-chips">
      {items.map((item, index) => {
        const active = selected !== undefined ? selected === item : index === 0;
        return (
          <button type="button" className={active ? "is-active" : ""} key={item} onClick={onSelect ? () => onSelect(item) : undefined}>
            {displayLabel ? displayLabel(item) : item}
          </button>
        );
      })}
    </div>
  );
}

type PlaceFilterState = {
  openNow: boolean;
  minRating: number | "";
  priceLevel: number | "";
  kids: boolean;
  parking: boolean;
  partner: boolean;
  distance: number;
};

const DEFAULT_PLACE_FILTERS: PlaceFilterState = { openNow: false, minRating: "", priceLevel: "", kids: false, parking: false, partner: false, distance: 15000 };

function placeFilterCount(filters: PlaceFilterState, includeDistance = true) {
  return Number(filters.openNow) + Number(Boolean(filters.minRating)) + Number(Boolean(filters.priceLevel)) + Number(filters.kids) + Number(filters.parking) + Number(filters.partner) + Number(includeDistance && filters.distance !== 15000);
}

function appendPlaceFilters(params: URLSearchParams, filters: PlaceFilterState) {
  if (filters.openNow) params.set("open_now", "true");
  if (filters.minRating) params.set("min_rating", String(filters.minRating));
  if (filters.priceLevel) params.set("price_level", String(filters.priceLevel));
  if (filters.kids) params.set("kids", "true");
  if (filters.parking) params.set("parking", "true");
  if (filters.partner) params.set("partner", "true");
}

function PlaceFilters({ filters, onChange, language, showDistance = true }: { filters: PlaceFilterState; onChange: (next: PlaceFilterState) => void; language: TouristLanguage; showDistance?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const count = placeFilterCount(filters, showDistance);
  const toggle = (key: "openNow" | "kids" | "parking" | "partner") => onChange({ ...filters, [key]: !filters[key] });
  return (
    <div className={`gt-stage2-filters ${expanded ? "is-expanded" : ""}`}>
      <button type="button" className={`gt-stage2-filters__trigger ${count ? "has-active" : ""}`} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <SlidersHorizontal size={18} /><span>{tr(language, "Фільтри", "Filters", "Filtry")}</span>{count ? <b>{count}</b> : null}<ChevronRight size={17} />
      </button>
      {expanded ? <div className="gt-stage2-filters__panel">
        <button type="button" className={filters.openNow ? "is-active" : ""} onClick={() => toggle("openNow")}><Clock3 size={16} />{tr(language, "Відкрито зараз", "Open now", "Otwarte teraz")}</button>
        <button type="button" className={filters.minRating === 4 ? "is-active" : ""} onClick={() => onChange({ ...filters, minRating: filters.minRating === 4 ? "" : 4 })}><Star size={16} />4.0+</button>
        <button type="button" className={filters.kids ? "is-active" : ""} onClick={() => toggle("kids")}><UsersRound size={16} />{tr(language, "З дітьми", "Kid-friendly", "Dla dzieci")}</button>
        <button type="button" className={filters.parking ? "is-active" : ""} onClick={() => toggle("parking")}><CarFront size={16} />{tr(language, "Парковка", "Parking", "Parking")}</button>
        <button type="button" className={filters.partner ? "is-active" : ""} onClick={() => toggle("partner")}><BadgeCheck size={16} />{tr(language, "Партнер", "Partner", "Partner")}</button>
        <label className="gt-stage2-filters__price"><span>{tr(language, "Ціна", "Price", "Cena")}</span><select value={filters.priceLevel} onChange={(event) => onChange({ ...filters, priceLevel: event.target.value ? Number(event.target.value) : "" })}>
          <option value="">{tr(language, "Будь-яка", "Any", "Dowolna")}</option><option value="1">₴</option><option value="2">₴₴</option><option value="3">₴₴₴</option><option value="4">₴₴₴₴</option>
        </select></label>
        {showDistance ? <label className="gt-stage2-filters__price"><span>{tr(language, "Відстань", "Distance", "Odległość")}</span><select value={filters.distance} onChange={(event) => onChange({ ...filters, distance: Number(event.target.value) })}>
          <option value="500">500 m</option><option value="1000">1 km</option><option value="2000">2 km</option><option value="5000">5 km</option><option value="15000">15 km</option>
        </select></label> : null}
        {count ? <button type="button" className="gt-stage2-filters__reset" onClick={() => onChange(DEFAULT_PLACE_FILTERS)}>{tr(language, "Скинути", "Reset", "Wyczyść")}</button> : null}
      </div> : null}
    </div>
  );
}

function MapStrip({ real = false, places = [] }: { real?: boolean; places?: Stage2Place[] } = {}) {
  const { context, location, language } = useTouristRuntime();
  const address = location?.source === "gps" ? tr(language, "Ваше поточне місцезнаходження", "Your current location", "Twoja bieżąca lokalizacja") : (context?.place?.address || context?.region.name || tr(language, "Визначаємо точку входу…", "Detecting entry point…", "Ustalamy punkt wejścia…"));
  const center = location ?? (context ? { lat: Number(context.place?.lat ?? context.region.lat), lng: Number(context.place?.lng ?? context.region.lng), source: "qr" as const } : null);
  return (
    <div className={`gt-map-strip ${real ? "gt-map-strip--real" : ""}`.trim()}>
      {real && center ? <span className="gt-map-strip__map-layer"><RealMap center={center} places={places} radius={500} compact preferLeaflet className="gt-map-strip__live-map" /></span> : null}
      <div className="gt-map-strip__copy">
        <MapPin size={21} />
        <span>
          <small>{location?.source === "gps" ? tr(language, "Ваше місцезнаходження", "Your location", "Twoja lokalizacja") : tr(language, "Базова точка з QR", "QR base point", "Punkt bazowy QR")}</small>
          <strong>{address}</strong>
        </span>
      </div>
      {!real && <i className="gt-map-strip__road" />}
      {!real && <i className="gt-map-strip__river" />}
      {!real && <i className="gt-map-strip__dot" />}
    </div>
  );
}

function FoodMap() {
  const markers = [
    { left: "10%", top: "23%" },
    { left: "35%", top: "59%" },
    { left: "66%", top: "12%" },
    { left: "78%", top: "53%" },
    { left: "93%", top: "31%" },
  ];

  return (
    <div className="gt-food-map" aria-label="Карта рекомендованих закладів">
      <i className="gt-food-map__river" />
      <i className="gt-food-map__road gt-food-map__road--one" />
      <i className="gt-food-map__road gt-food-map__road--two" />
      {markers.map((marker, index) => (
        <span className="gt-food-map__marker" style={marker} key={index}><Utensils size={15} /></span>
      ))}
      <span className="gt-food-map__user" />
      <button type="button" aria-label="Показати моє місцезнаходження"><LocateFixed size={21} /></button>
    </div>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="gt-section-title">
      <h2>{title}</h2>
      {action ? <button type="button">{action}</button> : null}
    </div>
  );
}

function WalkingIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      className="gt-walking-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="13" cy="4" r="2" fill="currentColor" stroke="none" />
      <path
        d="m10.5 21 1.2-6.3-2.8-2.2-2.1 3.1M12 8l3.1 2.2 2.8-.7M11.7 14.7l3 2.2 2 4.1M10.5 8.2 8.9 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WeatherSunIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`gt-weather-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.25" fill="currentColor" opacity="0.18" />
      <circle cx="12" cy="12" r="3.55" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.2v3.1M12 18.7v3.1M21.8 12h-3.1M5.3 12H2.2M18.8 5.2l-2.2 2.2M7.4 16.6l-2.2 2.2M18.8 18.8l-2.2-2.2M7.4 7.4 5.2 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WeatherRainIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`gt-weather-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.1 17.1c-2.4 0-4.4-1.7-4.4-4 0-2.1 1.7-3.8 3.9-4 .7-2.9 3.2-4.8 6.3-4.8 3.5 0 6.4 2.7 6.4 6.1 1.4.2 2.5 1.5 2.5 2.9 0 1.7-1.4 3.1-3.2 3.1H8.1Z" fill="currentColor" opacity="0.18" />
      <path d="M8.1 16.4c-2 0-3.6-1.4-3.6-3.3 0-1.7 1.3-3 3.1-3.2.6-2.8 2.8-4.8 5.8-4.8 3.3 0 5.9 2.4 5.9 5.5 1.4 0 2.5 1.1 2.5 2.5 0 1.7-1.4 3.3-3.1 3.3H8.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 18.2 8.1 20M13 18.2 12.1 20M17 18.2 16.1 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function WeatherWindIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`gt-weather-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.1h10.7c1.7 0 2.9-1.1 2.9-2.5 0-1.3-1-2.3-2.4-2.3-1.2 0-2.2.8-2.4 1.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13.2h14.3c1.8 0 3.2 1.2 3.2 2.7 0 1.4-1.2 2.5-2.8 2.5-1.2 0-2.2-.7-2.6-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17.3h7.2c1.3 0 2.3.8 2.3 1.9 0 1-.9 1.8-2 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WeatherSunsetIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`gt-weather-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17.3h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.1 17.1a4.9 4.9 0 0 1 9.8 0" fill="currentColor" opacity="0.18" />
      <path d="M7.1 17.1a4.9 4.9 0 0 1 9.8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 6v3.2M5.4 10.2l2.3 1.3M18.6 10.2l-2.3 1.3M8.3 7.6 10 9.4M15.7 7.6 14 9.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function CurrentPlaceSticker() {
  return (
    <svg className="gt-current-place-sticker" viewBox="0 0 56 70" fill="none" aria-hidden="true">
      <ellipse cx="28" cy="61" rx="17" ry="5" fill="#CBEBDD" />
      <ellipse cx="28" cy="61" rx="11" ry="2.8" fill="#FFFFFF" opacity="0.95" />
      <path d="M28 6c-9.7 0-17 7.1-17 16.6 0 12.2 12.2 21.4 16 25.9.5.7 1.5.7 2 0 3.8-4.5 16-13.7 16-25.9C45 13.1 37.7 6 28 6Z" fill="url(#pinGradient)"/>
      <path d="M28 8.7c-8.1 0-14.2 5.8-14.2 13.8 0 10.3 10.4 18.3 14.2 22.7 3.8-4.4 14.2-12.4 14.2-22.7 0-8-6.1-13.8-14.2-13.8Z" fill="#20B364"/>
      <circle cx="28" cy="22.5" r="7.6" fill="#FFFFFF"/>
      <defs>
        <linearGradient id="pinGradient" x1="28" y1="6" x2="28" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#28C56E"/>
          <stop offset="1" stopColor="#0EA154"/>
        </linearGradient>
      </defs>
    </svg>
  );
}


function googlePlaceId(place?: Stage2Place | null) {
  if (!place) return "";
  const fromDetails = typeof place.details?.google_place_id === "string" ? place.details.google_place_id.trim() : "";
  if (fromDetails) return fromDetails;
  return place.id.startsWith("google_") ? place.id.slice("google_".length) : "";
}

function isGeoapifyPlace(place?: Stage2Place | null) {
  return Boolean(place && (place.source === "geoapify" || place.attributes?.geoapify === true || place.id.startsWith("geoapify_")));
}

function isExternalPlace(place?: Stage2Place | null) {
  return Boolean(place && (place.source === "google" || place.attributes?.google === true || place.id.startsWith("google_") || isGeoapifyPlace(place)));
}

function placeRatingLabel(place?: Stage2Place | null, withCount = true) {
  const rating = Number(place?.rating ?? 0);
  if (!(rating > 0)) return "—";
  return withCount ? `${rating.toFixed(1)} (${Number(place?.review_count ?? 0)})` : rating.toFixed(1);
}

function phoneForPlace(place?: Stage2Place | null) {
  if (!place) return "";
  const details = place.details ?? {};
  const contacts = details.contacts && typeof details.contacts === "object" ? details.contacts as Record<string, unknown> : {};
  const candidates = [place.phone, details.phone, details.phone_number, details.contact_phone, contacts.phone, contacts.phone_number];
  return candidates.map((value) => typeof value === "string" ? value.trim() : "").find(Boolean) || "";
}

function telHref(phone: string) {
  const clean = phone.trim().replace(/[^+\d]/g, "");
  return clean ? `tel:${clean}` : undefined;
}

function placeHoursLabel(place?: Stage2Place | null, language: TouristLanguage = "uk") {
  if (!place) return tr(language, "Графік уточнюється", "Hours to be confirmed", "Godziny do ustalenia");
  if (place.work_hours?.always_open === true) return tr(language, "Цілодобово", "Open 24/7", "Całodobowo");
  const daily = place.work_hours?.daily as { from?: string; to?: string } | undefined;
  if (daily?.from && daily?.to) return `${daily.from}–${daily.to}`;
  const directWeekdays = Array.isArray(place.work_hours?.weekdayDescriptions) ? place.work_hours.weekdayDescriptions.map(String) : [];
  const detailWeekdays = Array.isArray(place.details?.google_weekday_descriptions) ? place.details.google_weekday_descriptions.map(String) : [];
  return directWeekdays[0] || detailWeekdays[0] || tr(language, "Графік уточнюється", "Hours to be confirmed", "Godziny do ustalenia");
}

function googleReviewsUri(place?: Stage2Place | null) {
  if (!place) return "";
  const details = place.details ?? {};
  const attributes = place.attributes ?? {};
  const direct = [details.google_reviews_uri, attributes.google_reviews_uri]
    .map((value) => typeof value === "string" ? value.trim() : "")
    .find(Boolean);
  if (direct) return direct;
  const placeId = googlePlaceId(place);
  return placeId ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || place.address || `${place.lat},${place.lng}`)}&query_place_id=${encodeURIComponent(placeId)}` : "";
}

const GOOGLE_PLACE_DETAIL_CACHE_PREFIX = "gid-google-place-detail:";
const GOOGLE_PLACE_DETAIL_CACHE_TTL_MS = 10 * 60 * 1000;

function googlePlaceDetailCacheKey(placeId: string, lat?: number, lng?: number) {
  const origin = Number.isFinite(lat) && Number.isFinite(lng) ? `${Number(lat).toFixed(3)}:${Number(lng).toFixed(3)}` : "no-origin";
  return `${GOOGLE_PLACE_DETAIL_CACHE_PREFIX}${placeId}:${origin}`;
}

function readGooglePlaceDetailCache(key: string) {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null as Stage2Place | null;
    const parsed = JSON.parse(raw) as { value?: Stage2Place; at?: number };
    if (parsed.value && Date.now() - Number(parsed.at || 0) < GOOGLE_PLACE_DETAIL_CACHE_TTL_MS) return parsed.value;
    window.sessionStorage.removeItem(key);
  } catch { /* cache is optional */ }
  return null;
}

function writeGooglePlaceDetailCache(key: string, value: Stage2Place) {
  try { window.sessionStorage.setItem(key, JSON.stringify({ value, at: Date.now() })); } catch { /* cache is optional */ }
}

function photoDiagnosticMessage(raw: string, status?: number, contentType?: string) {
  const clean = raw.replace(/\s+/g, " ").trim();
  const lower = clean.toLowerCase();
  if (lower.includes("google_maps_server_api_key is not configured")) return "На сервері не налаштовано GOOGLE_MAPS_SERVER_API_KEY.";
  if (status === 403 || lower.includes("permission_denied") || lower.includes("forbidden") || lower.includes("api key")) return "Google заборонив доступ до фото (403). Перевірте API key, Places API (New), Billing та API restrictions.";
  if (status === 429 || lower.includes("resource_exhausted") || lower.includes("quota")) return "Вичерпано квоту Google Places / Place Photos (429). Перевірте Billing і ліміти API.";
  if (status === 404 || lower.includes("not found")) return "Google не знайшов це фото або ресурс фото вже недоступний (404).";
  if (lower.includes("has no photo") || lower.includes("no photo")) return "Для цього Place ID Google не повернув жодної фотографії.";
  if (lower.includes("invalid google photo name")) return "Google повернув некоректний ідентифікатор фотографії.";
  if (lower.includes("response is not an image")) return "Google відповів успішно, але повернув не зображення.";
  if (lower.includes("photo is empty")) return "Google повернув порожній файл фотографії.";
  if (status && status >= 500) return `Помилка сервера фото (HTTP ${status})${clean ? `: ${clean}` : "."}`;
  if (clean) return `Помилка фото${status ? ` (HTTP ${status})` : ""}: ${clean.slice(0, 220)}`;
  if (contentType && !contentType.toLowerCase().startsWith("image/")) return `Сервер повернув неправильний Content-Type: ${contentType}.`;
  return "Причину не вдалося визначити. Перевірте Google Places API та серверні логи.";
}

async function diagnoseRemoteImage(url: string) {
  try {
    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}diagnostic=1&_=${Date.now()}`, { cache: "no-store" });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      let message = body;
      try {
        const json = JSON.parse(body) as { message?: string | string[]; error?: string };
        if (Array.isArray(json.message)) message = json.message.join("; ");
        else if (typeof json.message === "string") message = json.message;
        else if (typeof json.error === "string") message = json.error;
      } catch { /* keep raw response text */ }
      return photoDiagnosticMessage(message, response.status, contentType);
    }
    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength) return "Сервер повернув порожній файл фотографії.";
    if (!contentType.toLowerCase().startsWith("image/")) return photoDiagnosticMessage("", response.status, contentType);
    return `Сервер отримав фото (${contentType}, ${Math.max(1, Math.round(buffer.byteLength / 1024))} КБ), але Telegram/Safari не зміг його відобразити. Перевірте формат зображення та заголовки відповіді.`;
  } catch (error) {
    return `Не вдалося звернутися до сервісу фото: ${error instanceof Error ? error.message : "мережева помилка"}.`;
  }
}

function RemotePlaceImage({ url, alt = "", className, google = false, googlePlaceId: googleId = "", eager = false, fallback, diagnostics = false }: { url?: string | null; alt?: string; className: string; google?: boolean; googlePlaceId?: string; eager?: boolean; fallback?: ReactNode; diagnostics?: boolean }) {
  const fallbackUrl = google && googleId ? `/api/stage2/google/place-photo?id=${encodeURIComponent(googleId)}` : "";
  // Prefer the fresh photo resource already returned with Nearby Search / Place Details.
  // If it fails or is absent, fall back to resolving a fresh resource by stable Place ID.
  const candidates = (google ? [url || "", fallbackUrl] : [url || ""])
    .filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [diagnostic, setDiagnostic] = useState("");
  const [diagnosing, setDiagnosing] = useState(false);
  useEffect(() => {
    setCandidateIndex(0);
    setDiagnostic("");
    setDiagnosing(false);
  }, [url, fallbackUrl]);
  const activeUrl = candidates[candidateIndex];

  const handleImageError = () => {
    const failedUrl = activeUrl;
    const nextIndex = candidateIndex + 1;
    setCandidateIndex(nextIndex);
    if (!diagnostics || !google || nextIndex < candidates.length || !failedUrl) return;
    setDiagnosing(true);
    void diagnoseRemoteImage(failedUrl).then((message) => setDiagnostic(message)).finally(() => setDiagnosing(false));
  };

  if (activeUrl) return <img src={activeUrl} alt={alt} className={className} loading={eager ? "eager" : "lazy"} decoding="async" onError={handleImageError} />;
  if (google) return (
    <span className={`${className} gt-real-place-image-placeholder ${diagnostics ? "gt-real-place-image-placeholder--diagnostic" : ""}`} aria-label="Фото Google недоступне">
      <ImageIcon size={25} />
      {diagnostics ? <span className="gt-photo-diagnostic"><strong>Фото не завантажилось</strong><small>{diagnosing ? "Перевіряємо причину…" : diagnostic || "Google не повернув зображення."}</small></span> : null}
    </span>
  );
  return <>{fallback ?? <span className={`${className} gt-real-place-image-placeholder`}><ImageIcon size={25} /></span>}</>;
}

function PlaceRow({
  photo = "hotel",
  imageUrl,
  title,
  subtitle,
  rating,
  distance,
  walk,
  walking = false,
  verified = false,
  tags = [],
  google = false,
  googlePlaceId: googleId = "",
  eager = false,
  onClick,
}: {
  photo?: PhotoName;
  imageUrl?: string | null;
  title: string;
  subtitle: string;
  rating: string;
  distance: string;
  walk: string;
  walking?: boolean;
  verified?: boolean;
  tags?: string[];
  google?: boolean;
  googlePlaceId?: string;
  eager?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="gt-place-row" onClick={onClick}>
      <RemotePlaceImage url={imageUrl} className="gt-photo gt-place-row__remote-photo" google={google} googlePlaceId={googleId} eager={eager} fallback={<Thumb name={photo} />} />
      <span className="gt-place-row__body">
        <span className="gt-place-row__title">
          <strong>{title}{verified ? <BadgeCheck className="gt-place-row__verified" size={15} /> : null}</strong>
          <b>{distance}</b>
        </span>
        <small>{subtitle}</small>
        <span className="gt-place-row__meta">
          <span>
            <Star size={14} fill="currentColor" /> {rating}
          </span>
          <span>{walking ? <WalkingIcon /> : "♙"} {walk}</span>
        </span>
        {tags.length ? (
          <span className="gt-place-row__tags">
            {tags.map((tag) => <i key={tag}>{tag}</i>)}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function CategoryHeader({
  icon: Icon,
  title,
  subtitle,
  tone,
  onMap,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone: string;
  onMap?: () => void;
}) {
  const { language } = useTouristRuntime();
  return (
    <div className="gt-category-head">
      <span className={`gt-category-head__icon gt-tone--${tone}`}>
        <Icon size={23} />
      </span>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button type="button" onClick={onMap}>
        <Map size={21} />
        <span>{tr(language, "На мапі", "On map", "Na mapie")}</span>
      </button>
    </div>
  );
}

function MockQr() {
  return (
    <div className="gt-qr-code" aria-label="QR-код">
      {qrPattern.flatMap((row, rowIndex) =>
        row.split("").map((cell, cellIndex) => (
          <i
            key={`${rowIndex}-${cellIndex}`}
            className={cell === "1" ? "is-filled" : ""}
          />
        )),
      )}
      <span><MapPin size={21} /></span>
    </div>
  );
}

const categories: Array<{
  title: string;
  note: string;
  slug: string;
  tone: string;
  icon: LucideIcon;
}> = [
  { title: "Де купити", note: "Продуктові, промтовари та сувеніри", slug: "shop", tone: "shop", icon: ShoppingBag },
  { title: "Де поїсти", note: "Кафе, ресторани та колиби", slug: "catalog", tone: "food", icon: Utensils },
  { title: "Де відпочити", note: "Чани, сауни, басейни та масаж", slug: "available", tone: "rest", icon: Flower2 },
  { title: "Розваги", note: "Активності, екстрим та враження", slug: "entertainment", tone: "fun", icon: Bike },
  { title: "Що поруч", note: "Усі місця поруч за вашою локацією", slug: "nearby", tone: "nearby", icon: MapPin },
  { title: "Трансфер", note: "Таксі, трансфери та оренда авто", slug: "transfer", tone: "transfer", icon: CarFront },
  { title: "Халепа?", note: "Допомога, аптеки, поліція, лікарі", slug: "emergency", tone: "emergency", icon: LifeBuoy },
];

function HomeScreen({ navigate }: { navigate: Navigate }) {
  const { context, language } = useTouristRuntime();
  const regionName = language === "en" ? (context?.region.nameEn || context?.region.name || "") : language === "pl" ? (context?.region.namePl || context?.region.name || "") : (context?.region.name || "");
  const contextPlace = context?.place;
  const scanLat = Number(contextPlace?.lat ?? context?.region.lat);
  const scanLng = Number(contextPlace?.lng ?? context?.region.lng);
  const [weather, setWeather] = useState<Stage2Weather | null>(null);
  const [weatherFailed, setWeatherFailed] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(scanLat) || !Number.isFinite(scanLng)) return;
    let cancelled = false;
    setWeatherFailed(false);
    const cacheKey = `gid-weather:${scanLat.toFixed(3)}:${scanLng.toFixed(3)}`;
    let hasFreshCache = false;
    try {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { value?: Stage2Weather; at?: number };
        if (parsed.value && Date.now() - Number(parsed.at || 0) < 10 * 60 * 1000) { hasFreshCache = true; setWeather(parsed.value); }
      }
    } catch { /* weather cache is optional */ }
    if (!hasFreshCache) setWeather(null);
    void stage2Fetch<Stage2Weather>(`/weather?lat=${encodeURIComponent(String(scanLat))}&lng=${encodeURIComponent(String(scanLng))}`).then((value) => {
      if (cancelled) return;
      setWeather(value);
      try { window.sessionStorage.setItem(cacheKey, JSON.stringify({ value, at: Date.now() })); } catch { /* optional cache */ }
    }).catch(() => { if (!cancelled) setWeatherFailed(true); });
    return () => { cancelled = true; };
  }, [scanLat, scanLng]);

  const weatherCode = Number(weather?.weather_code ?? -1);
  const weatherLabel = weatherCode < 0
    ? (language === "en" ? "Weather" : language === "pl" ? "Pogoda" : "Погода")
    : weatherCode <= 1
      ? (language === "en" ? "Clear" : language === "pl" ? "Słonecznie" : "Ясно")
      : weatherCode <= 3
        ? (language === "en" ? "Cloudy" : language === "pl" ? "Pochmurno" : "Хмарно")
        : weatherCode === 45 || weatherCode === 48
          ? (language === "en" ? "Fog" : language === "pl" ? "Mgła" : "Туман")
          : weatherCode >= 71 && weatherCode <= 77
            ? (language === "en" ? "Snow" : language === "pl" ? "Śnieg" : "Сніг")
            : weatherCode >= 95
              ? (language === "en" ? "Storm" : language === "pl" ? "Burza" : "Гроза")
              : (language === "en" ? "Rain" : language === "pl" ? "Deszcz" : "Дощ");
  const sunsetTime = weather?.sunset?.includes("T") ? weather.sunset.slice(11, 16) : (weather?.sunset || "—");
  const observedTime = weather?.observed_at?.includes("T") ? weather.observed_at.slice(11, 16) : "—";
  const localizedCategories = categories.map((item) => {
    const en: Record<string, [string, string]> = {
      shop: ["Shopping", "Groceries, goods and souvenirs"], catalog: ["Food", "Cafes, restaurants and kolybas"], available: ["Relax", "Tubs, saunas, pools and massage"],
      entertainment: ["Entertainment", "Activities and impressions"], nearby: ["Nearby", "Places around your location"], transfer: ["Transfer", "Taxi, transfers and car rental"], emergency: ["Emergency", "Help, pharmacies, police, doctors"],
    };
    const pl: Record<string, [string, string]> = {
      shop: ["Zakupy", "Produkty, towary i pamiątki"], catalog: ["Gdzie zjeść", "Kawiarnie, restauracje i karczmy"], available: ["Wypoczynek", "Banie, sauny, baseny i masaż"],
      entertainment: ["Rozrywka", "Aktywności i wrażenia"], nearby: ["W pobliżu", "Miejsca wokół twojej lokalizacji"], transfer: ["Transfer", "Taxi, transfery i wynajem auta"], emergency: ["Pomoc", "Apteki, policja, lekarze"],
    };
    const copy = language === "en" ? en[item.slug] : language === "pl" ? pl[item.slug] : undefined;
    return copy ? { ...item, title: copy[0], note: copy[1] } : item;
  });

  return (
    <div className="tourist-screen gt-screen gt-home-screen">
      <section className="gt-home-hero">
        <div className="gt-home-hero__copy">
          <p>{language === "en" ? "Welcome to" : language === "pl" ? "Witamy w" : "Вітаємо в"}</p>
          <h1>{regionName}</h1>
        </div>

        <div className="gt-weather gt-weather--reference">
          <div className="gt-weather-item gt-weather-item--sun">
            <WeatherSunIcon className="gt-weather-icon--sun" />
            <span><strong>{weather ? `${Math.round(weather.temperature_c)}°C` : "—"}</strong><small className="gt-weather-label gt-weather-label--clear">{weatherLabel}</small></span>
          </div>
          <div className="gt-weather-item gt-weather-item--rain">
            <WeatherRainIcon className="gt-weather-icon--rain" />
            <span><strong>{weather ? `${Math.round(weather.precipitation_probability)}%` : "—"}</strong><small className="gt-weather-label gt-weather-label--rain">{language === "en" ? "Rain chance" : language === "pl" ? "Szansa deszczu" : "Імовірність дощу"}</small></span>
          </div>
          <div className="gt-weather-item gt-weather-item--wind">
            <WeatherWindIcon className="gt-weather-icon--wind" />
            <span><strong>{weather ? `${Math.round(weather.wind_speed_kmh)} ${language === "uk" ? "км/год" : "km/h"}` : "—"}</strong><small className="gt-weather-label gt-weather-label--wind">{language === "en" ? "Wind" : language === "pl" ? "Wiatr" : "Вітер"}</small></span>
          </div>
          <div className="gt-weather-item gt-weather-item--sunset">
            <WeatherSunsetIcon className="gt-weather-icon--sunset" />
            <span><strong>{sunsetTime}</strong><small className="gt-weather-label gt-weather-label--sunset">{language === "en" ? "Sunset" : language === "pl" ? "Zachód" : "Захід сонця"}</small></span>
          </div>
          <small className="gt-weather-updated">{weather ? (language === "en" ? `Updated ${observedTime}` : language === "pl" ? `Aktualizacja ${observedTime}` : `Оновлено ${observedTime}`) : weatherFailed ? (language === "en" ? "Weather unavailable" : language === "pl" ? "Pogoda niedostępna" : "Погода недоступна") : (language === "en" ? "Loading weather…" : language === "pl" ? "Wczytywanie pogody…" : "Завантажуємо погоду…")}</small>
        </div>
      </section>

      <button
        type="button"
        className="gt-hotel-summary gt-hotel-summary--reference"
        onClick={() => navigate("tourist", "about")}
      >
        <span className="gt-current-place-pin" aria-hidden="true"><CurrentPlaceSticker /></span>
        <span className="gt-current-place-copy">
          <strong>{language === "en" ? "Your QR point" : language === "pl" ? "Punkt z QR" : "Ви зараз тут"}</strong>
          <small>{contextPlace?.name || tr(language, "Точка входу не визначена", "Entry point not set", "Nie ustawiono punktu wejścia")}</small>
          {contextPlace ? <b><Star size={14} fill="currentColor" /> {Number(contextPlace.rating || 0).toFixed(1)} · {contextPlace.review_count || 0} {language === "en" ? "reviews" : language === "pl" ? "opinii" : "відгуків"}</b> : <b>{language === "en" ? "Loading QR context…" : language === "pl" ? "Wczytywanie kontekstu QR…" : "Завантажуємо контекст QR…"}</b>}
        </span>
        {contextPlace?.image_url ? <img src={contextPlace.image_url} alt="" className="gt-photo gt-current-place-photo gt-current-place-photo--remote" /> : <span className="gt-current-place-photo gt-current-place-photo--empty" aria-hidden="true" />}
        <i>{language === "en" ? "Details" : language === "pl" ? "Szczegóły" : "Деталі"}</i>
      </button>

      <div className="gt-category-grid">
        {localizedCategories.map(({ title, note, slug, tone, icon: Icon }) => (
          <button
            type="button"
            className="gt-category-card"
            key={slug}
            onClick={() => { void trackEvent("category_opened", { regionId: context?.region.id, payload: { category: slug } }); navigate("tourist", slug); }}
          >
            <span className={`gt-category-card__icon gt-tone--${tone}`}><Icon size={23} /></span>
            <span>
              <strong>{title}</strong>
              <small>{note}</small>
            </span>
          </button>
        ))}
        <button
          type="button"
          className="gt-category-card gt-category-card--featured"
          onClick={() => navigate("tourist", "hot-offers")}
        >
          <span className="gt-category-card__icon"><FlameKindling size={24} /></span>
          <span>
            <strong>{language === "en" ? "Hot offer" : language === "pl" ? "Gorąca oferta" : "Гаряча пропозиція"}</strong>
            <small>{language === "en" ? "Current discounts" : language === "pl" ? "Aktualne zniżki" : "Актуальні знижки"}</small>
          </span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

type HotOffer = {
  id: string;
  photo: PhotoName;
  category: string;
  title: string;
  discount: string;
  description: string;
  validity: string;
  badge: string;
  badgeTone: "gold" | "green" | "red";
  detail: string;
};

const hotOffers: HotOffer[] = [
  {
    id: "hutsul-restaurant",
    photo: "restaurant",
    category: "РЕСТОРАН",
    title: "Гуцульська колиба",
    discount: "-20%",
    description: "-20% на основне меню",
    validity: "Сьогодні до 22:00",
    badge: "Топ ★",
    badgeTone: "gold",
    detail: "Скуштуйте традиційні карпатські страви зі знижкою 20% на основне меню. Пропозиція діє для гостей Gid Tourist при показі QR-коду.",
  },
  {
    id: "spa-karpaty",
    photo: "sauna",
    category: "СПА",
    title: "Spa Карпати",
    discount: "-25%",
    description: "-25% на SPA-послуги",
    validity: "Лише цього тижня",
    badge: "Рекомендація 👍",
    badgeTone: "green",
    detail: "Знижка 25% на вибрані SPA-процедури, сауну та релакс-зону. Попереднє бронювання рекомендоване.",
  },
  {
    id: "river-tub",
    photo: "tub",
    category: "ВІДПОЧИНОК",
    title: "Чан біля річки",
    discount: "2 за 1",
    description: "2 години за ціною 1",
    validity: "До 17 липня",
    badge: "Обмежено 🔥",
    badgeTone: "red",
    detail: "Забронюйте дві години відпочинку в чані та сплатіть лише за одну. Пропозиція діє у визначені часові слоти.",
  },
  {
    id: "bike-rental",
    photo: "jeep",
    category: "АКТИВНИЙ ВІДПОЧИНОК",
    title: "Прокат велосипедів",
    discount: "-15%",
    description: "-15% на оренду",
    validity: "Для гостей регіону",
    badge: "Рекомендація 👍",
    badgeTone: "green",
    detail: "Знижка 15% на оренду велосипедів для прогулянок гірськими маршрутами. Шолом входить у вартість.",
  },
  {
    id: "souvenirs",
    photo: "store",
    category: "СУВЕНІРИ",
    title: "Сувеніри Карпат",
    discount: "🎁",
    description: "Подарунок при покупці",
    validity: "Акція дня",
    badge: "Топ ★",
    badgeTone: "gold",
    detail: "Отримайте невеликий карпатський подарунок при покупці від 500 грн у партнерському магазині сувенірів.",
  },
];

const HOT_OFFER_STORAGE_KEY = "gid-tourist-selected-hot-offer";

function selectHotOffer(offer: HotOffer, navigate: Navigate) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HOT_OFFER_STORAGE_KEY, offer.id);
  }
  navigate("tourist", "hot-offer-detail");
}

function readSelectedHotOffer() {
  if (typeof window === "undefined") return hotOffers[0];
  const selectedId = window.localStorage.getItem(HOT_OFFER_STORAGE_KEY);
  return hotOffers.find((offer) => offer.id === selectedId) ?? hotOffers[0];
}


const hotOfferCategories: Array<{ label: string; icon: LucideIcon; tone: string }> = [
  { label: "Де поїсти", icon: Utensils, tone: "orange" },
  { label: "Де купити", icon: ShoppingBag, tone: "blue" },
  { label: "Де відпочити", icon: TentTree, tone: "green" },
  { label: "Розваги", icon: Sparkles, tone: "purple" },
  { label: "Трансфер", icon: CarFront, tone: "cyan" },
  { label: "Проживання", icon: BedDouble, tone: "yellow" },
];

function HotOfferMosaic({ primary }: { primary: PhotoName }) {
  const sets: Record<PhotoName, PhotoName[]> = {
    restaurant: ["restaurant", "coffee", "store", "burger", "tub", "pool", "jeep", "van"],
    coffee: ["coffee", "restaurant", "store", "pizza", "burger", "tub", "pool", "van"],
    store: ["store", "restaurant", "coffee", "pool", "jeep", "burger", "tub", "van"],
    pharmacy: ["pharmacy", "store", "restaurant", "pool", "jeep", "burger", "coffee", "van"],
    hotel: ["hotel", "restaurant", "coffee", "tub", "pool", "van", "burger", "store"],
    pizza: ["pizza", "coffee", "restaurant", "burger", "tub", "pool", "van", "store"],
    burger: ["burger", "restaurant", "coffee", "pizza", "tub", "pool", "van", "store"],
    tub: ["tub", "sauna", "pool", "restaurant", "burger", "jeep", "van", "hotel"],
    sauna: ["sauna", "tub", "pool", "restaurant", "coffee", "hotel", "van", "burger"],
    pool: ["pool", "tub", "sauna", "restaurant", "coffee", "van", "hotel", "burger"],
    massage: ["massage", "sauna", "pool", "tub", "restaurant", "coffee", "hotel", "van"],
    excursion: ["excursion", "jeep", "quad", "rafting", "zipline", "restaurant", "pool", "van"],
    jeep: ["jeep", "restaurant", "coffee", "tub", "pool", "van", "excursion", "hotel"],
    quad: ["quad", "jeep", "rafting", "zipline", "restaurant", "pool", "van", "hotel"],
    rafting: ["rafting", "excursion", "jeep", "quad", "zipline", "restaurant", "pool", "hotel"],
    zipline: ["zipline", "rafting", "excursion", "quad", "jeep", "restaurant", "pool", "hotel"],
    van: ["van", "hotel", "restaurant", "coffee", "store", "tub", "pool", "jeep"],
  };
  const tiles = sets[primary] ?? sets.restaurant;
  return (
    <span className="gt-hot-mosaic" aria-hidden="true">
      {tiles.map((name, index) => (
        <Thumb key={`${name}-${index}`} name={name} className={`gt-hot-mosaic__tile is-${index + 1}`} />
      ))}
    </span>
  );
}

function HotOffersScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen gt-hot-offers-screen gt-hot-offers-screen--reference">
      <section className="gt-hot-offers-reference-hero">
        <span className="gt-hot-offers-reference-hero__banner" aria-hidden="true" />
        <div className="gt-hot-offers-reference-hero__overlay" />
        <span className="gt-hot-offers-reference-hero__discount">до<br /><b>-30%</b></span>
        <div className="gt-hot-offers-reference-hero__copy">
          <h1>Вигідні пропозиції<br />для вашого відпочинку</h1>
          <p>Спеціальні знижки<br />від перевірених партнерів 💚</p>
        </div>
        <div className="gt-hot-offers-reference-hero__dots"><i className="is-active" /><i /></div>
      </section>

      <SearchBar placeholder="Пошук місць, маршрутів, активностей..." />

      <div className="gt-hot-offers-reference-categories">
        {hotOfferCategories.map(({ label, icon: Icon, tone }) => (
          <button type="button" key={label} className={`gt-hot-offers-reference-category is-${tone}`}>
            <span><Icon size={25} /></span>
            <small>{label}</small>
          </button>
        ))}
      </div>

      <MapStrip />

      <SectionTitle title="Пропозиції поруч" action="Переглянути всі" />

      <section className="gt-hot-offers-reference-list">
        {hotOffers.slice(0, 4).map((offer) => (
          <button type="button" className="gt-hot-offers-reference-row" key={offer.id} onClick={() => selectHotOffer(offer, navigate)}>
            <HotOfferMosaic primary={offer.photo} />
            <span className={`gt-hot-offers-reference-row__discount ${offer.discount === "2 за 1" ? "is-text-deal" : ""}`}>{offer.discount}</span>
            <span className="gt-hot-offers-reference-row__body">
              <small>{offer.category}</small>
              <strong>{offer.title}</strong>
              <span>{offer.description}</span>
              <i><Clock3 size={15} /> {offer.validity}</i>
            </span>
            <em className={`gt-hot-offers-reference-row__badge is-${offer.badgeTone}`}>{offer.badge}</em>
            <ChevronRight size={22} className="gt-hot-offers-reference-row__arrow" />
          </button>
        ))}
      </section>
    </div>
  );
}

function HotOfferDetailScreen({ navigate }: { navigate: Navigate }) {
  const [offer, setOffer] = useState<HotOffer>(hotOffers[0]);

  useEffect(() => {
    setOffer(readSelectedHotOffer());
  }, []);

  return (
    <div className="tourist-screen gt-screen gt-hot-offer-detail-screen">
      <section className="gt-hot-offer-detail-hero">
        <Thumb name={offer.photo} className="gt-hot-offer-detail-hero__photo" />
        <div className="gt-hot-offer-detail-hero__shade" />
        <span className="gt-hot-offer-detail-hero__discount">{offer.discount}</span>
        <div className="gt-hot-offer-detail-hero__copy">
          <small>{offer.category}</small>
          <h1>{offer.title}</h1>
          <p>{offer.description}</p>
        </div>
      </section>

      <main className="gt-hot-offer-detail-content">
        <div className="gt-hot-offer-detail-status">
          <span><Clock3 size={19} /><i><small>Термін дії</small><strong>{offer.validity}</strong></i></span>
          <span><BadgeCheck size={19} /><i><small>Статус</small><strong>Перевірено партнером</strong></i></span>
        </div>

        <section className="gt-hot-offer-detail-card">
          <h2>Про пропозицію</h2>
          <p>{offer.detail}</p>
          <div className="gt-hot-offer-detail-tags">
            <span><Sparkles size={15} /> Ексклюзивно</span>
            <span><MapPin size={15} /> Поруч</span>
            <span><ShieldCheck size={15} /> Перевірено</span>
          </div>
        </section>

        <section className="gt-hot-offer-detail-card gt-hot-offer-detail-card--partner">
          <Thumb name={offer.photo} className="gt-hot-offer-detail-partner-photo" />
          <div><small>Партнер Gid Tourist</small><strong>{offer.title}</strong><span><Star size={14} fill="currentColor" /> 4.9 · 126 відгуків</span></div>
          <ChevronRight size={20} />
        </section>

        <div className="gt-hot-offer-detail-actions">
          <button type="button" className="is-primary" onClick={() => navigate("tourist", "qr")}><QrCode size={20} /> Скористатися пропозицією</button>
          <button type="button"><MapPin size={19} /> Побудувати маршрут</button>
        </div>
      </main>
    </div>
  );
}

function AboutScreen({ navigate }: { navigate: Navigate }) {
  const { context, language } = useTouristRuntime();
  const place = context?.place;
  const details = place?.details ?? {};
  const checkIn = typeof details.check_in === "string" ? details.check_in : "—";
  const checkOut = typeof details.check_out === "string" ? details.check_out : "—";
  const placeType = place?.subcategory || place?.category_name || tr(language, "заклад", "place", "miejsce");

  return (
    <div className="tourist-screen gt-screen gt-about-screen">
      <section className="gt-about-hero" style={place?.image_url ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.56)),url(${place.image_url})` } : undefined}>
        <div className="gt-about-logo">
          <MountainSnow size={43} />
          <strong>{place?.name || "Gid Tourist"}</strong>
          <small>{placeType}</small>
        </div>
        <div className="gt-about-hero__copy">
          <h1>{place?.name || tr(language, "Інформація про заклад", "Place information", "Informacje o miejscu")}</h1>
          <p><MapPin size={18} /> {place?.address || tr(language, "Адреса завантажується", "Loading address", "Ładowanie adresu")}</p>
        </div>
        <div className="gt-checkin-card gt-checkin-card--hero">
          <p>
            <span><Clock3 size={20} /><i>{tr(language, "Заїзд", "Check-in", "Zameldowanie")}<b>{checkIn}</b></i></span>
            <span><Clock3 size={20} /><i>{tr(language, "Виїзд", "Check-out", "Wymeldowanie")}<b>{checkOut}</b></i></span>
          </p>
        </div>
      </section>
      <div className="gt-about-content">
        <button type="button" className="gt-service-card gt-service-card--wide" onClick={() => navigate("tourist", "hotel-services")}>
          <span><Hotel size={25} /></span>
          <div><strong>{tr(language, "Послуги закладу", "Place services", "Usługi obiektu")}</strong><small>{tr(language, "Доступні зручності та сервіси для гостей", "Available amenities and guest services", "Dostępne udogodnienia i usługi dla gości")}</small></div>
          <i>{tr(language, "Деталі", "Details", "Szczegóły")} <ChevronRight size={18} /></i>
        </button>
        <div className="gt-service-grid">
          <button type="button" className="gt-service-card" onClick={() => navigate("tourist", "about-reception")}>
            <span><Hotel size={24} /></span><div><strong>{tr(language, "Рецепція", "Reception", "Recepcja")}</strong><small>{tr(language, "Зв’язок та інформація для гостей", "Guest contact and information", "Kontakt i informacje dla gości")}</small></div><ChevronRight size={19} />
          </button>
          <button type="button" className="gt-service-card" onClick={() => navigate("tourist", "about-wifi")}>
            <span><Wifi size={24} /></span><div><strong>Wi‑Fi</strong><small>{tr(language, "Дані мережі закладу", "Place network details", "Dane sieci obiektu")}</small></div><ChevronRight size={19} />
          </button>
        </div>
        <button type="button" className="gt-service-card gt-service-card--wide" onClick={() => navigate("tourist", "about-rules")}>
          <span><ReceiptText size={25} /></span>
          <div><strong>{tr(language, "Правила проживання", "House rules", "Zasady pobytu")}</strong><small>{tr(language, "Важлива інформація для комфортного перебування", "Important information for a comfortable stay", "Ważne informacje dla komfortowego pobytu")}</small></div>
          <ChevronRight size={19} />
        </button>
        <button type="button" className="gt-service-card gt-service-card--wide" onClick={() => navigate("tourist", "about-contacts")}>
          <span><Phone size={25} /></span><div><strong>{tr(language, "Оперативні контакти", "Contacts", "Kontakty")}</strong><small>{tr(language, "Контакти закладу та способи зв’язку", "Place contacts and ways to get in touch", "Kontakty obiektu i sposoby komunikacji")}</small></div><ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}

type AboutInfoKind = "reception" | "wifi" | "rules" | "contacts";

function AboutInfoScreen({ navigate, kind }: { navigate: Navigate; kind: AboutInfoKind }) {
  const { context, language } = useTouristRuntime();
  const place = context?.place;
  const details = place?.details ?? {};
  const ruleItems = Array.isArray(details.rule_items) ? details.rule_items as Array<Record<string, unknown>> : [];
  const legacyRules = Array.isArray(details.rules) ? details.rules.map((item) => String(item)) : [];
  const configs: Record<AboutInfoKind, { title: string; icon: LucideIcon }> = {
    reception: { title: tr(language, "Рецепція", "Reception", "Recepcja"), icon: Hotel },
    wifi: { title: "Wi‑Fi", icon: Wifi },
    rules: { title: tr(language, "Правила проживання", "House rules", "Zasady pobytu"), icon: ReceiptText },
    contacts: { title: tr(language, "Оперативні контакти", "Contacts", "Kontakty"), icon: Phone },
  };
  const config = configs[kind];
  const Icon = config.icon;
  return (
    <div className="tourist-screen gt-screen gt-about-info-screen">
      <main className="gt-content">
        <button type="button" className="gt-back-button" onClick={() => navigate("tourist", "about")}><ArrowLeft size={20} /> {tr(language, "Назад", "Back", "Wstecz")}</button>
        <section className="gt-about-info-head"><span><Icon size={26} /></span><div><h1>{config.title}</h1><p>{place?.name || tr(language, "Ваш заклад", "Your place", "Twój obiekt")}</p></div></section>
        {kind === "reception" ? <div className="gt-about-info-list">
          <div><strong>{tr(language, "Телефон рецепції", "Reception phone", "Telefon recepcji")}</strong><small>{place?.phone || tr(language, "Не вказано", "Not provided", "Nie podano")}</small>{place?.phone ? <a href={`tel:${place.phone}`}>{tr(language, "Подзвонити", "Call", "Zadzwoń")}</a> : null}</div>
          <div><strong>{tr(language, "Графік", "Hours", "Godziny")}</strong><small>{typeof details.reception_hours === "string" ? details.reception_hours : tr(language, "Уточнюйте у закладі", "Ask the place", "Zapytaj w obiekcie")}</small></div>
        </div> : null}
        {kind === "wifi" ? <div className="gt-about-info-list">
          <div><strong>{tr(language, "Назва мережі", "Network name", "Nazwa sieci")}</strong><small>{typeof details.wifi_ssid === "string" && details.wifi_ssid ? details.wifi_ssid : tr(language, "Wi‑Fi не вказано", "Wi‑Fi not provided", "Nie podano Wi‑Fi")}</small></div>
          <div><strong>{tr(language, "Пароль", "Password", "Hasło")}</strong><small>{typeof details.wifi_password === "string" && details.wifi_password ? details.wifi_password : tr(language, "Не вказано", "Not provided", "Nie podano")}</small></div>
        </div> : null}
        {kind === "rules" ? <div className="gt-about-info-list">
          {ruleItems.map((rule, index) => <div key={`${String(rule.title || rule.text || "rule")}-${index}`}><strong>{String(rule.title || `${tr(language, "Правило", "Rule", "Zasada")} ${index + 1}`)}</strong><small>{String(rule.text || rule.description || "")}</small></div>)}
          {!ruleItems.length && legacyRules.map((rule, index) => <div key={`${rule}-${index}`}><strong>{tr(language, "Правило", "Rule", "Zasada")} {index + 1}</strong><small>{rule}</small></div>)}
          {!ruleItems.length && !legacyRules.length ? <div><strong>{tr(language, "Правила", "Rules", "Zasady")}</strong><small>{tr(language, "Заклад ще не додав правила проживання.", "The place has not added house rules yet.", "Obiekt nie dodał jeszcze zasad pobytu.")}</small></div> : null}
        </div> : null}
        {kind === "contacts" ? <div className="gt-about-info-list">
          <div><strong>{tr(language, "Телефон", "Phone", "Telefon")}</strong><small>{place?.phone || tr(language, "Не вказано", "Not provided", "Nie podano")}</small>{place?.phone ? <a href={`tel:${place.phone}`}>{tr(language, "Подзвонити", "Call", "Zadzwoń")}</a> : null}</div>
          {place?.telegram ? <div><strong>Telegram</strong><small>{place.telegram}</small><a href={place.telegram} target="_blank" rel="noreferrer">{tr(language, "Відкрити", "Open", "Otwórz")}</a></div> : null}
          {place?.website ? <div><strong>{tr(language, "Сайт", "Website", "Strona")}</strong><small>{place.website}</small><a href={place.website} target="_blank" rel="noreferrer">{tr(language, "Відкрити", "Open", "Otwórz")}</a></div> : null}
          {typeof details.email === "string" && details.email ? <div><strong>Email</strong><small>{details.email}</small><a href={`mailto:${details.email}`}>{tr(language, "Написати", "Write", "Napisz")}</a></div> : null}
        </div> : null}
      </main>
    </div>
  );
}

type HotelServiceKey = "pool" | "tub" | "sauna" | "bikes" | "massage";

type HotelService = {
  key: HotelServiceKey;
  title: string;
  subtitle: string;
  description: string;
  photo: string;
  galleryCount: string;
  price: string;
  priceNote: string;
  facts: Array<{ icon: LucideIcon; label: string }>;
};

const hotelServices: HotelService[] = [
  {
    key: "pool",
    title: "Відкритий басейн",
    subtitle: "Підігрітий, з видом на гори",
    description: "Теплий критий басейн із панорамним видом на Карпати. Комфортна температура води та спокійна зона відпочинку для гостей готелю.",
    photo: "/images/service-pool.webp",
    galleryCount: "1/5",
    price: "500 грн / 2 год",
    priceNote: "Для гостей готелю — 350 грн",
    facts: [
      { icon: UsersRound, label: "До 12 осіб" },
      { icon: Clock3, label: "Щодня" },
      { icon: MountainSnow, label: "Вид на гори" },
      { icon: ShieldCheck, label: "Рушники" },
    ],
  },
  {
    key: "tub",
    title: "Чан на дровах",
    subtitle: "Релакс у гарячій воді",
    description: "Гарячий чан просто неба з неймовірним видом на гори. Ідеальний відпочинок у будь-яку пору року.",
    photo: "/images/service-tub.webp",
    galleryCount: "1/5",
    price: "2 000 грн / 2 год",
    priceNote: "Кожна наступна година — 800 грн",
    facts: [
      { icon: UsersRound, label: "До 6 осіб" },
      { icon: FlameKindling, label: "На дровах" },
      { icon: MountainSnow, label: "Вид на гори" },
      { icon: ShieldCheck, label: "Рушники" },
    ],
  },
  {
    key: "sauna",
    title: "Сауна",
    subtitle: "Тепло та здоров’я",
    description: "Фінська сауна для глибокого розслаблення тіла та відновлення сил. Тепло, комфорт і аромат дерева.",
    photo: "/images/service-sauna.webp",
    galleryCount: "1/4",
    price: "1 500 грн / 2 год",
    priceNote: "Кожна наступна година — 800 грн",
    facts: [
      { icon: UsersRound, label: "До 8 осіб" },
      { icon: Flame, label: "Фінська парна" },
      { icon: Leaf, label: "Аромат дерева" },
      { icon: Gift, label: "Чай включено" },
    ],
  },
  {
    key: "bikes",
    title: "Прокат велосипедів",
    subtitle: "Досліджуйте Карпати",
    description: "Досліджуйте Карпати активно та комфортно. Якісні велосипеди для дорослих і дітей.",
    photo: "/images/service-bikes.webp",
    galleryCount: "1/6",
    price: "від 300 грн / 1 год",
    priceNote: "День (до 12 год) — 1 000 грн",
    facts: [
      { icon: Bike, label: "Гірські велосипеди" },
      { icon: ShieldCheck, label: "Шолом включено" },
      { icon: Bike, label: "Дитячі велосипеди" },
      { icon: MapPin, label: "Маршрути на вибір" },
    ],
  },
  {
    key: "massage",
    title: "Масаж",
    subtitle: "Професійний релакс",
    description: "Професійний масаж для тіла і душі. Знімає втому, напруження та дарує відчуття легкості.",
    photo: "/images/rest-massage.webp",
    galleryCount: "1/4",
    price: "800 грн / 60 хв",
    priceNote: "Тривалість: від 30 до 90 хв",
    facts: [
      { icon: UserRound, label: "Професійний масажист" },
      { icon: Leaf, label: "Арома олії" },
      { icon: Sparkles, label: "Релакс та відновлення" },
      { icon: UsersRound, label: "Індивідуальний підхід" },
    ],
  },
];

function HotelServiceDetail({ service, onBack }: { service: HotelService; onBack: () => void }) {
  return (
    <main className="tourist-screen gt-screen gt-hotel-service-detail">
      <header className="gt-hotel-services-header">
        <button type="button" aria-label="Назад до послуг" onClick={onBack}><ArrowLeft size={27} /></button>
        <h1>Послуги закладу</h1>
        <div className="gt-hotel-service-actions">
          <button type="button" aria-label="Поділитися"><Share2 size={23} /></button>
          <button type="button" aria-label="Додати в улюблені"><Heart size={24} /></button>
        </div>
      </header>

      <section className="gt-hotel-service-photo" style={{ backgroundImage: `url(${service.photo})` }}>
        <span>{service.galleryCount}</span>
      </section>

      <section className="gt-hotel-service-copy">
        <h2>{service.title}</h2>
        <p>{service.description}</p>
      </section>

      <div className="gt-hotel-service-facts">
        {service.facts.map(({ icon: Icon, label }) => (
          <div key={label}><Icon size={25} /><span>{label}</span></div>
        ))}
      </div>

      <section className="gt-hotel-service-price">
        <strong>{service.price}</strong>
        <small>{service.priceNote}</small>
      </section>

      <a className="gt-hotel-service-call" href="tel:+380673421868"><Phone size={19} /> Зателефонувати</a>
      <footer className="gt-hotel-service-provider"><MountainSnow size={23} /> Послуга від: Гірський затишок</footer>
    </main>
  );
}

function HotelServicesScreen({ navigate }: { navigate: Navigate }) {
  const [selectedService, setSelectedService] = useState<HotelServiceKey | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const featureTouchStart = useRef<number | null>(null);
  const selected = hotelServices.find((service) => service.key === selectedService);

  if (selected) {
    return <HotelServiceDetail service={selected} onBack={() => setSelectedService(null)} />;
  }

  const featured = hotelServices[activeFeature];
  const visibleServices = hotelServices.slice(1);

  const changeFeature = (direction: 1 | -1) => {
    setActiveFeature((current) => (current + direction + hotelServices.length) % hotelServices.length);
  };

  return (
    <div className="tourist-screen gt-screen gt-hotel-services-screen">
      <main className="gt-hotel-services">
        <header className="gt-hotel-services-header">
          <button type="button" aria-label="Назад до закладу" onClick={() => navigate("tourist", "about")}><ArrowLeft size={27} /></button>
          <h1>Послуги закладу</h1>
          <span aria-hidden="true" />
        </header>

        <section
          className="gt-hotel-services-feature"
          style={{ backgroundImage: `url(${featured.photo})` }}
          onTouchStart={(event) => { featureTouchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            const startX = featureTouchStart.current;
            const endX = event.changedTouches[0]?.clientX;
            featureTouchStart.current = null;
            if (startX === null || endX === undefined || Math.abs(startX - endX) < 35) return;
            changeFeature(startX > endX ? 1 : -1);
          }}
        >
          <span className="gt-hotel-services-feature__copy">
            <strong>{featured.title}</strong>
            <small>{featured.subtitle}</small>
            <button type="button" onClick={() => setSelectedService(featured.key)}>Детальніше <ChevronRight size={21} /></button>
          </span>
          <span className="gt-hotel-services-dots" aria-label="Перемикання послуг">
            {hotelServices.map((service, index) => (
              <button
                type="button"
                key={service.key}
                className={index === activeFeature ? "is-active" : ""}
                aria-label={`Показати: ${service.title}`}
                onClick={() => setActiveFeature(index)}
              />
            ))}
          </span>
        </section>

        <h2 className="gt-hotel-services-title">Наші послуги</h2>
        <div className="gt-hotel-services-grid">
          {visibleServices.map((service) => (
            <button
              type="button"
              key={service.key}
              className="gt-hotel-services-card"
              style={{ backgroundImage: `url(${service.photo})` }}
              onClick={() => setSelectedService(service.key)}
            >
              <span><strong>{service.title}</strong><small>{service.subtitle}</small></span>
              <i><ChevronRight size={23} /></i>
            </button>
          ))}
        </div>
        <button type="button" className="gt-hotel-services-all">Показати всі послуги <ChevronRight size={21} /></button>
      </main>
    </div>
  );
}


function placePhotoFallback(place: Stage2Place): PhotoName {
  const value = `${place.category_slug} ${place.subcategory ?? ""} ${place.name}`.toLocaleLowerCase("uk");
  if (value.includes("аптек")) return "pharmacy";
  if (value.includes("кава") || value.includes("кавʼ")) return "coffee";
  if (value.includes("піц")) return "pizza";
  if (value.includes("магаз") || place.category_slug === "shop") return "store";
  if (value.includes("чан")) return "tub";
  if (value.includes("саун")) return "sauna";
  if (value.includes("басейн")) return "pool";
  if (value.includes("масаж")) return "massage";
  if (value.includes("квадро")) return "quad";
  if (value.includes("рафт")) return "rafting";
  if (value.includes("зіп")) return "zipline";
  if (value.includes("джип")) return "jeep";
  if (place.category_slug === "transfer") return "van";
  if (place.category_slug === "food") return "restaurant";
  return "hotel";
}

function visiblePlaceTags(place: Stage2Place) {
  if (isExternalPlace(place)) {
    return [place.subcategory || place.category_name || ""].filter(Boolean).slice(0, 1);
  }
  return (place.tags ?? []).slice(0, 4);
}

function distanceLabel(distance?: number | null, language: TouristLanguage = "uk") {
  if (distance == null) return "—";
  return distance < 1000 ? `${Math.max(1, Math.round(distance))} ${tr(language, "м", "m", "m")}` : `${(distance / 1000).toFixed(1).replace(".", ",")} ${tr(language, "км", "km", "km")}`;
}

function walkLabel(distance?: number | null, durationSeconds?: number | null, language: TouristLanguage = "uk") {
  if (durationSeconds != null && durationSeconds > 0) return `${Math.max(1, Math.round(durationSeconds / 60))} ${tr(language, "хв", "min", "min")}`;
  if (distance == null) return "—";
  return `${Math.max(1, Math.round(distance / 80))} ${tr(language, "хв", "min", "min")}`;
}

type DynamicCategoryConfig = {
  category: "food" | "shop" | "rest" | "entertainment";
  className: string;
  icon: LucideIcon;
  title: string;
  titleEn: string;
  titlePl: string;
  subtitle: string;
  subtitleEn: string;
  subtitlePl: string;
  tone: string;
  placeholder: string;
  placeholderEn: string;
  placeholderPl: string;
  sectionTitle: string;
  sectionTitleEn: string;
  sectionTitlePl: string;
  fallbackChips: string[];
};

function DynamicCategoryScreen({ navigate, config }: { navigate: Navigate; config: DynamicCategoryConfig }) {
  const runtime = useTouristRuntime();
  const [query, setQuery] = useState("");
  const [selectedChip, setSelectedChip] = useState("Усі");
  const [places, setPlaces] = useState<Stage2Place[]>([]);
  const [category, setCategory] = useState<Stage2Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PlaceFilterState>(DEFAULT_PLACE_FILTERS);

  useEffect(() => {
    let cancelled = false;
    void stage2Fetch<Stage2Category[]>("/categories").then((items) => {
      if (!cancelled) setCategory(items.find((item) => item.slug === config.category) ?? null);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [config.category]);

  useEffect(() => {
    if (!runtime.context) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const point = runtime.location ?? { lat: Number(runtime.context!.place?.lat ?? runtime.context!.region.lat), lng: Number(runtime.context!.place?.lng ?? runtime.context!.region.lng) };
      const params = new URLSearchParams({ region_id: runtime.context!.region.id, category: config.category });
      if (query.trim()) params.set("q", query.trim());
      if (selectedChip !== "Усі") params.set("subcategory", selectedChip);
      appendPlaceFilters(params, filters);
      params.set("lat", String(point.lat));
      params.set("lng", String(point.lng));
      params.set("radius", String(filters.distance));
      params.set("include_google", "true");
      params.set("google_section", config.category);
      params.set("google_limit", "20");
      params.set("include_routes", "false");
      const filterKey = `${Number(filters.openNow)}:${filters.minRating || 0}:${filters.priceLevel || 0}:${Number(filters.kids)}:${Number(filters.parking)}:${Number(filters.partner)}:${filters.distance}`;
      const cacheKey = `gid-category-cache:${config.category}:${point.lat.toFixed(3)}:${point.lng.toFixed(3)}:${selectedChip}:${query.trim().toLocaleLowerCase("uk")}:${filterKey}`;
      let hasCachedPlaces = false;
      try {
        const cached = window.sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as Stage2Place[];
          if (Array.isArray(parsed) && parsed.length) { hasCachedPlaces = true; setPlaces(parsed); setLoading(false); }
        }
      } catch { /* cache is optional */ }
      if (!hasCachedPlaces) setLoading(true);

      void stage2Fetch<Stage2Place[]>(`/places?${params}`).then((items) => {
        if (cancelled) return;
        setPlaces(items);
        setLoading(false);
        try { window.sessionStorage.setItem(cacheKey, JSON.stringify(items)); } catch { /* cache is optional */ }
      }).catch(() => { if (!cancelled) setLoading(false); });

      if (query.trim()) void trackEvent("search_used", { regionId: runtime.context?.region.id, payload: { q: query.trim(), category: config.category } });
    }, query.trim() ? 180 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [runtime.context, runtime.location, query, selectedChip, config.category, filters]);

  const chips = ["Усі", ...((category?.subcategories?.length ? category.subcategories : config.fallbackChips).filter((item) => item !== "Усі"))];
  const title = runtime.language === "en" ? config.titleEn : runtime.language === "pl" ? config.titlePl : config.title;
  const subtitle = runtime.language === "en" ? config.subtitleEn : runtime.language === "pl" ? config.subtitlePl : config.subtitle;
  const placeholder = runtime.language === "en" ? config.placeholderEn : runtime.language === "pl" ? config.placeholderPl : config.placeholder;
  const sectionTitle = runtime.language === "en" ? config.sectionTitleEn : runtime.language === "pl" ? config.sectionTitlePl : config.sectionTitle;

  const openPlace = (place: Stage2Place) => {
    runtime.setSelectedPlace(place);
    void trackEvent("place_viewed", { regionId: runtime.context?.region.id, placeId: place.id, payload: { source: config.category } });
    navigate("tourist", "place");
  };

  return (
    <div className={`tourist-screen gt-screen gt-reference-list-screen ${config.className}`}>
      <main className="gt-content">
        <CategoryHeader icon={config.icon} title={title} subtitle={subtitle} tone={config.tone} onMap={() => navigate("tourist", "nearby")} />
        <SearchBar placeholder={placeholder} value={query} onChange={setQuery} />
        <Chips items={chips} selected={selectedChip} onSelect={setSelectedChip} displayLabel={(item) => translateKnownLabel(runtime.language, item)} />
        <PlaceFilters filters={filters} onChange={setFilters} language={runtime.language} />
        <MapStrip real places={places} />
        <SectionTitle title={sectionTitle} action={`${places.length}`} />
        <div className="gt-place-list">
          {places.map((place, index) => (
            <PlaceRow
              key={place.id}
              photo={placePhotoFallback(place)}
              imageUrl={place.image_url}
              google={place.source === "google" || place.attributes?.google === true}
              googlePlaceId={googlePlaceId(place)}
              eager={index < 4}
              title={place.name}
              subtitle={place.subcategory ? translateKnownLabel(runtime.language, place.subcategory) : (place.category_name || tr(runtime.language, "Локація", "Place", "Miejsce"))}
              rating={placeRatingLabel(place)}
              distance={distanceLabel(place.distance_m, runtime.language)}
              walk={walkLabel(place.distance_m, place.walking_duration_s, runtime.language)}
              walking
              verified={place.attributes?.verified === true}
              tags={visiblePlaceTags(place)}
              onClick={() => openPlace(place)}
            />
          ))}
          {loading && !places.length ? Array.from({ length: 4 }).map((_, index) => <div className="gt-place-row gt-place-row--skeleton" key={`loading-${index}`}><span className="gt-place-row__skeleton-photo"/><span className="gt-place-row__skeleton-copy"><i/><i/><i/></span></div>) : null}
          {!loading && !places.length ? <div className="gt-stage2-empty">{tr(runtime.language, "За цими фільтрами місць не знайдено", "No places match these filters", "Brak miejsc pasujących do filtrów")}</div> : null}
        </div>
      </main>
    </div>
  );
}

function CatalogScreen({ navigate }: { navigate: Navigate }) {
  return <DynamicCategoryScreen navigate={navigate} config={{
    category: "food", className: "gt-food-screen", icon: Utensils, title: "Де поїсти", titleEn: "Food", titlePl: "Gdzie zjeść",
    subtitle: "Кафе, ресторани та заклади", subtitleEn: "Cafes and restaurants", subtitlePl: "Kawiarnie i restauracje", tone: "orange",
    placeholder: "Пошук закладу, кухні або страви", placeholderEn: "Search places, cuisine or dishes", placeholderPl: "Szukaj lokalu, kuchni lub dania", sectionTitle: "Рекомендовані заклади", sectionTitleEn: "Recommended places", sectionTitlePl: "Polecane miejsca",
    fallbackChips: ["Українська кухня", "Неукраїнська кухня", "Фаст фуд", "Кавʼярні"],
  }} />;
}

function NearbyScreen({ navigate }: { navigate: Navigate }) {
  const runtime = useTouristRuntime();
  const [activeCategory, setActiveCategory] = useState("Усі");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(500);
  const [nearbyPlaces, setNearbyPlaces] = useState<Stage2Place[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState("");
  const [previewPlace, setPreviewPlace] = useState<Stage2Place | null>(null);
  const [filters, setFilters] = useState<PlaceFilterState>(DEFAULT_PLACE_FILTERS);
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const subcategoryScrollRef = useRef<HTMLDivElement | null>(null);
  const sheetTouchStartY = useRef<number | null>(null);

  const categories: Array<{ label: string; icon: LucideIcon; tone: string; slug?: string }> = [
    { label: "Усі", icon: Grid2X2, tone: "all" },
    { label: "Де поїсти", icon: Utensils, tone: "food", slug: "food" },
    { label: "Де купити", icon: ShoppingBag, tone: "shop", slug: "shop" },
    { label: "Природа", icon: MountainSnow, tone: "nature" },
    { label: "Цікаве", icon: TentTree, tone: "interesting" },
    { label: "Розваги", icon: Bike, tone: "fun", slug: "entertainment" },
    { label: "Трансфер", icon: CarFront, tone: "transfer", slug: "transfer" },
    { label: "Корисне", icon: Info, tone: "useful" },
    { label: "Маршрути", icon: Route, tone: "routes" },
  ];

  const subcategoryGroups: Record<string, Array<{ label: string; icon: LucideIcon }>> = {
    "Де поїсти": [
      { label: "Ресторани", icon: Utensils }, { label: "Кафе", icon: Sparkles }, { label: "Бари", icon: CircleHelp }, { label: "Піцерії", icon: Flame },
      { label: "Кондитерські", icon: Gift }, { label: "Фастфуд", icon: FlameKindling }, { label: "Їжа з собою", icon: ShoppingBag }, { label: "Традиційна кухня", icon: BadgeCheck },
    ],
    "Де купити": [
      { label: "Продукти", icon: ShoppingBag }, { label: "Сувеніри", icon: Gift }, { label: "Одяг і взуття", icon: UsersRound }, { label: "Товари для дому", icon: Hotel },
      { label: "Аптеки", icon: Pill }, { label: "Техніка", icon: Gauge }, { label: "Будівництво", icon: Wrench }, { label: "Косметика", icon: Sparkles },
    ],
    "Природа": [
      { label: "Гори", icon: MountainSnow }, { label: "Річки", icon: Route }, { label: "Водоспади", icon: LifeBuoy }, { label: "Джерела", icon: MapPin },
      { label: "Озера", icon: Flower2 }, { label: "Оглядові точки", icon: LocateFixed }, { label: "Печери", icon: TentTree }, { label: "Ліси", icon: Leaf },
    ],
    "Цікаве": [
      { label: "Пам’ятки", icon: BadgeCheck }, { label: "Музеї", icon: Info }, { label: "Храми", icon: Cross }, { label: "Архітектура", icon: Hotel },
      { label: "Історичні місця", icon: Clock3 }, { label: "Скульптури", icon: UserRound }, { label: "Місцеві легенди", icon: MessageSquareMore }, { label: "Події", icon: CalendarDays },
    ],
    "Розваги": [
      { label: "Активний відпочинок", icon: Footprints }, { label: "Атракціони", icon: Sparkles }, { label: "Екскурсії", icon: Route }, { label: "SPA і басейни", icon: Flower2 },
      { label: "Риболовля", icon: LifeBuoy }, { label: "Верхова їзда", icon: PawPrint }, { label: "Квадроцикли", icon: Bike }, { label: "Польоти", icon: Navigation },
    ],
    "Трансфер": [
      { label: "Автобусні зупинки", icon: CarFront }, { label: "Залізничні станції", icon: Route }, { label: "Автостанції", icon: Hotel }, { label: "Таксі", icon: CarFront },
      { label: "Парковки", icon: MapPin }, { label: "Оренда авто", icon: CarFront }, { label: "Заправки", icon: Gauge }, { label: "Зарядні станції", icon: Plus },
    ],
    "Корисне": [
      { label: "Банкомати", icon: Banknote }, { label: "Обмін валют", icon: WalletCards }, { label: "Пошта", icon: Send }, { label: "Лікарні", icon: Heart },
      { label: "Туалети", icon: UsersRound }, { label: "Wi‑Fi", icon: Wifi }, { label: "Поліція", icon: ShieldCheck }, { label: "Інформаційні центри", icon: Info },
    ],
    "Маршрути": [
      { label: "Піші маршрути", icon: Footprints }, { label: "Веломаршрути", icon: Bike }, { label: "Автомаршрути", icon: CarFront }, { label: "Верхові маршрути", icon: PawPrint },
      { label: "Водні маршрути", icon: LifeBuoy }, { label: "Популярні маршрути", icon: BadgeCheck }, { label: "Складні маршрути", icon: MountainSnow }, { label: "Маршрути вихідного дня", icon: SunMedium },
    ],
  };

  const activeSubcategories = subcategoryGroups[activeCategory] ?? [];
  const activeCategoryMeta = categories.find((item) => item.label === activeCategory);
  const activeTone = activeCategoryMeta?.tone ?? "all";
  const center = runtime.location ?? (runtime.context ? { lat: Number(runtime.context.place?.lat ?? runtime.context.region.lat), lng: Number(runtime.context.place?.lng ?? runtime.context.region.lng), source: "qr" as const } : null);

  useEffect(() => {
    if (!runtime.context || !center) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ region_id: runtime.context!.region.id, lat: String(center.lat), lng: String(center.lng), radius: String(radius) });
      const googleSection = activeTone === "fun" ? "entertainment" : activeTone === "all" ? "all" : activeTone;
      params.set("include_google", "true");
      params.set("debug_google", "true");
      params.set("google_section", googleSection);
      params.set("google_limit", radius >= 1000 && !activeSubcategory ? "40" : "20");
      params.set("include_routes", "false");
      if (radius >= 1000 && !activeSubcategory) params.set("google_spread", "true");
      if (activeCategoryMeta?.slug) params.set("category", activeCategoryMeta.slug);
      else if (activeCategory !== "Усі") params.set("category", "__google__");
      if (activeSubcategory) params.set("subcategory", activeSubcategory);
      if (query.trim()) params.set("q", query.trim());
      appendPlaceFilters(params, filters);
      const filterKey = `${Number(filters.openNow)}:${filters.minRating || 0}:${filters.priceLevel || 0}:${Number(filters.kids)}:${Number(filters.parking)}:${Number(filters.partner)}:${filters.distance}`;
      const cacheKey = `gid-nearby-cache:${center.lat.toFixed(3)}:${center.lng.toFixed(3)}:${radius}:${activeCategory}:${activeSubcategory}:${query.trim().toLocaleLowerCase("uk")}:${filterKey}`;
      let hasCachedPlaces = false;
      try {
        const cached = window.sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as Stage2Place[];
          if (Array.isArray(parsed) && parsed.length) { hasCachedPlaces = true; setNearbyPlaces(parsed); setNearbyLoading(false); }
        }
      } catch { /* optional cache */ }
      if (!hasCachedPlaces) setNearbyLoading(true);
      setNearbyError("");

      void stage2Fetch<Stage2Place[]>(`/places?${params}`).then((items) => {
        if (cancelled) return;
        setNearbyPlaces(items);
        setNearbyLoading(false);
        try { window.sessionStorage.setItem(cacheKey, JSON.stringify(items)); } catch { /* optional cache */ }
      }).catch((error) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        console.error("[Nearby places]", message);
        setNearbyError(message || "Невідома помилка сервісу місць");
        setNearbyLoading(false);
      });
    }, query.trim() ? 160 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [runtime.context, center?.lat, center?.lng, radius, activeCategoryMeta?.slug, activeCategory, activeTone, activeSubcategory, query, filters]);

  const openPlace = (place: Stage2Place) => {
    runtime.setSelectedPlace(place);
    void trackEvent("place_viewed", { regionId: runtime.context?.region.id, placeId: place.id, payload: { source: "nearby" } });
    navigate("tourist", "place");
  };

  const previewMapPlace = (place: Stage2Place) => {
    setPreviewPlace(place);
    if (!center) return;
    const cacheKey = googlePlaceDetailCacheKey(place.id, center.lat, center.lng);
    if (isExternalPlace(place)) {
      const cached = readGooglePlaceDetailCache(cacheKey);
      if (cached) {
        setPreviewPlace(cached);
        return;
      }
    }
    const suffix = `?lat=${encodeURIComponent(String(center.lat))}&lng=${encodeURIComponent(String(center.lng))}`;
    void stage2Fetch<Stage2Place>(`/places/${encodeURIComponent(place.id)}${suffix}`).then((details) => {
      if (isExternalPlace(details)) writeGooglePlaceDetailCache(cacheKey, details);
      setPreviewPlace((current) => current?.id === place.id ? details : current);
    }).catch(() => undefined);
  };

  return (
    <div className={`tourist-screen gt-screen gt-nearby-screen gt-nearby-design gt-nearby-theme--${activeTone}`}>
      <main className={`gt-nearby-design__content ${activeSubcategories.length ? "has-subcategories" : ""}`.trim()}>
        <section className="gt-nearby-design__head">
          <div className="gt-nearby-design__brand-row"><h1>Gid Tourist</h1></div>
          <div className="gt-nearby-design__search-row">
            <label className="gt-nearby-design__search">
              <Search size={21} />
              <input aria-label={tr(runtime.language, "Пошук", "Search", "Szukaj")} placeholder={tr(runtime.language, "Пошук місць, маршрутів, активностей...", "Search places, routes, activities...", "Szukaj miejsc, tras i atrakcji...")} value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <button type="button" className="gt-nearby-design__filter" aria-label={tr(runtime.language, "Визначити моє місцезнаходження", "Use my location", "Użyj mojej lokalizacji")} onClick={() => void runtime.requestLocation()}>
              <LocateFixed size={23} />
            </button>
          </div>

          <div className="gt-nearby-design__categories-wrap">
            <div ref={categoryScrollRef} className="gt-nearby-design__categories">
              {categories.map(({ label, icon: Icon, tone }) => (
                <button type="button" key={label} className={activeCategory === label ? "is-active" : ""} onClick={() => {
                  setActiveCategory(label); setActiveSubcategory(""); setResultsExpanded(false);
                }}>
                  <span className={`gt-nearby-design__category-icon gt-nearby-category-icon--${tone}`}><Icon size={25} /></span>
                  <strong>{translateKnownLabel(runtime.language, label)}</strong>
                </button>
              ))}
            </div>
            <button type="button" className="gt-nearby-design__categories-next" aria-label={tr(runtime.language, "Наступні категорії", "Next categories", "Następne kategorie")} onClick={() => categoryScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}><ChevronRight size={22} /></button>
          </div>

          {activeCategory !== "Усі" && activeSubcategories.length ? (
            <div className="gt-nearby-design__subcategories-wrap">
              <div ref={subcategoryScrollRef} className="gt-nearby-design__subcategories">
                {activeSubcategories.map(({ label, icon: Icon }) => (
                  <button type="button" key={`${activeCategory}-${label}`} className={activeSubcategory === label ? "is-active" : ""} onClick={() => setActiveSubcategory((current) => current === label ? "" : label)}>
                    <span><Icon size={22} /></span><strong>{translateKnownLabel(runtime.language, label)}</strong>
                  </button>
                ))}
              </div>
              <button type="button" className="gt-nearby-design__subcategories-next" aria-label={tr(runtime.language, "Наступні підкатегорії", "Next subcategories", "Następne podkategorie")} onClick={() => subcategoryScrollRef.current?.scrollBy({ left: 250, behavior: "smooth" })}><ChevronRight size={20} /></button>
            </div>
          ) : null}
          <PlaceFilters filters={filters} onChange={setFilters} language={runtime.language} showDistance={false} />
        </section>

        <section className="gt-nearby-design__map gt-nearby-design__map--live" aria-label={tr(runtime.language, "Карта місць поруч", "Nearby places map", "Mapa miejsc w pobliżu")}>
          {center ? <RealMap center={center} places={nearbyPlaces} radius={radius} preferLeaflet className="gt-nearby-design__real-map" onSelect={previewMapPlace} /> : <div className="gt-nearby-design__map-loading">{tr(runtime.language, "Визначаємо вашу точку входу…", "Detecting your entry point…", "Ustalamy punkt wejścia…")}</div>}
          {nearbyError ? <div className="gt-nearby-design__diagnostic" role="alert">
            <strong>{tr(runtime.language, "Помилка сервісу місць", "Places service error", "Błąd usługi miejsc")}</strong>
            <span>{nearbyError}</span>
            <small>{tr(runtime.language, "Радіус", "Radius", "Promień")}: {radius < 1000 ? `${radius} ${tr(runtime.language, "м", "m", "m")}` : `${radius / 1000} ${tr(runtime.language, "км", "km", "km")}`}{center ? ` · ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}` : ""}</small>
          </div> : null}
          <div className="gt-nearby-design__map-controls">
            <button type="button" aria-label={tr(runtime.language, "Моє місцезнаходження", "My location", "Moja lokalizacja")} onClick={() => void runtime.requestLocation()}><LocateFixed size={22} /></button>
          </div>
          <div className="gt-nearby-design__radius">
            {[300, 500, 1000, 2000, 5000].map((value) => (
              <button type="button" key={value} className={radius === value ? "is-active" : ""} onClick={() => setRadius(value)}>{value < 1000 ? `${value} м` : `${value / 1000} км`}</button>
            ))}
          </div>
          {previewPlace ? <div className="gt-map-place-preview" role="dialog" aria-label={`Перегляд ${previewPlace.name}`}>
            <RemotePlaceImage url={previewPlace.image_url} className="gt-map-place-preview__image" google={previewPlace.source === "google" || previewPlace.attributes?.google === true} googlePlaceId={googlePlaceId(previewPlace)} eager fallback={<Thumb name={placePhotoFallback(previewPlace)} />} />
            <div className="gt-map-place-preview__copy">
              <strong>{previewPlace.name}</strong>
              <small>{previewPlace.subcategory ? translateKnownLabel(runtime.language, previewPlace.subcategory) : (previewPlace.category_name || previewPlace.address)}</small>
              <span><b><Star size={13} fill="currentColor" /> {placeRatingLabel(previewPlace, false)}{Number(previewPlace.rating || 0) > 0 ? ` · ${previewPlace.review_count || 0}` : ""}</b><em>{previewPlace.is_open_now === true ? tr(runtime.language, "Відкрито", "Open", "Otwarte") : previewPlace.is_open_now === false ? tr(runtime.language, "Зачинено", "Closed", "Zamknięte") : tr(runtime.language, "Графік", "Hours", "Godziny")} · {placeHoursLabel(previewPlace, runtime.language)}</em></span>
              <span><b>{distanceLabel(previewPlace.distance_m, runtime.language)}</b><em><WalkingIcon size={13} /> {walkLabel(previewPlace.distance_m, previewPlace.walking_duration_s, runtime.language)}</em></span>
              <div><button type="button" onClick={() => setPreviewPlace(null)}>{tr(runtime.language, "Закрити", "Close", "Zamknij")}</button><button type="button" className="is-primary" onClick={() => openPlace(previewPlace)}>{tr(runtime.language, "Відкрити", "Open", "Otwórz")}</button></div>
            </div>
          </div> : null}
        </section>

        <section className={`gt-nearby-design__sheet ${resultsExpanded ? "is-expanded" : ""}`}
          onTouchStart={(event) => { sheetTouchStartY.current = event.touches[0]?.clientY ?? null; }}
          onTouchEnd={(event) => {
            const startY = sheetTouchStartY.current; const endY = event.changedTouches[0]?.clientY; sheetTouchStartY.current = null;
            if (startY == null || endY == null) return; const deltaY = endY - startY; if (deltaY < -28) setResultsExpanded(true); if (deltaY > 28) setResultsExpanded(false);
          }}>
          <button type="button" className="gt-nearby-design__sheet-head" onClick={() => setResultsExpanded((value) => !value)} aria-expanded={resultsExpanded}>
            <span className="gt-nearby-design__sheet-caret"><ChevronRight size={18} /></span><strong>{tr(runtime.language, "Поруч з вами", "Near you", "W pobliżu")}</strong><span>{nearbyPlaces.length} {tr(runtime.language, "місць", "places", "miejsc")}</span>
          </button>
          {resultsExpanded ? (
            <div className="gt-nearby-design__cards">
              {nearbyPlaces.map((place) => (
                <button type="button" className="gt-nearby-design__card" key={place.id} onClick={() => openPlace(place)}>
                  <RemotePlaceImage url={place.image_url} className="gt-photo gt-nearby-design__remote-photo" google={place.source === "google" || place.attributes?.google === true} googlePlaceId={googlePlaceId(place)} fallback={<Thumb name={placePhotoFallback(place)} />} />
                  <span className="gt-nearby-design__card-copy">
                    <strong>{place.name}{place.is_partner || place.attributes?.partner === true ? <i className="gt-nearby-partner-badge">{tr(runtime.language, "Партнер", "Partner", "Partner")}</i> : null}</strong><small>{place.subcategory || place.category_name}</small>
                    <span><b><Star size={12} fill="currentColor" /> {placeRatingLabel(place, false)}</b><em>{distanceLabel(place.distance_m, runtime.language)} · {walkLabel(place.distance_m, place.walking_duration_s, runtime.language)}</em></span>
                  </span>
                </button>
              ))}
              {nearbyLoading && !nearbyPlaces.length ? <div className="gt-stage2-empty">{tr(runtime.language, "Завантажуємо місця поруч…", "Loading nearby places…", "Ładowanie miejsc w pobliżu…")}</div> : null}
              {!nearbyLoading && !nearbyPlaces.length ? <div className="gt-stage2-empty">{tr(runtime.language, "У цьому радіусі місць не знайдено", "No places found within this radius", "Brak miejsc w tym promieniu")}</div> : null}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function PlaceScreen({ navigate }: { navigate: Navigate }) {
  const runtime = useTouristRuntime();
  const [place, setPlace] = useState<Stage2Place | null>(() => runtime.selectedPlace);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const fallbackId = runtime.selectedPlaceId || runtime.selectedPlace?.id || runtime.context?.place?.id || "";

  useEffect(() => {
    if (!fallbackId) return;
    let cancelled = false;
    const immediate = runtime.selectedPlace?.id === fallbackId ? runtime.selectedPlace : null;
    const point = runtime.location ?? (runtime.context ? { lat: Number(runtime.context.place?.lat ?? runtime.context.region.lat), lng: Number(runtime.context.place?.lng ?? runtime.context.region.lng) } : null);
    const cacheKey = googlePlaceDetailCacheKey(fallbackId, point?.lat, point?.lng);
    const isExternal = fallbackId.startsWith("google_") || fallbackId.startsWith("geoapify_") || isExternalPlace(immediate);
    const cached = isExternal ? readGooglePlaceDetailCache(cacheKey) : null;
    setPlace((current) => current?.id === fallbackId ? current : cached ?? immediate);
    setPlaceLoading(!cached);
    const suffix = point ? `?lat=${encodeURIComponent(String(point.lat))}&lng=${encodeURIComponent(String(point.lng))}` : "";
    if (!cached) {
      void stage2Fetch<Stage2Place>(`/places/${encodeURIComponent(fallbackId)}${suffix}`).then((next) => {
        if (isExternalPlace(next)) writeGooglePlaceDetailCache(cacheKey, next);
        if (!cancelled) setPlace(next);
      }).catch(() => {
        if (!cancelled && runtime.context?.place?.id === fallbackId) setPlace(runtime.context.place);
      }).finally(() => { if (!cancelled) setPlaceLoading(false); });
    }
    void stage2Fetch<Stage2Place[]>("/me/favorites").then((items) => { if (!cancelled) setFavorite(items.some((item) => item.id === fallbackId)); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [fallbackId, runtime.context?.place, runtime.location?.lat, runtime.location?.lng, runtime.selectedPlace]);

  const loadedPlace = place?.id === fallbackId ? place : null;
  const selectedFallback = runtime.selectedPlace?.id === fallbackId ? runtime.selectedPlace : null;
  const contextFallback = runtime.context?.place?.id === fallbackId ? runtime.context.place : null;
  const current = loadedPlace ?? selectedFallback ?? contextFallback;
  if (!current) {
    return <div className="tourist-screen gt-screen"><main className="gt-content">{!placeLoading ? <div className="gt-stage2-empty">{tr(runtime.language, "Локацію не вибрано або вона відсутня в базі", "No place selected or it is unavailable", "Nie wybrano miejsca lub jest ono niedostępne")}</div> : null}</main></div>;
  }
  const daily = current.work_hours?.daily as { from?: string; to?: string } | undefined;
  const googleWeekdays = Array.isArray(current.details?.google_weekday_descriptions) ? current.details.google_weekday_descriptions.map(String) : [];
  const hours = current.work_hours?.always_open === true ? tr(runtime.language, "Цілодобово", "Open 24/7", "Całodobowo") : daily?.from && daily?.to ? `${tr(runtime.language, "Щодня", "Daily", "Codziennie")} · ${daily.from}–${daily.to}` : googleWeekdays[0] || tr(runtime.language, "Графік уточнюється", "Hours to be confirmed", "Godziny do ustalenia");
  const phone = phoneForPlace(current);
  const phoneHref = telHref(phone);
  const reviewsHref = googleReviewsUri(current) || (typeof current.attributes?.google_maps_uri === "string" ? current.attributes.google_maps_uri : "");
  const fallbackStraightDistance = runtime.location ? Math.round((() => {
    const r=6371000,toRad=(v:number)=>v*Math.PI/180,dLat=toRad(Number(current.lat)-runtime.location!.lat),dLng=toRad(Number(current.lng)-runtime.location!.lng);
    const a=Math.sin(dLat/2)**2+Math.cos(toRad(runtime.location!.lat))*Math.cos(toRad(Number(current.lat)))*Math.sin(dLng/2)**2; return 2*r*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  })()) : null;
  const currentDistance = current.distance_m ?? fallbackStraightDistance;
  const distance = distanceLabel(currentDistance, runtime.language);
  const walkingTime = walkLabel(currentDistance, current.walking_duration_s, runtime.language);

  const openRoute = () => {
    void trackEvent("route_clicked", { regionId: current.region_id, placeId: current.id });
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${current.lat},${current.lng}`)}`, "_blank", "noopener,noreferrer");
  };
  const toggleFavorite = async () => {
    try {
      await stage2Fetch(`/me/favorites/${encodeURIComponent(current.id)}`, { method: favorite ? "DELETE" : "POST" });
      setFavorite((value) => !value);
    } catch {
      // Guest mode: favorites become available after Telegram auth.
    }
  };

  const openReviews = () => {
    if (!reviewsHref) return;
    window.open(reviewsHref, "_blank", "noopener,noreferrer");
  };

  const callPlace = () => {
    if (!phoneHref) return;
    void trackEvent("call_clicked", { regionId: current.region_id, placeId: current.id });
    try {
      window.location.href = phoneHref;
    } catch {
      const link = document.createElement("a");
      link.href = phoneHref;
      link.click();
    }
  };

  return (
    <div className="tourist-screen gt-screen">
      <section className={`gt-place-hero ${current.image_url ? "has-real-photo" : ""}`}>
        {current.image_url || current.source === "google" || current.source === "geoapify" ? <RemotePlaceImage key={current.id} url={current.image_url} alt={current.name} className="gt-place-hero__image" google={current.source === "google" || current.attributes?.google === true} googlePlaceId={googlePlaceId(current)} eager diagnostics={current.source === "google" || current.attributes?.google === true} fallback={<Thumb name={placePhotoFallback(current)} />} /> : null}
        <span className="gt-place-hero__shade" aria-hidden="true" />
        {current.attributes?.verified === true ? <span className="gt-pill gt-pill--glass"><BadgeCheck size={16} /> {tr(runtime.language, "Перевірено", "Verified", "Zweryfikowano")}</span> : null}
        <div>
          <h1>{current.name}</h1>
          <p><MapPin size={17} /> {runtime.context?.region.name || current.address || tr(runtime.language, "Поточна локація", "Current location", "Bieżąca lokalizacja")} · {distance}</p>
        </div>
      </section>
      <main className="gt-content gt-content--overlap">
        <div className="gt-place-summary">
          <button type="button" className="gt-place-summary__reviews-button" onClick={openReviews} aria-disabled={!reviewsHref}><Star size={19} fill="currentColor" /><strong>{placeRatingLabel(current, false)}</strong><small>{Number(current.rating || 0) > 0 ? `${current.review_count || 0} ${tr(runtime.language, "відгуків", "reviews", "opinii")} · Google` : tr(runtime.language, "Відкрити відгуки Google", "Open Google reviews", "Otwórz opinie Google")}</small></button>
          <span><Clock3 size={19} /><strong>{current.is_open_now === true ? tr(runtime.language, "Відкрито", "Open", "Otwarte") : current.is_open_now === false ? tr(runtime.language, "Зачинено", "Closed", "Zamknięte") : tr(runtime.language, "Графік", "Hours", "Godziny")}</strong><small>{daily?.to ? `${tr(runtime.language, "до", "until", "do")} ${daily.to}` : tr(runtime.language, "див. нижче", "see below", "zobacz niżej")}</small></span>
          <span><MapPin size={19} /><strong>{distance}</strong><small><WalkingIcon size={12} /> {walkingTime} {tr(runtime.language, "пішки", "walk", "pieszo")}</small></span>
        </div>
        <div className="gt-action-grid">
          <button type="button" onClick={openRoute}><Navigation size={22} /><span>{tr(runtime.language, "Маршрут", "Route", "Trasa")}</span></button>
          <button type="button" onClick={callPlace} aria-disabled={!phoneHref}><Phone size={22} /><span>{tr(runtime.language, "Дзвінок", "Call", "Zadzwoń")}</span></button>
          <button type="button" onClick={() => current.telegram ? window.open(current.telegram, "_blank", "noopener,noreferrer") : undefined}><MessageCircle size={22} /><span>Telegram</span></button>
          <button type="button" className={favorite ? "is-active" : ""} onClick={() => void toggleFavorite()}><Heart size={22} fill={favorite ? "currentColor" : "none"} /><span>{favorite ? tr(runtime.language, "Збережено", "Saved", "Zapisano") : tr(runtime.language, "Зберегти", "Save", "Zapisz")}</span></button>
        </div>
        <SectionTitle title={tr(runtime.language, "Про заклад", "About", "O miejscu")} />
        <p className="gt-body-copy">{current.description || tr(runtime.language, "Інформація про заклад уточнюється.", "Place information is being updated.", "Informacje o miejscu są aktualizowane.")}</p>
        <div className="gt-detail-card">
          <span><Clock3 size={22} /></span><div><strong>{tr(runtime.language, "Графік роботи", "Opening hours", "Godziny otwarcia")}</strong><small>{hours}</small></div><ChevronRight size={19} />
        </div>
        <div className="gt-detail-card">
          <span><MapPin size={22} /></span><div><strong>{tr(runtime.language, "Адреса", "Address", "Adres")}</strong><small>{current.address}</small></div><ChevronRight size={19} />
        </div>
        {phone && phoneHref ? <a className="gt-detail-card gt-detail-card--link" href={phoneHref} onClick={(event) => { event.preventDefault(); callPlace(); }}><span><Phone size={22} /></span><div><strong>{tr(runtime.language, "Телефон", "Phone", "Telefon")}</strong><small>{phone}</small></div><ChevronRight size={19} /></a> : null}
        {current.website ? <a className="gt-detail-card gt-detail-card--link" href={current.website} target="_blank" rel="noreferrer"><span><Globe size={22} /></span><div><strong>{tr(runtime.language, "Сайт", "Website", "Strona")}</strong><small>{current.website}</small></div><ChevronRight size={19} /></a> : null}
        {googleWeekdays.length ? <section className="gt-google-hours"><strong>{tr(runtime.language, "Графік роботи", "Opening hours", "Godziny otwarcia")}</strong>{googleWeekdays.map((line) => <small key={line}>{line}</small>)}</section> : null}
        {visiblePlaceTags(current).length ? <div className="gt-stage2-place-tags">{visiblePlaceTags(current).map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
        <button type="button" className="gt-primary-button" onClick={openRoute}>{tr(runtime.language, "Побудувати маршрут", "Build route", "Wyznacz trasę")} <Navigation size={20} /></button>
      </main>
    </div>
  );
}

function AvailableScreen({ navigate }: { navigate: Navigate }) {
  return <DynamicCategoryScreen navigate={navigate} config={{
    category: "rest", className: "gt-rest-screen", icon: BedDouble, title: "Де відпочити", titleEn: "Relax", titlePl: "Wypoczynek",
    subtitle: "Місця для релаксу та відпочинку", subtitleEn: "Relax and wellness places", subtitlePl: "Relaks i wypoczynek", tone: "purple",
    placeholder: "Пошук відпочинку та розваг", placeholderEn: "Search relaxation and activities", placeholderPl: "Szukaj wypoczynku i atrakcji", sectionTitle: "Рекомендовані місця для відпочинку", sectionTitleEn: "Recommended places to relax", sectionTitlePl: "Polecane miejsca wypoczynku",
    fallbackChips: ["Чани","Сауни","Басейни","Масаж","Походи","Екскурсії"],
  }} />;
}

function ShopScreen({ navigate }: { navigate: Navigate }) {
  return <DynamicCategoryScreen navigate={navigate} config={{
    category: "shop", className: "gt-shop-screen", icon: ShoppingBag, title: "Де купити", titleEn: "Shopping", titlePl: "Zakupy",
    subtitle: "Магазини та корисні покупки", subtitleEn: "Shops and useful purchases", subtitlePl: "Sklepy i zakupy", tone: "blue",
    placeholder: "Пошук магазину або товарів", placeholderEn: "Search shops or products", placeholderPl: "Szukaj sklepu lub produktów", sectionTitle: "Магазини поруч", sectionTitleEn: "Shops nearby", sectionTitlePl: "Sklepy w pobliżu",
    fallbackChips: ["Продовольчі","Промтовари","Сувеніри","Аптеки"],
  }} />;
}

function EntertainmentScreen({ navigate }: { navigate: Navigate }) {
  return <DynamicCategoryScreen navigate={navigate} config={{
    category: "entertainment", className: "gt-entertainment-screen", icon: Bike, title: "Розваги", titleEn: "Entertainment", titlePl: "Rozrywka",
    subtitle: "Активності та яскраві враження", subtitleEn: "Activities and impressions", subtitlePl: "Aktywności i wrażenia", tone: "red",
    placeholder: "Пошук розваг", placeholderEn: "Search entertainment", placeholderPl: "Szukaj atrakcji", sectionTitle: "Активні розваги поруч", sectionTitleEn: "Activities nearby", sectionTitlePl: "Atrakcje w pobliżu",
    fallbackChips: ["Джипи","Квадроцикли","Рафтинг","Зіплайн","Для дітей","Коні"],
  }} />;
}

type TransferDisplayPlace = {
  image: string;
  title: string;
  subtitle: string;
  rating: string;
  distance: string;
  walk: string;
  walking: boolean;
  tags: string[];
  google?: boolean;
  googlePlaceId?: string;
  eager?: boolean;
};

function TransferReferenceRow({ place, onClick }: { place: TransferDisplayPlace; onClick?: () => void }) {
  return (
    <article className="gt-transfer-reference-row" onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <RemotePlaceImage url={place.image} className="gt-transfer-reference-row__image" google={place.google} googlePlaceId={place.googlePlaceId} eager={place.eager} fallback={<div className="gt-transfer-reference-row__image gt-real-place-image-placeholder"><CarFront size={24} /></div>} />
      <div className="gt-transfer-reference-row__body">
        <div className="gt-transfer-reference-row__title">
          <strong>{place.title}</strong>
          <b>{place.distance}</b>
        </div>
        <p>{place.subtitle}</p>
        <div className="gt-transfer-reference-row__meta">
          <span><Star size={14} fill="currentColor" /> {place.rating}</span>
          <span>{place.walking ? <WalkingIcon size={13} /> : <CarFront size={13} />} {place.walk}</span>
        </div>
        <div className="gt-transfer-reference-row__tags">
          {place.tags.map((tag) => <i key={tag}>{tag}</i>)}
        </div>
      </div>
    </article>
  );
}

function TransferScreen({ navigate }: { navigate: Navigate }) {
  const runtime = useTouristRuntime();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("Усі");
  const [places, setPlaces] = useState<Stage2Place[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [transferLoading, setTransferLoading] = useState(true);
  const [transferCategory, setTransferCategory] = useState<Stage2Category | null>(null);
  const [filters, setFilters] = useState<PlaceFilterState>(DEFAULT_PLACE_FILTERS);

  useEffect(() => {
    let cancelled = false;
    void stage2Fetch<Stage2Category[]>("/categories").then((items) => { if (!cancelled) setTransferCategory(items.find((item) => item.slug === "transfer") ?? null); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!runtime.context) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const point = runtime.location ?? { lat: Number(runtime.context!.place?.lat ?? runtime.context!.region.lat), lng: Number(runtime.context!.place?.lng ?? runtime.context!.region.lng) };
      const params = new URLSearchParams({ region_id: runtime.context!.region.id, category: "transfer" });
      params.set("lat", String(point.lat)); params.set("lng", String(point.lng)); params.set("radius", String(filters.distance));
      params.set("include_google", "true"); params.set("google_section", "transfer"); params.set("google_limit", "20"); params.set("include_routes", "false");
      if (query.trim()) params.set("q", query.trim());
      if (chip !== "Усі") params.set("subcategory", chip);
      appendPlaceFilters(params, filters);
      const filterKey = `${Number(filters.openNow)}:${filters.minRating || 0}:${filters.priceLevel || 0}:${Number(filters.kids)}:${Number(filters.parking)}:${Number(filters.partner)}:${filters.distance}`;
      const cacheKey = `gid-transfer-cache:${point.lat.toFixed(3)}:${point.lng.toFixed(3)}:${chip}:${query.trim().toLocaleLowerCase("uk")}:${filterKey}`;
      let hasCachedPlaces = false;
      try {
        const cached = window.sessionStorage.getItem(cacheKey);
        if (cached) { const parsed = JSON.parse(cached) as Stage2Place[]; if (Array.isArray(parsed) && parsed.length) { hasCachedPlaces = true; setPlaces(parsed); setApiLoaded(true); setTransferLoading(false); } }
      } catch { /* optional cache */ }
      if (!hasCachedPlaces) setTransferLoading(true);
      void stage2Fetch<Stage2Place[]>(`/places?${params}`).then((items) => {
        if (cancelled) return; setPlaces(items); setApiLoaded(true); setTransferLoading(false);
        try { window.sessionStorage.setItem(cacheKey, JSON.stringify(items)); } catch { /* ignore */ }
      }).catch(() => { if (!cancelled) { setApiLoaded(true); setTransferLoading(false); } });
    }, query.trim() ? 160 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [runtime.context, runtime.location, query, chip, filters]);

  const display = places.map((place, index) => ({
    image: place.image_url || "",
    title: place.name,
    subtitle: place.description || (place.subcategory ? translateKnownLabel(runtime.language, place.subcategory) : tr(runtime.language, "Транспортна послуга", "Transport service", "Usługa transportowa")),
    rating: placeRatingLabel(place),
    distance: distanceLabel(place.distance_m, runtime.language),
    walk: walkLabel(place.distance_m, place.walking_duration_s, runtime.language),
    walking: false,
    google: place.source === "google" || place.attributes?.google === true,
    googlePlaceId: googlePlaceId(place),
    eager: index < 4,
    tags: (visiblePlaceTags(place).length ? visiblePlaceTags(place).map((tag) => translateKnownLabel(runtime.language, tag)) : [place.subcategory ? translateKnownLabel(runtime.language, place.subcategory) : tr(runtime.language, "Трансфер", "Transfer", "Transport")]).slice(0, 3),
  }));

  return (
    <div className="tourist-screen gt-screen gt-transfer-reference-screen">
      <main className="gt-transfer-reference-content">
        <CategoryHeader icon={CarFront} title={tr(runtime.language, "Трансфер", "Transfer", "Transport")} subtitle={tr(runtime.language, "Транспортні послуги та перевезення", "Transport services and rides", "Usługi transportowe i przejazdy")} tone="teal" onMap={() => navigate("tourist", "nearby")} />
        <SearchBar placeholder={tr(runtime.language, "Пошук трансферу або маршруту", "Search transfer or route", "Szukaj transportu lub trasy")} value={query} onChange={setQuery} />
        <div className="gt-transfer-reference-chips"><Chips items={["Усі", ...((transferCategory?.subcategories?.length ? transferCategory.subcategories : ["Таксі", "Автостанції", "Парковки", "Оренда авто", "Заправки"]).filter((item) => item !== "Усі"))]} selected={chip} onSelect={setChip} displayLabel={(item) => translateKnownLabel(runtime.language, item)} /></div>
        <PlaceFilters filters={filters} onChange={setFilters} language={runtime.language} />
        <MapStrip real places={places} />
        <SectionTitle title={tr(runtime.language, "Трансфери поруч", "Transfers nearby", "Transport w pobliżu")} action={`${display.length}`} />
        <div className="gt-transfer-reference-list">
          {display.map((place, index) => <TransferReferenceRow key={`${place.title}-${index}`} place={place} onClick={places[index] ? () => { runtime.setSelectedPlace(places[index]); navigate("tourist", "place"); } : undefined} />)}
          {transferLoading && !display.length ? Array.from({ length: 4 }).map((_, index) => <div className="gt-transfer-reference-row gt-place-row--skeleton" key={`transfer-loading-${index}`}><span className="gt-place-row__skeleton-photo"/><span className="gt-place-row__skeleton-copy"><i/><i/><i/></span></div>) : null}
        </div>
        {apiLoaded && !transferLoading && !places.length ? <div className="gt-stage2-empty">{tr(runtime.language, "За цими фільтрами трансферів не знайдено", "No transfers match these filters", "Brak transportu pasującego do filtrów")}</div> : null}
      </main>
    </div>
  );
}

function BookingScreen({ navigate }: { navigate: Navigate }) {
  const [date, setDate] = useState("18");
  const [time, setTime] = useState("16:00");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <div className="gt-page-heading">
          <span className="gt-tone--green"><CalendarDays size={23} /></span>
          <div><h1>Бронювання</h1><p>Оберіть вільний ресурс і час</p></div>
        </div>
        <div className="gt-booking-place">
          <Thumb name="tub" />
          <div><strong>Чан «Гірське відновлення»</strong><small>Готель «Гірський затишок»</small><span><MapPin size={14} /> 250 м від вас</span></div>
        </div>
        <SectionTitle title="Дата" />
        <div className="gt-date-row">
          {["17", "18", "19", "20", "21"].map((item, index) => (
            <button type="button" className={date === item ? "is-active" : ""} key={item} onClick={() => setDate(item)}>
              <small>{["Ср", "Чт", "Пт", "Сб", "Нд"][index]}</small><strong>{item}</strong><span>лип</span>
            </button>
          ))}
        </div>
        <SectionTitle title="Вільний час" />
        <div className="gt-time-grid">
          {["14:00", "16:00", "18:00", "20:00"].map((item) => (
            <button type="button" className={time === item ? "is-active" : ""} key={item} onClick={() => setTime(item)}>{item}</button>
          ))}
        </div>
        <div className="gt-booking-summary">
          <div><span>Тривалість</span><strong>2 години</strong></div>
          <div><span>Місткість</span><strong>до 6 гостей</strong></div>
          <div><span>Вартість</span><strong>1 800 ₴</strong></div>
        </div>
        {confirmed ? (
          <div className="gt-success-card">
            <span><Check size={24} /></span><div><strong>Запит надіслано</strong><p>Партнер підтвердить бронювання у застосунку.</p></div>
          </div>
        ) : (
          <button type="button" className="gt-primary-button" onClick={() => setConfirmed(true)}>Підтвердити бронювання <ChevronRight size={20} /></button>
        )}
        <button type="button" className="gt-text-button" onClick={() => navigate("tourist", "plan")}>Переглянути мій план</button>
      </main>
    </div>
  );
}

type PlanSurveyMode = "express" | "extended";

const expressTravelers = [
  { label: "Я сам / сама", icon: UserRound },
  { label: "Пара", icon: Heart },
  { label: "Сім’я з дітьми", icon: UsersRound },
  { label: "Друзі", icon: UsersRound },
  { label: "Велика компанія", icon: UsersRound },
];

const activityChoices = [
  { label: "Романтичний", icon: Heart },
  { label: "Активний", icon: MountainSnow },
  { label: "Сімейний", icon: UsersRound },
  { label: "Природа", icon: TentTree },
  { label: "SPA", icon: Flower2 },
  { label: "Екскурсії", icon: Map },
];

function PlanArtIcon({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`gt-plan-art-icon${compact ? " is-compact" : ""}`} aria-hidden="true">
      <ClipboardCheck />
      <TentTree />
    </span>
  );
}

function PlanSurveyHeader({
  step,
  total,
  onBack,
}: {
  step?: number;
  total?: number;
  onBack: () => void;
}) {
  const hasProgress = step !== undefined && total !== undefined;
  const progress = hasProgress ? Math.max(0, Math.min(100, ((step - 1) / Math.max(1, total - 1)) * 100)) : 0;
  return (
    <header className="gt-plan-survey-header">
      <button type="button" aria-label="Назад" onClick={onBack}><ArrowLeft size={22} /></button>
      <span aria-hidden="true" />
      <span className="gt-plan-survey-info"><Info size={19} /></span>
      {hasProgress ? (
        <div className="gt-plan-progress-steps" aria-label={`Крок ${step} із ${total}`}>
          <i style={{ width: `${progress}%` }} />
          {Array.from({ length: total }).map((_, index) => (
            <span className={index + 1 < step ? "is-complete" : index + 1 === step ? "is-current" : ""} key={index}>
              {index + 1 < step ? <Check size={11} /> : null}
            </span>
          ))}
        </div>
      ) : null}
      {hasProgress ? <small className="gt-plan-progress-label">Крок {step} із {total}</small> : null}
    </header>
  );
}

function PlanChoiceList({
  items,
  selected,
  onSelect,
}: {
  items: { label: string; icon: LucideIcon }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="gt-plan-choice-list">
      {items.map(({ label, icon: Icon }) => (
        <button type="button" className={selected === label ? "is-selected" : ""} key={label} onClick={() => onSelect(label)}>
          <Icon size={19} /><span>{label}</span>{selected === label ? <Check size={18} /> : null}
        </button>
      ))}
    </div>
  );
}

function PlanChipGroup({
  items,
  selected,
  onSelect,
  className = "",
}: {
  items: string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`gt-plan-chip-group ${className}`.trim()}>
      {items.map((item) => (
        <button type="button" className={selected === item ? "is-selected" : ""} key={item} onClick={() => onSelect(item)}>{item}</button>
      ))}
    </div>
  );
}

function PlanStepper({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="gt-plan-stepper">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}><Minus size={17} /></button>
        <strong>{value}</strong>
        <button type="button" onClick={() => onChange(value + 1)}><Plus size={17} /></button>
      </div>
    </div>
  );
}

function PlanDateRange() {
  return (
    <div className="gt-plan-date-cards">
      <label><span>Початок</span><input type="date" defaultValue="2026-05-24" /><CalendarRange /></label>
      <label><span>Завершення</span><input type="date" defaultValue="2026-05-26" /><CalendarRange /></label>
    </div>
  );
}

function PlanFooter({
  label = "Далі",
  secondary,
  onSecondary,
  onNext,
}: {
  label?: string;
  secondary?: string;
  onSecondary?: () => void;
  onNext: () => void;
}) {
  return (
    <div className="gt-plan-flow-footer">
      {secondary && onSecondary ? <button type="button" className="is-secondary" onClick={onSecondary}>{secondary}</button> : null}
      <button type="button" className="is-primary" onClick={onNext}>{label}<ChevronRight size={19} /></button>
    </div>
  );
}

function PlanResult({ onOpenPlan, extended = false }: { onOpenPlan: () => void; extended?: boolean }) {
  const days = [
    { day: "День 1", photo: "hotel" as PhotoName, title: "Заселення та вечір у Татарові", items: ["Поселення в готелі", "Вечеря з місцевою кухнею", "Легка вечірня прогулянка"] },
    { day: "День 2", photo: "jeep" as PhotoName, title: "Гори та карпатські враження", items: ["Маршрут до оглядового місця", "Обід у гірській колибі", "Відпочинок у чані"] },
    { day: "День 3", photo: "tub" as PhotoName, title: "Відновлення і місцеві смаки", items: ["Ранковий SPA", "Купівля сувенірів", "Кава перед виїздом"] },
  ];
  return (
    <section className="gt-plan-result">
      <div className="gt-plan-result-title"><span><Sparkles size={24} /></span><div><h1>{extended ? "Ваші варіанти готові" : "Ваш план готовий 🎉"}</h1><p>{extended ? "Ми підібрали три сценарії під ваші побажання" : "Персональний план на 3 дні"}</p></div></div>
      {extended ? (
        <>
          <div className="gt-plan-extended-summary">
            <span><UsersRound size={17} /> 2 дорослих · 1 дитина</span>
            <span><CalendarDays size={17} /> 3 дні</span>
            <span><TentTree size={17} /> Сімейний · природа · SPA</span>
            <span><CarFront size={17} /> Власне авто</span>
          </div>
          <h2 className="gt-plan-variant-title">Ми підібрали 3 варіанти</h2>
          <div className="gt-plan-variant-row">
            {["Збалансований", "Більше активності", "Спокійний сімейний"].map((item, index) => (
              <article className={index === 0 ? "is-selected" : ""} key={item}>
                <Thumb name={(index === 0 ? "jeep" : index === 1 ? "tub" : "hotel") as PhotoName} />
                <strong>{item}</strong><small>{index === 0 ? "3 дні · рекомендовано" : "3 дні · альтернативний"}</small>
                <button type="button">{index === 0 ? "Обрано" : "Обрати"}</button>
              </article>
            ))}
          </div>
        </>
      ) : null}
      <div className="gt-plan-days">
        {days.map((item) => (
          <article key={item.day}>
            <Thumb name={item.photo} />
            <div><small>{item.day}</small><strong>{item.title}</strong><ul>{item.items.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
            <ChevronRight size={18} />
          </article>
        ))}
      </div>
      <button type="button" className="gt-plan-more"><Route size={19} /> Ще 2 варіанти плану <ChevronRight size={18} /></button>
      <div className="gt-plan-result-actions">
        <button type="button"><Share2 size={18} /> Поділитися</button>
        <button type="button" onClick={onOpenPlan}><Save size={18} /> Зберегти план</button>
      </div>
    </section>
  );
}

type SavedPlanStop = {
  id: number;
  period: "morning" | "day" | "evening";
  time: string;
  title: string;
  photo: "lake" | "waterfall" | "meadow" | "rocks";
};

const savedPlanPeriods = [
  { key: "morning" as const, label: "Ранок", icon: SunMedium },
  { key: "day" as const, label: "День", icon: SunMedium },
  { key: "evening" as const, label: "Вечір", icon: Moon },
];

function SavedPlanScreen({ navigate }: { navigate: Navigate }) {
  const [editing, setEditing] = useState(false);
  const [activeDay, setActiveDay] = useState(2);
  const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
  const [stops, setStops] = useState<SavedPlanStop[]>([
    { id: 1, period: "morning", time: "09:00", title: "Озеро Несамовите", photo: "lake" },
    { id: 2, period: "morning", time: "11:00", title: "Водоспад Гук", photo: "waterfall" },
    { id: 3, period: "day", time: "13:00", title: "Полонина Кукул", photo: "meadow" },
    { id: 4, period: "evening", time: "17:00", title: "Скелі Довбуша", photo: "rocks" },
  ]);

  const updateTitle = (id: number, title: string) => setStops((items) => items.map((item) => item.id === id ? { ...item, title } : item));
  const removeStop = (id: number) => setStops((items) => items.filter((item) => item.id !== id));
  const finishEditing = () => { setEditing(false); setEditingTitleId(null); };

  return (
    <div className="tourist-screen gt-screen gt-saved-plan-screen">
      <main className="gt-saved-plan">
        <header className="gt-saved-plan-header">
          <h1>Мій план</h1>
          <div>
            {!editing ? <button type="button" aria-label="Редагувати план" onClick={() => setEditing(true)}><Pencil size={19} /></button> : null}
            <button type="button" aria-label="Інформація"><Info size={21} /></button>
          </div>
        </header>

        <div className="gt-saved-plan-days">
          {[{ day: 1, date: "24 травня" }, { day: 2, date: "25 травня" }, { day: 3, date: "26 травня" }].map((item) => (
            <button type="button" className={activeDay === item.day ? "is-active" : ""} key={item.day} onClick={() => setActiveDay(item.day)}>
              <MountainSnow size={24} /><span><strong>День {item.day}</strong><small>{item.date}</small></span>
            </button>
          ))}
          <button type="button" className="gt-saved-plan-calendar" aria-label="Вибрати дату"><CalendarDays size={24} /></button>
        </div>

        <div className="gt-saved-plan-timeline">
          {savedPlanPeriods.map(({ key, label, icon: PeriodIcon }) => {
            const periodStops = stops.filter((stop) => stop.period === key);
            if (!periodStops.length) return null;
            return (
              <section key={key}>
                <h2><PeriodIcon size={20} /> {label}</h2>
                <div className="gt-saved-plan-period">
                  {periodStops.map((stop) => (
                    <div className={`gt-saved-plan-stop${editing ? " is-editing" : ""}`} key={stop.id}>
                      <time>{stop.time}</time>
                      <i />
                      <article>
                        {editing ? <span className="gt-saved-plan-drag"><GripVertical size={20} /></span> : null}
                        <span className={`gt-saved-plan-photo gt-saved-plan-photo--${stop.photo}`} />
                        <div>
                          {editingTitleId === stop.id ? (
                            <input value={stop.title} autoFocus onChange={(event) => updateTitle(stop.id, event.target.value)} onBlur={() => setEditingTitleId(null)} />
                          ) : <strong>{stop.title}</strong>}
                          <small><Check size={14} /> Відвідано</small>
                        </div>
                        {editing ? (
                          <span className="gt-saved-plan-edit-actions">
                            <button type="button" aria-label="Змінити назву" onClick={() => setEditingTitleId(stop.id)}><Pencil size={18} /></button>
                            <button type="button" aria-label="Видалити локацію" onClick={() => removeStop(stop.id)}><Trash2 size={18} /></button>
                          </span>
                        ) : <button type="button" className="gt-saved-plan-more-button" aria-label="Дії"><MoreVertical size={21} /></button>}
                      </article>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <button type="button" className="gt-saved-plan-tip" onClick={() => navigate("tourist", "nearby")}>
          <span><Leaf size={21} /></span><div><strong>Порада дня</strong><small>Візьміть дощовик — у горах погода мінлива.</small></div><ChevronRight size={19} />
        </button>
        <button type="button" className="gt-saved-plan-edit-button" onClick={() => editing ? finishEditing() : setEditing(true)}>
          {editing ? <Check size={19} /> : <Pencil size={19} />}{editing ? "Готово" : "Редагувати"}
        </button>
      </main>
    </div>
  );
}

function PlanScreen({ navigate }: { navigate: Navigate }) {
  const [mode, setMode] = useState<"home" | PlanSurveyMode | "view">("home");
  const [selectedMode, setSelectedMode] = useState<PlanSurveyMode>("express");
  const [step, setStep] = useState(0);
  const [traveler, setTraveler] = useState("Сім’я з дітьми");
  const [days, setDays] = useState("3 дні");
  const [style, setStyle] = useState("Сімейний");
  const [transport, setTransport] = useState("Власне авто");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [radius, setRadius] = useState("15 км");
  const [pace, setPace] = useState("Збалансований");
  const [load, setLoad] = useState("Помірне");
  const [budget, setBudget] = useState("Середній");

  const startSurvey = () => { setDays("3 дні"); setMode(selectedMode); setStep(1); };
  const goHome = () => { setMode("home"); setStep(0); };
  const goBack = () => step > 0 ? setStep((value) => value - 1) : goHome();

  if (mode === "home") {
    return (
      <div className="tourist-screen gt-screen gt-plan-screen">
        <main className="gt-plan-home">
          <header className="gt-plan-home-header"><h1>Мій план</h1><Info size={22} /></header>
          <section className="gt-plan-home-hero">
            <PlanArtIcon />
            <h2>Створимо Ваш<br />оптимальний план відпочинку</h2>
            <p>Відповідайте на кілька запитань і ми підберемо найкращий сценарій відпочинку для вас.</p>
          </section>
          <div className="gt-plan-mode-list">
            <button type="button" className={selectedMode === "express" ? "is-selected" : ""} onClick={() => setSelectedMode("express")}>
              <span><Timer size={38} /></span>
              <div><strong>Експрес-опитування</strong><p>1–2 хв <i /> 6 коротких запитань</p><small><Check /> Швидко та зручно</small><small><Check /> Ідеально для швидкого планування</small></div>
              <ChevronRight />
            </button>
            <button type="button" className={selectedMode === "extended" ? "is-selected" : ""} onClick={() => setSelectedMode("extended")}>
              <span><ListChecks size={38} /></span>
              <div><strong>Розширене опитування</strong><p>3–5 хв <i /> більше деталей і точніший план</p><small><Check /> Глибше розуміння ваших побажань</small><small><Check /> Точніший план під ваш стиль відпочинку</small></div>
              <ChevronRight />
            </button>
          </div>
          <button type="button" className="gt-plan-start-button" onClick={startSurvey}>Почати</button>
        </main>
      </div>
    );
  }

  if (mode === "view") return <SavedPlanScreen navigate={navigate} />;

  if (mode === "express") {
    return (
      <div className="tourist-screen gt-screen gt-plan-screen">
        <main className="gt-plan-survey">
          <PlanSurveyHeader step={step} total={5} onBack={goBack} />
          {step === 1 ? (
            <section className="gt-plan-question">
              <h1>Хто подорожує?</h1><p>Оберіть склад вашої компанії</p>
              <PlanChoiceList items={expressTravelers} selected={traveler} onSelect={setTraveler} />
              <div className="gt-plan-steppers"><PlanStepper label="Дорослі" value={adults} onChange={setAdults} /><PlanStepper label="Діти" value={children} onChange={setChildren} /></div>
              <PlanFooter onNext={() => setStep(2)} />
            </section>
          ) : step === 2 ? (
            <section className="gt-plan-question gt-plan-question--express-days">
              <h1>На скільки днів?</h1><p>Тривалість вашої подорожі</p>
              <PlanChipGroup className="gt-plan-chip-group--choice-list" items={["1 день", "2 дні", "3 дні", "4–5 днів", "Вказати дати"]} selected={days} onSelect={setDays} />
              {days === "Вказати дати" ? <PlanDateRange /> : null}
              <h2>Де ви зупинились?</h2>
              <article className="gt-plan-hotel-card"><Thumb name="hotel" /><div><strong>Гірський затишок</strong><small>вул. Незалежності, 15Б, Татарів</small><button type="button">Змінити</button></div><BadgeCheck size={22} /></article>
              <PlanFooter onNext={() => setStep(3)} />
            </section>
          ) : step === 3 ? (
            <section className="gt-plan-question">
              <h1>Який відпочинок вам підходить?</h1><p>Оберіть головний настрій подорожі</p>
              <div className="gt-plan-activity-grid">{activityChoices.map(({ label, icon: Icon }) => <button type="button" className={style === label ? "is-selected" : ""} key={label} onClick={() => setStyle(label)}><Icon size={22} /><span>{label}</span></button>)}</div>
              <h2>Як ви пересуваєтесь?</h2>
              <div className="gt-plan-transport-row">{[{ label: "Власне авто", icon: CarFront }, { label: "Таксі / трансфер", icon: Navigation }, { label: "Пішки", icon: Footprints }].map(({ label, icon: Icon }) => <button type="button" className={transport === label ? "is-selected" : ""} key={label} onClick={() => setTransport(label)}><Icon size={20} />{label}</button>)}</div>
              <PlanFooter onNext={() => setStep(4)} />
            </section>
          ) : step === 4 ? (
            <section className="gt-plan-question">
              <h1>Підсумок побажань</h1><p>Перевірте дані перед створенням плану</p>
              <div className="gt-plan-summary-list">
                <div><UsersRound /><span><small>Компанія</small><strong>{adults} дорослих · {children} дитина</strong></span></div>
                <div><CalendarDays /><span><small>Тривалість</small><strong>{days}</strong></span></div>
                <div><TentTree /><span><small>Відпочинок</small><strong>{style} · SPA · природа</strong></span></div>
                <div><CarFront /><span><small>Пересування</small><strong>{transport}</strong></span></div>
                <div><Banknote /><span><small>Бюджет</small><strong>до 5 000 ₴ / день</strong></span></div>
              </div>
              <button type="button" className="gt-plan-change"><Pencil size={17} /> Змінити відповіді</button>
              <PlanFooter label="Підібрати план" onNext={() => setStep(5)} />
              <button type="button" className="gt-plan-cancel" onClick={goHome}>Скасувати</button>
            </section>
          ) : <PlanResult onOpenPlan={() => setMode("view")} />}
        </main>
      </div>
    );
  }

  return (
    <div className="tourist-screen gt-screen gt-plan-screen">
      <main className="gt-plan-survey">
        <PlanSurveyHeader step={step} total={7} onBack={goBack} />
        {step === 1 ? (
          <section className="gt-plan-question">
            <h1>Хто подорожує?</h1><p>Розкажіть про вашу компанію</p>
            <PlanChoiceList items={expressTravelers} selected={traveler} onSelect={setTraveler} />
            <div className="gt-plan-steppers"><PlanStepper label="Дорослі" value={adults} onChange={setAdults} /><PlanStepper label="Діти" value={children} onChange={setChildren} /></div>
            <h2>Вік дітей</h2><div className="gt-plan-age-row"><button type="button">4 роки</button><button type="button">10 років</button><button type="button"><Plus size={15} /> Додати вік</button></div>
            <PlanFooter onNext={() => setStep(2)} />
          </section>
        ) : step === 2 ? (
          <section className="gt-plan-question gt-plan-question--period">
            <h1>На який період створити план?</h1><p>Оберіть тривалість та зручний час</p>
            <PlanChipGroup className="gt-plan-chip-group--choice-list" items={["1 день", "2 дні", "3 дні", "4–5 днів", "Інші дати"]} selected={days} onSelect={setDays} />
            {days === "Інші дати" ? <PlanDateRange /> : null}
            <h2>Час доби, який вам зручний</h2><PlanChipGroup items={["Ранок", "День", "Вечір"]} selected="День" onSelect={() => undefined} />
            <PlanFooter onNext={() => setStep(3)} />
          </section>
        ) : step === 3 ? (
          <section className="gt-plan-question">
            <h1>Де ви перебуваєте?</h1><p>Вкажіть точку для пошуку місць поруч</p>
            <div className="gt-plan-location"><MapPin size={22} /><span><small>Поточне місце (за QR)</small><strong>Готель «Гірський затишок»</strong><em>Татарів, вул. Незалежності, 15Б</em></span><Check size={18} /></div>
            <h2>Радіус для пошуку локацій</h2><PlanChipGroup items={["5 км", "15 км", "30 км", "50 км"]} selected={radius} onSelect={setRadius} />
            <div className="gt-plan-distance-list"><span>Татарів <b>1 км</b></span><span>Яремче <b>12 км</b></span><span>Ворохта <b>18 км</b></span><span>Микуличин <b>22 км</b></span></div>
            <PlanFooter onNext={() => setStep(4)} />
          </section>
        ) : step === 4 ? (
          <section className="gt-plan-question">
            <h1>Який відпочинок вам подобається?</h1><p>Можна обрати декілька напрямів</p>
            <div className="gt-plan-activity-grid gt-plan-activity-grid--wide">{activityChoices.concat([{ label: "Велопрогулянки", icon: Bike }, { label: "Їжа", icon: Utensils }, { label: "Екстрим", icon: Flame }]).map(({ label, icon: Icon }, index) => <button type="button" className={index === 2 || index === 3 || index === 4 ? "is-selected" : ""} key={label}><Icon size={21} /><span>{label}</span></button>)}</div>
            <h2>Що вам не подобається?</h2><div className="gt-plan-toggle-list"><label><span>Перепади висоти</span><input type="checkbox" /></label><label><span>Багатолюдні місця</span><input type="checkbox" /></label><label><span>Довгі переїзди</span><input type="checkbox" /></label></div>
            <PlanFooter onNext={() => setStep(5)} />
          </section>
        ) : step === 5 ? (
          <section className="gt-plan-question">
            <h1>Темп і активність</h1><p>Оберіть комфортний ритм подорожі</p>
            <PlanChoiceList items={[{ label: "Розслаблений", icon: Flower2 }, { label: "Збалансований", icon: Gauge }, { label: "Динамічний", icon: MountainSnow }]} selected={pace} onSelect={setPace} />
            <h2>Фізичне навантаження</h2><PlanChipGroup items={["Легке", "Помірне", "Інтенсивне"]} selected={load} onSelect={setLoad} />
            <h2>Обмеження та побажання</h2><div className="gt-plan-tag-cloud"><button type="button" className="is-selected">Маленькі діти</button><button type="button">Без крутих підйомів</button><button type="button">Без дощу</button><button type="button"><Plus size={14} /> Додати</button></div>
            <PlanFooter onNext={() => setStep(6)} />
          </section>
        ) : step === 6 ? (
          <section className="gt-plan-question">
            <h1>Транспорт і бюджет</h1><p>Останні деталі для точного підбору</p>
            <h2>Як пересуваєтесь?</h2><div className="gt-plan-transport-row gt-plan-transport-row--compact">{[{ label: "Пішки", icon: Footprints }, { label: "Авто", icon: CarFront }, { label: "Таксі", icon: Navigation }].map(({ label, icon: Icon }) => <button type="button" className={(label === "Авто" ? transport.toLowerCase().includes("авто") : transport.includes(label)) ? "is-selected" : ""} key={label} onClick={() => setTransport(label)}><Icon size={20} />{label}</button>)}</div>
            <h2>Максимальний час у дорозі</h2><PlanChipGroup className="gt-plan-chip-group--single-row" items={["до 1 год", "1–3 год", "3–5 год", "Більше 5 год"]} selected="1–3 год" onSelect={() => undefined} />
            <h2>Бюджет на день (орієнтовно)</h2>
            <div className="gt-plan-budget-grid">
              {[{ label: "Економний", value: "до 1 500 ₴" }, { label: "Середній", value: "1 500–3 500 ₴" }, { label: "Комфорт", value: "від 3 500 ₴" }].map((item) => (
                <button type="button" className={budget === item.label ? "is-selected" : ""} key={item.label} onClick={() => setBudget(item.label)}><strong>{item.label}</strong><small>{item.value}</small></button>
              ))}
            </div>
            <h2>Харчування</h2><div className="gt-plan-tag-cloud gt-plan-tag-cloud--single-row"><button type="button" className="is-selected">Місцева кухня</button><button type="button">Вегетаріанське</button><button type="button">Без обмежень</button></div>
            <PlanFooter label="Показати варіанти" onNext={() => setStep(7)} />
          </section>
        ) : <PlanResult onOpenPlan={() => setMode("view")} extended />}
      </main>
    </div>
  );
}

function WalletScreen() {
  const transactions = [
    { type: "earned", title: "Нараховано бонусів", note: "Кава у подарунок · Яремче", amount: "+30", date: "12.05.2024 · 10:15" },
    { type: "earned", title: "Нараховано бонусів", note: "Знижка на проживання · Буковель", amount: "+100", date: "11.05.2024 · 18:42" },
    { type: "spent", title: "Списано бонусів", note: "Оплата товарів · Смак Карпат", amount: "-50", date: "10.05.2024 · 14:20" },
    { type: "earned", title: "Нараховано бонусів", note: "Рафтинг · Черемош", amount: "+50", date: "09.05.2024 · 16:30" },
    { type: "spent", title: "Списано бонусів", note: "Оплата товарів · Еко-продукти", amount: "-30", date: "08.05.2024 · 11:05" },
    { type: "earned", title: "Нараховано бонусів", note: "Кава у подарунок · Яремче", amount: "+30", date: "07.05.2024 · 09:50" },
  ] as const;

  return (
    <div className="tourist-screen gt-screen gt-wallet-screen">
      <main className="gt-wallet-ledger">
        <section className="gt-wallet-balance">
          <Gift size={34} />
          <small>Ваші бонуси</small>
          <strong>320</strong>
          <span>балів</span>
        </section>
        <div className="gt-wallet-actions">
          <button type="button"><ArrowDownToLine size={24} /><span>Нарахування</span></button>
          <button type="button"><ArrowUpFromLine size={24} /><span>Списання</span></button>
        </div>
        <section className="gt-wallet-history">
          <h1>Історія операцій</h1>
          <div className="gt-wallet-transactions">
            {transactions.map((transaction, index) => (
              <article className={transaction.type === "spent" ? "is-spent" : "is-earned"} key={`${transaction.date}-${index}`}>
                <span className="gt-wallet-transaction-icon">
                  {transaction.type === "spent" ? <Minus size={23} /> : <Gift size={22} />}
                </span>
                <div>
                  <strong>{transaction.title}</strong>
                  <small>{transaction.note}</small>
                </div>
                <span className="gt-wallet-transaction-value">
                  <b>{transaction.amount}</b>
                  <small>{transaction.date}</small>
                </span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function QrScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content gt-qr-screen">
        <div className="gt-page-heading gt-page-heading--center">
          <span className="gt-tone--green"><QrCode size={25} /></span>
          <div><h1>Мій QR</h1><p>Для нарахування або списання бонусів</p></div>
        </div>
        <div className="gt-qr-panel">
          <span className="gt-pill gt-pill--success"><span /> QR активний</span>
          <MockQr />
          <strong>Покажіть код працівнику закладу</strong>
          <p>Код одноразовий і оновлюється автоматично</p>
          <div className="gt-qr-timer"><Clock3 size={18} /><span>Діє ще</span><strong>00:42</strong></div>
        </div>
        <div className="gt-notice"><ShieldCheck size={21} /><p>Не передавайте QR-код іншим. Операцію потрібно підтвердити на цьому пристрої.</p></div>
        <button type="button" className="gt-primary-button" onClick={() => navigate("tourist", "purchase-confirmation")}>Перевірити підтвердження <ChevronRight size={20} /></button>
      </main>
    </div>
  );
}

function PurchaseConfirmationScreen({ navigate }: { navigate: Navigate }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <div className="gt-page-heading">
          <span className="gt-tone--green"><ReceiptText size={23} /></span>
          <div><h1>Підтвердження</h1><p>Перевірте деталі операції</p></div>
        </div>
        <div className="gt-purchase-card">
          <Thumb name="restaurant" />
          <strong>Ресторан «Гуцульщина»</strong>
          <small>Касир: Марія · сьогодні, 18:42</small>
          <div><span>Сума покупки</span><b>860 ₴</b></div>
          <div><span>Списання бонусів</span><b>−120</b></div>
          <div><span>До сплати</span><b>740 ₴</b></div>
          <div className="is-green"><span>Буде нараховано</span><b>+37 бонусів</b></div>
        </div>
        {confirmed ? (
          <div className="gt-success-card">
            <span><Check size={24} /></span><div><strong>Операцію підтверджено</strong><p>Бонуси зʼявляться в історії після завершення операції.</p></div>
          </div>
        ) : (
          <>
            <button type="button" className="gt-primary-button" onClick={() => setConfirmed(true)}>Підтвердити операцію <Check size={20} /></button>
            <button type="button" className="gt-outline-button" onClick={() => navigate("tourist", "qr")}>Відхилити</button>
          </>
        )}
      </main>
    </div>
  );
}

function ReviewScreen() {
  const [rating, setRating] = useState(5);
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <div className="gt-page-heading">
          <span className="gt-tone--yellow"><Star size={23} /></span>
          <div><h1>Ваш відгук</h1><p>Після підтвердженого візиту</p></div>
        </div>
        <div className="gt-booking-place">
          <Thumb name="restaurant" />
          <div><strong>Ресторан «Гуцульщина»</strong><small>Операція підтверджена</small><span><BadgeCheck size={14} /> Перевірений візит</span></div>
        </div>
        <section className="gt-review-card">
          <h2>Як вам заклад?</h2>
          <div className="gt-stars">
            {[1, 2, 3, 4, 5].map((item) => (
              <button type="button" aria-label={`${item} зірок`} key={item} onClick={() => setRating(item)}>
                <Star size={34} fill={item <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <label>
            <span>Розкажіть про враження</span>
            <textarea placeholder="Що сподобалось? Що можна покращити?" />
          </label>
        </section>
        <button type="button" className="gt-primary-button">Опублікувати відгук <Send size={19} /></button>
      </main>
    </div>
  );
}

const emergencyContacts = [
  { icon: Cross, title: "Єдиний номер допомоги", note: "Поліція · швидка · рятувальники", phone: "112", tone: "red" },
  { icon: Ambulance, title: "Швидка допомога", note: "Цілодобово", phone: "103", tone: "red" },
  { icon: ShieldCheck, title: "Поліція", note: "Допомога та правопорядок", phone: "102", tone: "blue" },
  { icon: Flame, title: "ДСНС / рятувальники", note: "Пожежі · аварії · надзвичайні ситуації", phone: "101", tone: "orange" },
  { icon: MountainSnow, title: "Гірські рятувальники", note: "Яремче, найближчий пост", phone: "+380 67 342 18 68", tone: "green" },
];

const emergencyServiceIcons: Record<EmergencyService["icon"], LucideIcon> = {
  doctor: UserRound,
  pharmacy: Cross,
  repair: Wrench,
  tow: CarFront,
  vet: PawPrint,
  custom: CircleHelp,
};

function EmergencyScreen() {
  const runtime = useTouristRuntime();
  const [services, setServices] = useState(DEFAULT_EMERGENCY_SERVICES);
  const [remoteContacts, setRemoteContacts] = useState<Array<{ id: string; type: string; title: string; note: string; phone?: string | null; tone: string }>>([]);
  const [servicePage, setServicePage] = useState(0);
  const serviceScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setServices(readEmergencyServices());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!runtime.context) return;
    let cancelled = false;
    void stage2Fetch<Array<{ id: string; type: string; title: string; note: string; phone?: string | null; tone: string }>>(`/emergency?region_id=${encodeURIComponent(runtime.context.region.id)}`)
      .then((items) => { if (!cancelled) setRemoteContacts(items); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [runtime.context]);

  const fallbackContacts = emergencyContacts.map((contact) => {
    const copy: Record<string, [string, string, string, string]> = {
      "112": ["Єдиний номер допомоги", "Поліція · швидка · рятувальники", "Emergency number", "Police · ambulance · rescue"],
      "103": ["Швидка допомога", "Цілодобово", "Ambulance", "Available 24/7"],
      "102": ["Поліція", "Допомога та правопорядок", "Police", "Help and public safety"],
      "101": ["ДСНС / рятувальники", "Пожежі · аварії · надзвичайні ситуації", "Fire & rescue", "Fires · accidents · emergencies"],
      "+380 67 342 18 68": ["Гірські рятувальники", "Яремче, найближчий пост", "Mountain rescue", "Nearest rescue post"],
    };
    const item = copy[contact.phone];
    if (!item || runtime.language === "uk") return contact;
    const pl: Record<string, [string, string]> = {
      "112": ["Numer alarmowy", "Policja · pogotowie · ratownicy"],
      "103": ["Pogotowie", "Całodobowo"],
      "102": ["Policja", "Pomoc i bezpieczeństwo"],
      "101": ["Straż i ratownicy", "Pożary · wypadki · sytuacje awaryjne"],
      "+380 67 342 18 68": ["Ratownictwo górskie", "Najbliższy posterunek ratunkowy"],
    };
    const [title, note] = runtime.language === "pl" ? pl[contact.phone] : [item[2], item[3]];
    return { ...contact, title, note };
  });
  const contactRows = remoteContacts.length ? remoteContacts.map((contact) => ({
    icon: contact.type === "ambulance" ? Ambulance : contact.type === "police" ? ShieldCheck : contact.type === "rescue" ? MountainSnow : Cross,
    title: contact.title, note: contact.note, phone: contact.phone || "", tone: contact.tone,
  })) : fallbackContacts;

  const shareLocation = async () => {
    const point = await runtime.requestLocation();
    if (!point) return;
    const text = `Моя геолокація: https://maps.google.com/?q=${point.lat},${point.lng}`;
    if (navigator.share) await navigator.share({ title: "Моя геолокація", text });
    else await navigator.clipboard?.writeText(text);
  };

  const handleServiceScroll = () => {
    const element = serviceScrollerRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll <= 1) {
      setServicePage(0);
      return;
    }
    setServicePage(Math.max(0, Math.min(2, Math.round((element.scrollLeft / maxScroll) * 2))));
  };

  return (
    <div className="tourist-screen gt-screen gt-emergency">
      <div className="gt-emergency-mountains" aria-hidden="true" />
      <main className="gt-content">
        <header className="gt-emergency-head">
          <span className="gt-emergency-sos">SOS</span>
          <div>
            <h1>{tr(runtime.language, "Халепа?", "Need help?", "Potrzebujesz pomocy?")}</h1>
            <p>{tr(runtime.language, "Швидка допомога та корисні контакти", "Emergency help and useful contacts", "Pomoc awaryjna i przydatne kontakty")}</p>
          </div>
        </header>
        <section className="gt-help-hero">
          <span className="gt-help-hero__icon"><LifeBuoy size={39} /></span>
          <div><small>{tr(runtime.language, "Не хвилюйтеся", "Help is nearby", "Pomoc jest blisko")}</small><h2>{tr(runtime.language, "Знайдемо допомогу", "We’ll find help", "Znajdziemy pomoc")}</h2><p>{tr(runtime.language, "Екстрені та перевірені контакти для вашої безпеки.", "Emergency and verified contacts for your safety.", "Alarmowe i sprawdzone kontakty dla Twojego bezpieczeństwa.")}</p></div>
        </section>
        <button type="button" className="gt-location-button" onClick={() => void shareLocation()}>
          <span className="gt-location-button__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img">
              <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M24 1.5v7M24 39.5v7M1.5 24h7M39.5 24h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <g transform="translate(0 -2.2)">
                <path d="M24 14.2c-5.45 0-9.86 4.42-9.86 9.86 0 7.55 9.86 16.08 9.86 16.08s9.86-8.53 9.86-16.08c0-5.44-4.41-9.86-9.86-9.86Z" fill="currentColor" />
                <circle cx="24" cy="24" r="3.5" fill="#ffffff" />
              </g>
            </svg>
          </span>
          <span><strong>{tr(runtime.language, "Поділитися геолокацією", "Share location", "Udostępnij lokalizację")}</strong><small>{tr(runtime.language, "Надішлемо ваші координати вибраній службі.", "Share your coordinates with the selected service.", "Udostępnij współrzędne wybranej służbie.")}</small></span>
          <ChevronRight size={20} />
        </button>
        <SectionTitle title={tr(runtime.language, "Екстрені контакти", "Emergency contacts", "Kontakty alarmowe")} />
        <div className="gt-contact-list">
          {contactRows.map(({ icon: Icon, title, note, phone, tone }) => (
            <a
              className={phone.startsWith("+") ? "is-long-number" : undefined}
              href={`tel:${phone.replaceAll(" ", "")}`}
              key={title}
            >
              <span className={`gt-tone--${tone}`}><Icon size={21} /></span>
              <div><strong>{title}</strong><small>{note}</small></div>
              <b>{phone}</b><i><Phone size={17} /></i>
            </a>
          ))}
        </div>
        <SectionTitle title={tr(runtime.language, "Корисні сервіси", "Useful services", "Przydatne usługi")} />
        <div className="gt-service-mini-grid" ref={serviceScrollerRef} onScroll={handleServiceScroll}>
          {services.filter((service) => service.active).map((service) => {
            const ServiceIcon = emergencyServiceIcons[service.icon] ?? CircleHelp;
            return (
              <button type="button" className={`is-${service.tone}`} key={service.id}>
                <span className={`gt-tone--${service.tone}`}><ServiceIcon size={22} /></span>
                <strong>{service.title}</strong>
                <small>{service.note}</small>
              </button>
            );
          })}
          <button type="button" className="is-location">
            <span><MapPin size={22} /></span>
            <strong>{tr(runtime.language, "Локації", "Places", "Miejsca")}</strong>
            <small>{tr(runtime.language, "Пам’ятки та місця", "Landmarks and places", "Atrakcje i miejsca")}</small>
          </button>
        </div>
        <div className="gt-emergency-dots" aria-hidden="true">
          {[0, 1, 2].map((page) => <i className={servicePage === page ? "is-active" : undefined} key={page} />)}
        </div>
        <p className="gt-expiry"><span><Info size={16} /> {tr(runtime.language, "Контакти перевірено регіональним адміністратором", "Contacts verified by the regional administrator", "Kontakty zweryfikowane przez administratora regionalnego")}</span><b>14.07.2026</b></p>
      </main>
    </div>
  );
}

function AddLocationScreen({ navigate }: { navigate: Navigate }) {
  const [category, setCategory] = useState("Де поїсти");
  const categories: Array<{ label: string; icon: LucideIcon; tone: string }> = [
    { label: "Де поїсти", icon: Utensils, tone: "orange" },
    { label: "Де купити", icon: ShoppingBag, tone: "blue" },
    { label: "Відпочинок", icon: BedDouble, tone: "purple" },
    { label: "Розваги", icon: Bike, tone: "violet" },
    { label: "Природа", icon: MountainSnow, tone: "green" },
    { label: "Корисне", icon: Info, tone: "yellow" },
  ];

  return (
    <div className="tourist-screen gt-screen gt-add-location-screen">
      <main className="gt-content gt-add-location-content">
        <header className="gt-add-location-hero">
          <span className="gt-add-location-hero__icon"><MapPin size={28} /></span>
          <div>
            <small>Нова локація</small>
            <h1>Додати місце</h1>
            <p>Поділіться корисним місцем — після перевірки воно зʼявиться у «Гід турист».</p>
          </div>
          <em><ShieldCheck size={15} /> Модерація</em>
        </header>

        <section className="gt-add-location-section">
          <div className="gt-add-location-section__head">
            <span>1</span>
            <div><strong>Основна інформація</strong><small>Назва та категорія місця</small></div>
          </div>

          <label className="gt-add-location-field">
            <span>Назва локації <b>*</b></span>
            <input type="text" placeholder="Наприклад, оглядовий майданчик Ягідна" />
          </label>

          <div className="gt-add-location-field">
            <span>Категорія <b>*</b></span>
            <div className="gt-add-location-categories">
              {categories.map(({ label, icon: Icon, tone }) => (
                <button
                  type="button"
                  key={label}
                  className={`${category === label ? "is-active" : ""} is-${tone}`}
                  onClick={() => setCategory(label)}
                >
                  <i><Icon size={19} /></i>
                  <strong>{label}</strong>
                  {category === label ? <Check size={16} /> : null}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="gt-add-location-section">
          <div className="gt-add-location-section__head">
            <span>2</span>
            <div><strong>Де знаходиться</strong><small>Вкажіть точку та адресу</small></div>
          </div>

          <div className="gt-add-location-map-card">
            <div className="gt-add-location-map-card__map" aria-hidden="true">
              <i className="gt-add-location-map-card__river" />
              <i className="gt-add-location-map-card__road" />
              <span><MapPin size={22} /></span>
            </div>
            <div className="gt-add-location-map-card__copy">
              <strong>Позначте місце на мапі</strong>
              <small>Перетягніть точку або використайте поточну геолокацію.</small>
              <div>
                <button type="button"><LocateFixed size={17} /> Моє місце</button>
                <button type="button" onClick={() => navigate("tourist", "nearby")}><Map size={17} /> Відкрити мапу</button>
              </div>
            </div>
          </div>

          <label className="gt-add-location-field gt-add-location-field--icon">
            <MapPin size={18} />
            <span>Адреса</span>
            <input type="text" placeholder="вул., номер, населений пункт" />
          </label>
        </section>

        <section className="gt-add-location-section">
          <div className="gt-add-location-section__head">
            <span>3</span>
            <div><strong>Фото та опис</strong><small>Допоможіть туристам зрозуміти, що тут цікавого</small></div>
          </div>

          <button type="button" className="gt-add-location-upload">
            <i><Plus size={24} /></i>
            <span><strong>Додати фотографії</strong><small>До 6 фото · JPG, PNG або WEBP</small></span>
            <ChevronRight size={19} />
          </button>

          <label className="gt-add-location-field">
            <span>Короткий опис</span>
            <textarea maxLength={500} placeholder="Що варто знати про це місце, чим воно цікаве, коли краще відвідати..." />
            <small className="gt-add-location-counter">до 500 символів</small>
          </label>
        </section>

        <section className="gt-add-location-section gt-add-location-section--optional">
          <div className="gt-add-location-section__head">
            <span><Plus size={16} /></span>
            <div><strong>Контакти <em>необовʼязково</em></strong><small>Якщо місце має контакти або сайт</small></div>
          </div>
          <div className="gt-add-location-contact-grid">
            <label><Phone size={18} /><input type="tel" placeholder="Телефон" /></label>
            <label><Globe size={18} /><input type="url" placeholder="Сайт або соцмережа" /></label>
          </div>
        </section>

        <div className="gt-add-location-note">
          <Info size={18} />
          <p><strong>Перед публікацією ми перевіримо локацію.</strong><span>Це допомагає уникати дублів та некоректних місць.</span></p>
        </div>

        <button type="button" className="gt-primary-button gt-add-location-submit">
          <Send size={19} /> Надіслати на модерацію
        </button>
      </main>
    </div>
  );
}

function ProfileScreen({ navigate }: { navigate: Navigate }) {
  const runtime = useTouristRuntime();
  const name = [runtime.user?.first_name, runtime.user?.last_name].filter(Boolean).join(" ") || "Користувач Telegram";
  const username = runtime.user?.telegram_username ? `@${runtime.user.telegram_username}` : (runtime.context?.region.name || "Гід туриста");
  const languageLabel = runtime.language === "en" ? "English" : runtime.language === "pl" ? "Polski" : "Українська";

  useEffect(() => {
    if (runtime.location?.source !== "gps") void runtime.requestLocation();
  }, []);

  return (
    <div className="tourist-screen gt-screen gt-profile-screen">
      <main className="gt-content gt-profile-content">
        <h1 className="gt-simple-title">{tr(runtime.language, "Профіль", "Profile", "Profil")}</h1>
        <section className="gt-profile-card gt-profile-card--reference">
          <div className={`gt-avatar gt-avatar--photo ${runtime.user?.photo_url ? "has-photo" : ""}`} role="img" aria-label={name}>{runtime.user?.photo_url ? <img src={runtime.user.photo_url} alt={name} /> : <UserRound size={40} />}</div>
          <div><strong>{name}</strong><small><MapPin size={17} /> {username}</small></div>
        </section>
        <div className="gt-profile-list gt-profile-list--reference">
          <button type="button" className="gt-profile-row--location" onClick={() => void runtime.requestLocation()}><LocateFixed size={27} /><span>{runtime.location?.source === "gps" ? tr(runtime.language, "Геолокація дозволена", "Location enabled", "Lokalizacja włączona") : tr(runtime.language, "Надати доступ до геолокації", "Enable location", "Włącz lokalizację")}</span><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--reviews" onClick={() => navigate("tourist", "review")}><MessageSquareMore size={27} /><span>{tr(runtime.language, "Мої відгуки", "My reviews", "Moje opinie")}</span><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--favorites" onClick={() => navigate("tourist", "favorites")}><Heart size={27} /><span>{tr(runtime.language, "Улюблені", "Favorites", "Ulubione")}</span><ChevronRight size={20} /></button>
          <button type="button" onClick={() => navigate("tourist", "activity")}><Clock3 size={27} /><span>{tr(runtime.language, "Історія активності", "Activity history", "Historia aktywności")}</span><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--bonuses" onClick={() => navigate("tourist", "wallet")}><Gift size={27} /><span>{tr(runtime.language, "Бонуси", "Bonuses", "Bonusy")}</span><ChevronRight size={20} /></button>
        </div>
        <div className="gt-profile-list gt-profile-list--reference">
          <button type="button" className="gt-profile-row--language" onClick={() => navigate("tourist", "language")}><Globe size={27} /><span>{tr(runtime.language, "Мова", "Language", "Język")}</span><small>{languageLabel}</small><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--notifications"><Bell size={26} /><span>{tr(runtime.language, "Сповіщення", "Notifications", "Powiadomienia")}</span><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--support" onClick={() => navigate("tourist", "community")}><Headset size={27} /><span>{tr(runtime.language, "Підтримка / спільнота", "Support / community", "Wsparcie / społeczność")}</span><ChevronRight size={20} /></button>
        </div>
        {!runtime.user ? <div className="gt-notice"><Info size={20} /><p>{tr(runtime.language, "Профіль автоматично активується після відкриття Mini App у Telegram.", "Your profile is activated automatically when the Mini App opens in Telegram.", "Profil aktywuje się automatycznie po otwarciu Mini App w Telegramie.")}</p></div> : null}
        <button type="button" className="gt-logout gt-profile-logout"><LogOut size={25} /> {tr(runtime.language, "Вийти", "Log out", "Wyloguj")}</button>
        <button type="button" className="gt-outline-button gt-profile-edit" onClick={() => void runtime.refreshProfile()}><RefreshCcw size={20} /> {tr(runtime.language, "Оновити профіль", "Refresh profile", "Odśwież profil")}</button>
      </main>
    </div>
  );
}

function FavoritesScreen({ navigate }: { navigate: Navigate }) {
  const runtime = useTouristRuntime();
  const [places, setPlaces] = useState<Stage2Place[]>([]);
  useEffect(() => {
    let cancelled = false;
    void stage2Fetch<Stage2Place[]>("/me/favorites").then((items) => { if (!cancelled) setPlaces(items); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="tourist-screen gt-screen gt-reference-list-screen">
      <main className="gt-content">
        <div className="gt-page-heading"><span className="gt-tone--red"><Heart size={23} /></span><div><h1>{tr(runtime.language, "Улюблені", "Favorites", "Ulubione")}</h1><p>{tr(runtime.language, "Збережені місця", "Saved places", "Zapisane miejsca")}</p></div></div>
        <div className="gt-place-list">
          {places.map((place) => <PlaceRow key={place.id} photo={placePhotoFallback(place)} imageUrl={place.image_url} google={place.source === "google" || place.attributes?.google === true} googlePlaceId={googlePlaceId(place)} title={place.name} subtitle={place.subcategory ? translateKnownLabel(runtime.language, place.subcategory) : (place.category_name || tr(runtime.language, "Локація", "Place", "Miejsce"))} rating={placeRatingLabel(place)} distance="" walk="" tags={visiblePlaceTags(place)} onClick={() => { runtime.setSelectedPlace(place); navigate("tourist", "place"); }} />)}
          {!places.length ? <div className="gt-stage2-empty">{tr(runtime.language, "Ще немає збережених місць. Відкрийте картку закладу та натисніть «Зберегти».", "No saved places yet. Open a place and tap Save.", "Nie ma jeszcze zapisanych miejsc. Otwórz miejsce i wybierz Zapisz.")}</div> : null}
        </div>
      </main>
    </div>
  );
}

function ActivityScreen({ navigate }: { navigate: Navigate }) {
  const runtime = useTouristRuntime();
  const [events, setEvents] = useState<Array<{ id: string; event_type: string; place_name?: string | null; category_name?: string | null; created_at: string; payload?: Record<string, unknown> }>>([]);
  useEffect(() => {
    let cancelled = false;
    void stage2Fetch<typeof events>("/me/activity").then((items) => { if (!cancelled) setEvents(items); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  const label = (event: string) => ({
    app_opened: tr(runtime.language, "Відкрито Mini App", "Mini App opened", "Otwarto Mini App"), qr_scanned: tr(runtime.language, "Відкрито QR-контекст", "QR context opened", "Otwarto kontekst QR"), category_opened: tr(runtime.language, "Відкрито категорію", "Category opened", "Otwarto kategorię"),
    search_used: tr(runtime.language, "Використано пошук", "Search used", "Użyto wyszukiwania"), place_viewed: tr(runtime.language, "Переглянуто місце", "Place viewed", "Wyświetlono miejsce"), route_clicked: tr(runtime.language, "Побудовано маршрут", "Route opened", "Otwarto trasę"), call_clicked: tr(runtime.language, "Натиснуто дзвінок", "Call tapped", "Wybrano połączenie"),
  } as Record<string,string>)[event] || event.replaceAll("_", " ");
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <div className="gt-page-heading"><span className="gt-tone--green"><Clock3 size={23} /></span><div><h1>{tr(runtime.language, "Історія активності", "Activity history", "Historia aktywności")}</h1><p>{tr(runtime.language, "Ваші базові дії в гіді", "Your recent guide activity", "Twoja ostatnia aktywność w przewodniku")}</p></div></div>
        <div className="gt-stage2-activity-list">
          {events.map((event) => <article key={event.id}><span><Clock3 size={18} /></span><div><strong>{label(event.event_type)}</strong><small>{event.place_name || event.category_name || "Gid Tourist"}</small></div><time>{new Date(event.created_at).toLocaleDateString(runtime.language === "en" ? "en-GB" : runtime.language === "pl" ? "pl-PL" : "uk-UA", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}</time></article>)}
          {!events.length ? <div className="gt-stage2-empty">{tr(runtime.language, "Історія зʼявиться після використання пошуку, категорій і карток місць.", "History will appear after you use search, categories and place cards.", "Historia pojawi się po użyciu wyszukiwania, kategorii i kart miejsc.")}</div> : null}
        </div>
        <button type="button" className="gt-outline-button" onClick={() => navigate("tourist", "profile")}><ArrowLeft size={18} /> {tr(runtime.language, "Назад до профілю", "Back to profile", "Wróć do profilu")}</button>
      </main>
    </div>
  );
}

function LanguageScreen({ navigate }: { navigate: Navigate }) {
  const runtime = useTouristRuntime();
  const languages = [
    { code: "uk" as const, title: "Українська", note: "Основна мова" },
    { code: "en" as const, title: "English", note: "Basic interface translation" },
    { code: "pl" as const, title: "Polski", note: "Podstawowe tłumaczenie interfejsu" },
  ];
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <div className="gt-page-heading"><span className="gt-tone--blue"><Globe size={23} /></span><div><h1>{tr(runtime.language, "Мова", "Language", "Język")}</h1><p>{tr(runtime.language, "Оберіть мову Mini App", "Choose Mini App language", "Wybierz język Mini App")}</p></div></div>
        <div className="gt-profile-list gt-stage2-language-list">
          {languages.map((item) => <button type="button" key={item.code} className={runtime.language === item.code ? "is-selected" : ""} onClick={() => void runtime.setLanguage(item.code)}><Globe size={25} /><span><strong>{item.title}</strong><small>{item.note}</small></span>{runtime.language === item.code ? <Check size={21} /> : <ChevronRight size={20} />}</button>)}
        </div>
        <button type="button" className="gt-outline-button" onClick={() => navigate("tourist", "profile")}><ArrowLeft size={18} /> {tr(runtime.language, "Назад до профілю", "Back to profile", "Wróć do profilu")}</button>
      </main>
    </div>
  );
}

function CommunityScreen() {
  const { context, language } = useTouristRuntime();
  const communityUrl = context?.region.communityUrl || process.env.NEXT_PUBLIC_TELEGRAM_COMMUNITY_URL || "";
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <section className="gt-community-hero">
          <span><MessageCircle size={31} /></span>
          <small>{tr(language, "Telegram-спільнота регіону", "Regional Telegram community", "Regionalna społeczność Telegram")}</small>
          <h1>{tr(language, "Подорожуйте разом з місцевими", "Travel with locals", "Podróżuj z mieszkańcami")}</h1>
          <p>{tr(language, "Новини, маршрути, події та перевірені рекомендації регіону.", "News, routes, events and verified local recommendations.", "Aktualności, trasy, wydarzenia i sprawdzone lokalne rekomendacje.")}</p>
          <button type="button" className="gt-primary-button" disabled={!communityUrl} onClick={() => communityUrl ? window.open(communityUrl, "_blank", "noopener,noreferrer") : undefined}>{tr(language, "Відкрити спільноту", "Open community", "Otwórz społeczność")} <ExternalLink size={19} /></button>
        </section>
        <SectionTitle title={tr(language, "У спільноті ви знайдете", "In the community", "W społeczności znajdziesz")} />
        <div className="gt-community-list">
          <div><span className="gt-tone--green"><SunMedium size={22} /></span><div><strong>{tr(language, "Погода і стан маршрутів", "Weather and route conditions", "Pogoda i stan tras")}</strong><small>{tr(language, "Короткі локальні оновлення без спаму", "Short local updates without spam", "Krótkie lokalne aktualizacje bez spamu")}</small></div></div>
          <div><span className="gt-tone--purple"><TentTree size={22} /></span><div><strong>{tr(language, "Нові місця й добірки", "New places and picks", "Nowe miejsca i zestawienia")}</strong><small>{tr(language, "Перевірені редакцією рекомендації", "Editor-verified recommendations", "Rekomendacje sprawdzone przez redakcję")}</small></div></div>
          <div><span className="gt-tone--blue"><MessageCircle size={22} /></span><div><strong>{tr(language, "Допомога мандрівникам", "Traveler help", "Pomoc dla podróżnych")}</strong><small>{tr(language, "Поради від місцевих і служби підтримки", "Tips from locals and support", "Porady mieszkańców i wsparcia")}</small></div></div>
        </div>
        <div className="gt-notice"><ShieldCheck size={21} /><p>{tr(language, "Ви самі керуєте згодою на сервісні повідомлення у профілі.", "You control service-message consent in your profile.", "Zgodą na wiadomości serwisowe zarządzasz w profilu.")}</p></div>
      </main>
    </div>
  );
}

export function TouristScreen({
  slug,
  navigate,
}: {
  slug: string;
  navigate: Navigate;
}) {
  switch (slug) {
    case "welcome":
      return <HomeScreen navigate={navigate} />;
    case "home":
      return <HomeScreen navigate={navigate} />;
    case "about":
      return <AboutScreen navigate={navigate} />;
    case "about-reception":
      return <AboutInfoScreen navigate={navigate} kind="reception" />;
    case "about-wifi":
      return <AboutInfoScreen navigate={navigate} kind="wifi" />;
    case "about-rules":
      return <AboutInfoScreen navigate={navigate} kind="rules" />;
    case "about-contacts":
      return <AboutInfoScreen navigate={navigate} kind="contacts" />;
    case "hotel-services":
      return <HotelServicesScreen navigate={navigate} />;
    case "catalog":
      return <CatalogScreen navigate={navigate} />;
    case "shop":
      return <ShopScreen navigate={navigate} />;
    case "hot-offers":
      return <HotOffersScreen navigate={navigate} />;
    case "hot-offer-detail":
      return <HotOfferDetailScreen navigate={navigate} />;
    case "entertainment":
      return <EntertainmentScreen navigate={navigate} />;
    case "transfer":
      return <TransferScreen navigate={navigate} />;
    case "nearby":
      return <NearbyScreen navigate={navigate} />;
    case "place":
      return <PlaceScreen navigate={navigate} />;
    case "available":
      return <AvailableScreen navigate={navigate} />;
    case "booking":
      return <BookingScreen navigate={navigate} />;
    case "plan":
      return <PlanScreen navigate={navigate} />;
    case "wallet":
      return <WalletScreen />;
    case "qr":
      return <QrScreen navigate={navigate} />;
    case "purchase-confirmation":
      return <PurchaseConfirmationScreen navigate={navigate} />;
    case "review":
      return <ReviewScreen />;
    case "emergency":
      return <EmergencyScreen />;
    case "profile":
      return <ProfileScreen navigate={navigate} />;
    case "favorites":
      return <FavoritesScreen navigate={navigate} />;
    case "activity":
      return <ActivityScreen navigate={navigate} />;
    case "language":
      return <LanguageScreen navigate={navigate} />;
    case "add-location":
      return <AddLocationScreen navigate={navigate} />;
    case "community":
      return <CommunityScreen />;
    default:
      return <HomeScreen navigate={navigate} />;
  }
}
