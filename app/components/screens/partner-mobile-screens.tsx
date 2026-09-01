"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bike,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CircleParking,
  ClipboardList,
  Clock3,
  CigaretteOff,
  Edit3,
  GripVertical,
  Eye,
  Home,
  ImagePlus,
  Hotel,
  Image as ImageIcon,
  Info,
  Globe2,
  Mail,
  LogIn,
  LogOut,
  MapPin,
  Plus,
  Moon,
  MoreVertical,
  PawPrint,
  Phone,
  QrCode,
  RefreshCcw,
  ReceiptText,
  Search,
  SlidersHorizontal,
  Users,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UtensilsCrossed,
  WalletCards,
  Wifi,
  Waves,
  X,
  Zap,
  LockKeyhole,
} from "lucide-react";
import type { RoleKey } from "../../lib/navigation";
import { ensureTelegramSession, setSessionToken, stage2Fetch, type Stage2Category, type Stage2GeoDetails, type Stage2GeoSuggestion, type Stage2PlaceTypeTemplate } from "../../lib/stage2-api";

type Navigate = (role: RoleKey, slug: string) => void;
type PartnerProps = { navigate: Navigate; activated: boolean };

type PartnerProfile = {
  placeName: string;
  placeType: string;
  categorySlug: string;
  city: string;
  regionName: string;
  street: string;
  house: string;
  address: string;
  lat: string;
  lng: string;
  imageUrl: string;
  description: string;
  roomCount: string;
  openedYear: string;
  languages: string;
  accommodationType: string;
  wifiSsid: string;
  wifiPassword: string;
  phone: string;
  messenger: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  workMode: string;
  workHours: string;
  checkIn: string;
  checkOut: string;
  quietHours: string;
  petPolicy: string;
  cancellation: string;
  payment: string;
  otherRules: string;
  templateFields: Record<string, string>;
};

const heroImage = "/images/mountain-hotel.webp";
const PROFILE_STORAGE_KEY = "gid-tourist-partner-profile";
const ACTIVATED_STORAGE_KEY = "gid-tourist-partner-activated";

const SERVICES_STORAGE_KEY = "gid-tourist-partner-services";
const SERVICE_DRAFT_STORAGE_KEY = "gid-tourist-partner-service-draft";
const SERVICE_SELECTED_STORAGE_KEY = "gid-tourist-partner-selected-service";

type PartnerServiceAudience = "hotel" | "all";
type PartnerServicePriceType = "" | "free" | "fixed" | "from" | "range" | "request";
type PartnerServiceScheduleType = "daily" | "weekdays" | "custom";

type PartnerService = {
  id: string;
  name: string;
  category: string;
  description: string;
  audience: PartnerServiceAudience;
  active: boolean;
  hidden: boolean;
  priceType: PartnerServicePriceType;
  price: string;
  currency: string;
  scheduleType: PartnerServiceScheduleType;
  scheduleLabel: string;
  timeFrom: string;
  timeTo: string;
  phone: string;
  extraPhone: string;
  email: string;
  bookingNote: string;
  additionalInfo: string;
  amenities: string[];
  promo: boolean;
  image?: string;
  breaks?: Array<{ from: string; to: string }>;
};

const defaultServices: PartnerService[] = [
  {
    id: "breakfast",
    name: "Сніданок",
    category: "Харчування",
    description: "Сніданок для гостей готелю",
    audience: "hotel",
    active: true,
    hidden: false,
    priceType: "free",
    price: "0",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "Щодня · з 08:00 до 10:00",
    timeFrom: "08:00",
    timeTo: "10:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "info@girskyi-zatyshok.ua",
    bookingNote: "Для гостей готелю",
    additionalInfo: "Входить у вартість проживання.",
    amenities: ["Шведський стіл"],
    promo: false,
  },
  {
    id: "parking",
    name: "Паркінг",
    category: "Паркінг",
    description: "Безкоштовно для гостей",
    audience: "hotel",
    active: true,
    hidden: false,
    priceType: "free",
    price: "0",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "Безкоштовно для гостей",
    timeFrom: "00:00",
    timeTo: "24:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "info@girskyi-zatyshok.ua",
    bookingNote: "Бронювання не потрібне",
    additionalInfo: "Паркінг на території закладу.",
    amenities: ["Відеонагляд"],
    promo: false,
  },
  {
    id: "sauna",
    name: "Сауна",
    category: "Сауна та SPA",
    description: "Затишна сауна з панорамним видом на гори. Ідеальне місце для відпочинку та відновлення сил після активного дня.",
    audience: "hotel",
    active: true,
    hidden: false,
    priceType: "fixed",
    price: "800",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "Щодня · з 16:00 до 22:00",
    timeFrom: "16:00",
    timeTo: "22:00",
    phone: "+38 067 123 45 67",
    extraPhone: "+38 050 987 65 43",
    email: "info@girskyi-zatyshok.ua",
    bookingNote: "Телефон адміністратора або через рецепцію готелю.",
    additionalInfo: "Мінімальний час бронювання — 2 години. До 6 осіб одночасно.",
    amenities: ["Панорамний вид", "Душ", "Рушники", "Чай / вода", "Музика"],
    promo: true,
    image: "/images/service-sauna.webp",
  },
  {
    id: "transfer",
    name: "Трансфер",
    category: "Трансфер",
    description: "За попереднім запитом",
    audience: "hotel",
    active: true,
    hidden: false,
    priceType: "request",
    price: "",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "За попереднім запитом",
    timeFrom: "00:00",
    timeTo: "24:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "info@girskyi-zatyshok.ua",
    bookingNote: "За попереднім запитом",
    additionalInfo: "Доступні трансфери по регіону.",
    amenities: [],
    promo: false,
  },
  {
    id: "laundry",
    name: "Пральня",
    category: "Додаткові послуги",
    description: "08:00 – 20:00 · від 150 грн",
    audience: "hotel",
    active: true,
    hidden: false,
    priceType: "from",
    price: "150",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "08:00 – 20:00 · від 150 грн",
    timeFrom: "08:00",
    timeTo: "20:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "info@girskyi-zatyshok.ua",
    bookingNote: "Зверніться на рецепцію",
    additionalInfo: "Прання та сушіння речей гостей.",
    amenities: [],
    promo: false,
  },
  {
    id: "restaurant",
    name: "Ресторан",
    category: "Харчування",
    description: "08:00 – 22:00 · Середній чек 300 грн",
    audience: "all",
    active: true,
    hidden: false,
    priceType: "from",
    price: "300",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "08:00 – 22:00 · Середній чек 300 грн",
    timeFrom: "08:00",
    timeTo: "22:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "restaurant@girskyi-zatyshok.ua",
    bookingNote: "Бронювання столика телефоном",
    additionalInfo: "Карпатська та європейська кухня.",
    amenities: ["Тераса"],
    promo: true,
    image: "/images/rest-excursion.webp",
  },
  {
    id: "tub",
    name: "Чан",
    category: "Сауна та SPA",
    description: "10:00 – 22:00 · від 1500 грн",
    audience: "all",
    active: true,
    hidden: false,
    priceType: "from",
    price: "1500",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "10:00 – 22:00 · від 1500 грн",
    timeFrom: "10:00",
    timeTo: "22:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "spa@girskyi-zatyshok.ua",
    bookingNote: "Попереднє бронювання",
    additionalInfo: "Карпатський чан просто неба.",
    amenities: ["Чай / вода"],
    promo: true,
    image: "/images/service-tub.webp",
  },
  {
    id: "massage",
    name: "SPA масаж",
    category: "Сауна та SPA",
    description: "09:00 – 20:00 · від 800 грн",
    audience: "all",
    active: true,
    hidden: false,
    priceType: "from",
    price: "800",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "09:00 – 20:00 · від 800 грн",
    timeFrom: "09:00",
    timeTo: "20:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "spa@girskyi-zatyshok.ua",
    bookingNote: "За попереднім записом",
    additionalInfo: "Класичний та релакс-масаж.",
    amenities: ["Рушники", "Музика"],
    promo: false,
    image: "/images/rest-massage.webp",
  },
  {
    id: "bike-rental",
    name: "Прокат велосипедів",
    category: "Активний відпочинок",
    description: "09:00 – 18:00 · 200 грн/день",
    audience: "all",
    active: false,
    hidden: true,
    priceType: "fixed",
    price: "200",
    currency: "UAH",
    scheduleType: "daily",
    scheduleLabel: "09:00 – 18:00 · 200 грн/день",
    timeFrom: "09:00",
    timeTo: "18:00",
    phone: "+38 067 123 45 67",
    extraPhone: "",
    email: "info@girskyi-zatyshok.ua",
    bookingNote: "На рецепції",
    additionalInfo: "Прокат гірських велосипедів.",
    amenities: [],
    promo: false,
  },
];

const emptyServiceDraft: PartnerService = {
  id: "",
  name: "",
  category: "",
  description: "",
  audience: "hotel",
  active: true,
  hidden: false,
  priceType: "",
  price: "",
  currency: "UAH",
  scheduleType: "daily",
  scheduleLabel: "Щодня",
  timeFrom: "09:00",
  timeTo: "18:00",
  phone: "+38 067 123 45 67",
  extraPhone: "",
  email: "info@girskyi-zatyshok.ua",
  bookingNote: "",
  additionalInfo: "",
  amenities: [],
  promo: false,
};

function readPartnerServices(): PartnerService[] {
  if (typeof window === "undefined") return defaultServices;
  try {
    const raw = window.localStorage.getItem(SERVICES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PartnerService[]) : defaultServices;
  } catch {
    return defaultServices;
  }
}

function savePartnerServices(services: PartnerService[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
}

function readServiceDraft(): PartnerService {
  if (typeof window === "undefined") return emptyServiceDraft;
  try {
    const raw = window.localStorage.getItem(SERVICE_DRAFT_STORAGE_KEY);
    return raw ? { ...emptyServiceDraft, ...(JSON.parse(raw) as Partial<PartnerService>) } : emptyServiceDraft;
  } catch {
    return emptyServiceDraft;
  }
}

function saveServiceDraft(service: PartnerService) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SERVICE_DRAFT_STORAGE_KEY, JSON.stringify(service));
}


const defaultProfile: PartnerProfile = {
  placeName: "Гірський Затишок",
  placeType: "Готель",
  categorySlug: "hotel",
  city: "Татарів",
  regionName: "Івано-Франківська область",
  street: "вул. Незалежності",
  house: "155",
  address: "вул. Незалежності, 155, Татарів, Івано-Франківська область",
  lat: "48.34490",
  lng: "24.57920",
  imageUrl: heroImage,
  description:
    "Затишний готель у серці Карпат з видом на гори та річку. Комфортні номери, чан, сауна та відкритий басейн.",
  roomCount: "18 номерів",
  openedYear: "2018",
  languages: "Українська, English, Polski",
  accommodationType: "Готель",
  wifiSsid: "Girskyi_Zatyshok_Guest",
  wifiPassword: "zatyshok155",
  phone: "+38 067 123 45 67",
  messenger: "+38 067 123 45 67",
  email: "info@girskiy-zatyshok.ua",
  website: "girskiy-zatyshok.ua",
  instagram: "@girskyi_zatyshok",
  facebook: "facebook.com/girskiy.zatyshok",
  workMode: "Щодня",
  workHours: "00:00 - 24:00",
  checkIn: "Поселення з 14:00",
  checkOut: "Виселення до 11:00",
  quietHours: "Тихий час з 22:00 до 08:00",
  petPolicy: "Розміщення з домашніми тваринами за попереднім погодженням",
  cancellation:
    "Безкоштовне скасування бронювання можливе за 7 днів до дати заїзду. У разі пізнішого скасування стягується штраф у розмірі вартості першої доби.",
  payment:
    "Ми приймаємо готівку, банківські картки та безготівковий розрахунок.",
  otherRules:
    "Адміністрація готелю залишає за собою право змінювати правила проживання. Актуальні правила діють на момент поселення.",
  templateFields: { room_count: "18 номерів", opened_year: "2018", languages: "Українська, English, Polski", accommodation_type: "Готель" },
};

function readPartnerProfile(): PartnerProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...(JSON.parse(raw) as Partial<PartnerProfile>) };
  } catch {
    return defaultProfile;
  }
}

function savePartnerProfile(profile: PartnerProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function readPartnerActivated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ACTIVATED_STORAGE_KEY) === "true";
}

function savePartnerActivated(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVATED_STORAGE_KEY, String(value));
}

function usePartnerProfile() {
  const [profile, setProfile] = useState<PartnerProfile>(defaultProfile);

  useEffect(() => {
    setProfile(readPartnerProfile());
  }, []);

  useEffect(() => {
    savePartnerProfile(profile);
  }, [profile]);

  return { profile, setProfile };
}


const PARTNER_STAGE2_PLACE_KEY = "gid-tourist-stage2-partner-place-id";

function categoryFromPlaceType(placeType: string) {
  const value = placeType.toLocaleLowerCase("uk");
  if (/ресторан|кафе|кав|їж|food|пі/.test(value)) return "food";
  if (/магаз|сувен|аптек|shop/.test(value)) return "shop";
  if (/чан|саун|басейн|spa|масаж|відпоч/.test(value)) return "rest";
  if (/розваг|квадро|рафт|зіп|джип|entertain/.test(value)) return "entertainment";
  if (/трансфер|таксі|оренда авто|transfer/.test(value)) return "transfer";
  return "hotel";
}

async function submitPartnerProfile(profile: PartnerProfile) {
  await ensureTelegramSession();
  const existingId = typeof window !== "undefined" ? window.localStorage.getItem(PARTNER_STAGE2_PLACE_KEY) : null;
  const hours = profile.workHours.match(/(\d{2}:\d{2}).*?(\d{2}:\d{2})/);
  const payload = {
    city: profile.city,
    region_name: profile.regionName,
    category_slug: profile.categorySlug || categoryFromPlaceType(profile.placeType),
    subcategory: profile.placeType,
    name: profile.placeName,
    organization_name: profile.placeName,
    description: profile.description,
    address: profile.address,
    lat: Number(profile.lat) || 48.34535,
    lng: Number(profile.lng) || 24.57855,
    phone: profile.phone,
    telegram: profile.messenger.startsWith("http") ? profile.messenger : undefined,
    website: profile.website.startsWith("http") ? profile.website : profile.website ? `https://${profile.website}` : undefined,
    image_url: profile.imageUrl || heroImage,
    work_hours: profile.workMode.toLocaleLowerCase("uk").includes("цілодоб") ? { always_open: true } : hours ? { daily: { from: hours[1], to: hours[2] } } : {},
    attributes: { partner: true, parking: true, wifi: Boolean(profile.wifiSsid) },
    details: {
      check_in: profile.checkIn.match(/\d{2}:\d{2}/)?.[0] || "14:00",
      check_out: profile.checkOut.match(/\d{2}:\d{2}/)?.[0] || "11:00",
      wifi_ssid: profile.wifiSsid,
      wifi_password: profile.wifiPassword,
      rules: [profile.quietHours, profile.petPolicy, profile.cancellation, profile.payment, profile.otherRules].filter(Boolean),
      room_count: profile.roomCount,
      opened_year: profile.openedYear,
      languages: profile.languages,
      accommodation_type: profile.accommodationType,
      email: profile.email,
      instagram: profile.instagram,
      facebook: profile.facebook,
      city: profile.city,
      region_name: profile.regionName,
      street: profile.street,
      house: profile.house,
      services: readPartnerServices(),
      template_fields: profile.templateFields,
    },
  };

  if (existingId) {
    try {
      return await stage2Fetch<{ id: string; status?: string }>(`/partner/places/${encodeURIComponent(existingId)}`, { method: "PATCH", body: JSON.stringify(payload) });
    } catch {
      window.localStorage.removeItem(PARTNER_STAGE2_PLACE_KEY);
    }
  }
  const created = await stage2Fetch<{ id: string; status?: string }>("/partner/onboarding", { method: "POST", body: JSON.stringify(payload) });
  if (typeof window !== "undefined") window.localStorage.setItem(PARTNER_STAGE2_PLACE_KEY, created.id);
  return created;
}

function PartnerHeader({
  title,
  navigate,
  back,
  nextLabel,
  onNext,
  showMenu = false,
  backLabel,
}: {
  title: string;
  navigate: Navigate;
  back?: string;
  nextLabel?: string;
  onNext?: () => void;
  showMenu?: boolean;
  backLabel?: string;
}) {
  return (
    <header className="gt-partner-header">
      {backLabel ? (
        <button
          type="button"
          className="gt-partner-header__back-text"
          onClick={() => (back ? navigate("partner", back) : history.back())}
        >
          {backLabel}
        </button>
      ) : (
        <button
          type="button"
          className="gt-partner-header__button"
          aria-label="Назад"
          onClick={() => (back ? navigate("partner", back) : history.back())}
        >
          <ArrowLeft size={23} />
        </button>
      )}
      <strong>{title}</strong>
      {showMenu ? (
        <button type="button" className="gt-partner-header__button" aria-label="Меню">
          <MoreVertical size={23} />
        </button>
      ) : nextLabel ? (
        <button type="button" className="gt-partner-header__text-action" onClick={onNext}>
          {nextLabel}
        </button>
      ) : (
        <span className="gt-partner-header__spacer" />
      )}
    </header>
  );
}

type PartnerBottomNavKey = "home" | "info" | "stats" | "qr" | "settlements" | "profile";
type PartnerBottomNavItem = readonly [
  key: PartnerBottomNavKey,
  label: string,
  icon: typeof Home,
  slug: string,
];

function PartnerBottomNav({
  active,
  activated,
  navigate,
}: {
  active: "home" | "info" | "stats" | "profile" | "settlements";
  activated: boolean;
  navigate: Navigate;
}) {
  const items: readonly PartnerBottomNavItem[] = activated
    ? [
        ["home", "Головна", Home, "partner-dashboard"],
        ["stats", "Статистика", BarChart3, "partner-statistics"],
        ["qr", "QR", QrCode, "scanner"],
        ["settlements", "Взаєморозрахунки", WalletCards, "partner-finance"],
        ["profile", "Профіль", UserRound, "place-editor"],
      ]
    : [
        ["home", "Головна", Home, "partner-dashboard"],
        ["info", "Інфо", Info, "partner-info"],
        ["stats", "Статистика", BarChart3, "partner-statistics"],
        ["profile", "Профіль", UserRound, "place-editor"],
      ];

  return (
    <nav className={`gt-partner-bottom-nav ${activated ? "is-final" : ""}`}>
      {items.map(([key, label, Icon, slug]) => {
        const isQr = key === "qr";
        return (
          <button
            key={key}
            type="button"
            className={`${active === key ? "is-active" : ""} ${isQr ? "is-qr" : ""}`}
            onClick={() => navigate("partner", slug)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function LogoCard() {
  return (
    <div className="gt-partner-logo-card">
      <div className="gt-partner-logo-card__icon">
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M6 28L18.5 12L26 20.5L31.5 14L36 19V28" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.5 27L23.5 10L34.5 23" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.5 31H37.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
        </svg>
      </div>
      <strong>ГІРСЬКИЙ<br />ЗАТИШОК</strong>
      <small>ГОТЕЛЬ</small>
    </div>
  );
}

function Hero({ showCopy = true, cabinet = false }: { showCopy?: boolean; cabinet?: boolean }) {
  return (
    <section className={`gt-partner-hero ${cabinet ? "is-cabinet" : ""}`}>
      <img src={heroImage} alt="Гірський Затишок" />
      <LogoCard />
      {showCopy ? (
        <div className="gt-partner-hero__copy">
          <h1>{cabinet ? "Кабінет партнера" : "Стати партнером"}</h1>
          {!cabinet ? (
            <p>
              Рекламуйте послуги свого закладу
              <br />в Gid Tourist та залучайте нових клієнтів.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function MenuListCard({
  items,
  navigate,
}: {
  items: Array<{ slug: string; icon: typeof Building2; title: string; note: string }>;
  navigate: Navigate;
}) {
  return (
    <div className="gt-partner-list-card">
      {items.map(({ slug, icon: Icon, title, note }) => (
        <button type="button" key={slug} onClick={() => navigate("partner", slug)}>
          <span className="gt-partner-list-icon">
            <Icon size={23} />
          </span>
          <span className="gt-partner-list-copy">
            <strong>{title}</strong>
            <small>{note}</small>
          </span>
          <ChevronRight size={21} />
        </button>
      ))}
    </div>
  );
}

const basicMenuItems = [
  {
    slug: "partner-info",
    icon: Building2,
    title: "Інформація про заклад",
    note: "Фото, опис, зручності та контактні дані",
  },
  {
    slug: "partner-rules",
    icon: ClipboardList,
    title: "Правила проживання",
    note: "Додати або змінити правила для гостей",
  },
  {
    slug: "partner-wifi",
    icon: Wifi,
    title: "Wi‑Fi",
    note: "Назва мережі та пароль для гостей",
  },
  {
    slug: "partner-contacts",
    icon: Phone,
    title: "Контакти",
    note: "Телефони, email та інші способи зв’язку",
  },
  {
    slug: "partner-statistics",
    icon: BarChart3,
    title: "Статистика переходів",
    note: "Перегляди закладу та дії гостей у додатку",
  },
];

function PartnerStartScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Стати партнером" navigate={navigate} showMenu />
      <main className="gt-partner-mobile-content">
        <Hero />
        <section className="gt-partner-join-card">
          <div className="gt-partner-join-card__main">
            <span>
              <Sparkles size={23} />
            </span>
            <div>
              <strong>Долучайтеся до партнерської мережі</strong>
              <p>
                Підвищуйте впізнаваність закладу, отримуйте
                більше гостей і збільшуйте прибуток разом з нами.
              </p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("partner", "partner-info")}>
            Дізнатися більше
          </button>
          <small>
            Про можливості партнерства <ChevronRight size={15} />
          </small>
        </section>

        <MenuListCard items={basicMenuItems} navigate={navigate} />

        <button type="button" className="gt-partner-refresh" onClick={() => navigate("partner", "partner-update")}>
          <RefreshCcw size={18} /> Оновити інформацію
        </button>
      </main>
      <PartnerBottomNav active="home" activated={false} navigate={navigate} />
    </div>
  );
}

function FormCard({ children }: { children: ReactNode }) {
  return <div className="gt-partner-form-card">{children}</div>;
}

function InputRow({
  label,
  value,
  onChange,
  multiline = false,
  rightIcon,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  multiline?: boolean;
  rightIcon?: ReactNode;
}) {
  return (
    <label className={`gt-partner-input-row ${multiline ? "is-multiline" : ""}`}>
      <span className="gt-partner-input-row__content">
        <small>{label}</small>
        {multiline ? (
          <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
        ) : (
          <input value={value} onChange={(event) => onChange(event.target.value)} />
        )}
      </span>
      <i>{rightIcon ?? <Edit3 size={16} />}</i>
    </label>
  );
}

function buildAddress(profile: Pick<PartnerProfile, "city" | "regionName" | "street" | "house">) {
  return [profile.street, profile.house, profile.city, profile.regionName].map((item) => item.trim()).filter(Boolean).join(", ");
}

async function resizePartnerImage(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const item = new Image();
    item.onload = () => resolve(item);
    item.onerror = reject;
    item.src = dataUrl;
  });
  const maxWidth = 1280;
  const maxHeight = 900;
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function AddressAutocompleteRow({
  label,
  value,
  mode,
  city,
  street,
  onText,
  onSelect,
}: {
  label: string;
  value: string;
  mode: "city" | "street" | "house";
  city?: string;
  street?: string;
  onText: (value: string) => void;
  onSelect: (details: Stage2GeoDetails, suggestion: Stage2GeoSuggestion) => void;
}) {
  const [suggestions, setSuggestions] = useState<Stage2GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value.trim().length < 2 || (mode !== "city" && !city)) { setSuggestions([]); return; }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ input: value.trim(), mode });
      if (city) params.set("city", city);
      if (street) params.set("street", street);
      void stage2Fetch<Stage2GeoSuggestion[]>(`/geo/autocomplete?${params}`).then((items) => {
        if (!cancelled) { setSuggestions(items); setOpen(true); }
      }).catch(() => { if (!cancelled) setSuggestions([]); }).finally(() => { if (!cancelled) setLoading(false); });
    }, 260);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [value, mode, city, street]);

  const choose = async (suggestion: Stage2GeoSuggestion) => {
    setOpen(false);
    try {
      const details = await stage2Fetch<Stage2GeoDetails>(`/geo/place/${encodeURIComponent(suggestion.place_id)}`);
      onSelect(details, suggestion);
    } catch {
      onText(suggestion.main_text || suggestion.text);
    }
  };

  return (
    <label className="gt-partner-input-row gt-partner-address-autocomplete">
      <span className="gt-partner-input-row__content">
        <small>{label}</small>
        <input value={value} autoComplete="off" onFocus={() => suggestions.length && setOpen(true)} onChange={(event) => onText(event.target.value)} />
        {open && suggestions.length ? (
          <span className="gt-partner-address-suggestions">
            {suggestions.map((item) => (
              <button type="button" key={item.place_id} onMouseDown={(event) => event.preventDefault()} onClick={() => void choose(item)}>
                <strong>{item.main_text || item.text}</strong><small>{item.secondary_text}</small>
              </button>
            ))}
          </span>
        ) : null}
      </span>
      <i>{loading ? <RefreshCcw size={15} className="gt-spin" /> : <MapPin size={16} />}</i>
    </label>
  );
}

function serviceFromTemplate(name: string, index: number): PartnerService {
  return {
    ...emptyServiceDraft,
    id: `template-${Date.now()}-${index}`,
    name,
    category: /снідан|меню|кава|десерт|їжа/i.test(name) ? "Харчування" : /саун|чан|масаж|басейн|spa/i.test(name) ? "Сауна та SPA" : /паркін/i.test(name) ? "Паркінг" : /трансфер|таксі|авто/i.test(name) ? "Трансфер" : "Додаткові послуги",
    description: name,
    active: true,
    hidden: false,
  };
}

function applyTemplateServices(template?: Stage2PlaceTypeTemplate) {
  if (!template?.default_services?.length) return;
  savePartnerServices(template.default_services.map(serviceFromTemplate));
}

function AmenitiesRow({ onClick }: { onClick?: () => void }) {
  const amenities = [
    { icon: Hotel, label: "Готель" },
    { icon: BedDouble, label: "Номери" },
    { icon: ShieldCheck, label: "Сауна" },
    { icon: MapPin, label: "Паркінг" },
    { icon: Wifi, label: "Wi‑Fi" },
  ];

  return (
    <button type="button" className="gt-amenities-row" onClick={onClick}>
      <span>Послуги</span>
      <div>
        {amenities.map(({ icon: Icon, label }) => (
          <small key={label} title={label}>
            <Icon size={15} />
          </small>
        ))}
      </div>
      <i>
        <Edit3 size={16} />
      </i>
    </button>
  );
}

function PartnerInfoScreen({ navigate, activated }: PartnerProps) {
  const { profile, setProfile } = usePartnerProfile();
  const [stage2Categories, setStage2Categories] = useState<Stage2Category[]>([]);
  const [placeTemplates, setPlaceTemplates] = useState<Stage2PlaceTypeTemplate[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const goBack = activated ? "partner-cabinet" : "partner-dashboard";

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      stage2Fetch<Stage2Category[]>("/categories"),
      stage2Fetch<Stage2PlaceTypeTemplate[]>("/place-type-templates"),
    ]).then(([items, templates]) => {
      if (!cancelled) {
        setStage2Categories(items.filter((item) => item.slug !== "emergency"));
        setPlaceTemplates(templates);
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const activeTemplate = placeTemplates.find((item) => item.category_slug === profile.categorySlug && item.place_type === profile.placeType);
  const activeTemplateFields = Object.entries(activeTemplate?.fields ?? {}).filter(([, label]) => typeof label === "string" && String(label).trim());

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader
        title="Інформація про заклад"
        navigate={navigate}
        back={goBack}
        nextLabel="Далі"
        onNext={() => navigate("partner", "partner-rules")}
      />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <section className="gt-partner-photo-editor">
          <img src={profile.imageUrl || heroImage} alt="Фото закладу" />
          <input ref={photoInputRef} className="gt-visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void resizePartnerImage(file).then((imageUrl) => setProfile((prev) => ({ ...prev, imageUrl })));
            event.currentTarget.value = "";
          }} />
          <button type="button" onClick={() => photoInputRef.current?.click()}>
            <ImageIcon size={16} /> Змінити фото
          </button>
        </section>

        <FormCard>
          <InputRow
            label="Назва закладу"
            value={profile.placeName}
            onChange={(placeName) => setProfile((prev) => ({ ...prev, placeName }))}
          />
          {stage2Categories.length ? (
            <>
              <label className="gt-partner-input-row">
                <span className="gt-partner-input-row__content">
                  <small>Розділ у гіді</small>
                  <select value={profile.categorySlug || categoryFromPlaceType(profile.placeType)} onChange={(event) => {
                    const slug = event.target.value;
                    const template = placeTemplates.find((item) => item.category_slug === slug);
                    const category = stage2Categories.find((item) => item.slug === slug);
                    const fallback = category?.subcategories?.[0];
                    const placeType = template?.place_type || fallback || (slug === "hotel" ? "Готель" : profile.placeType);
                    applyTemplateServices(template);
                    setProfile((prev) => ({ ...prev, categorySlug: slug, placeType }));
                  }}>
                    {stage2Categories.map((item) => <option key={item.slug} value={item.slug}>{item.slug === "hotel" ? "Готель / точка входу" : item.name}</option>)}
                  </select>
                </span>
                <i><ChevronRight size={16} /></i>
              </label>
              {(placeTemplates.filter((item) => item.category_slug === profile.categorySlug).length || stage2Categories.find((item) => item.slug === profile.categorySlug)?.subcategories?.length) ? (
                <label className="gt-partner-input-row">
                  <span className="gt-partner-input-row__content">
                    <small>Тип закладу</small>
                    <select value={profile.placeType} onChange={(event) => {
                      const placeType = event.target.value;
                      const template = placeTemplates.find((item) => item.category_slug === profile.categorySlug && item.place_type === placeType);
                      applyTemplateServices(template);
                      setProfile((prev) => ({ ...prev, placeType }));
                    }}>
                      {(placeTemplates.filter((item) => item.category_slug === profile.categorySlug).length
                        ? placeTemplates.filter((item) => item.category_slug === profile.categorySlug).map((item) => ({ value: item.place_type, label: item.label }))
                        : (stage2Categories.find((item) => item.slug === profile.categorySlug)?.subcategories || []).map((item) => ({ value: item, label: item })))
                        .map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </span>
                  <i><ChevronRight size={16} /></i>
                </label>
              ) : (
                <InputRow label="Тип закладу" value={profile.placeType} onChange={(placeType) => setProfile((prev) => ({ ...prev, placeType }))} />
              )}
            </>
          ) : (
            <InputRow
              label="Тип закладу"
              value={profile.placeType}
              onChange={(placeType) => setProfile((prev) => ({ ...prev, placeType, categorySlug: categoryFromPlaceType(placeType) }))}
              rightIcon={<ChevronRight size={16} />}
            />
          )}
          <AddressAutocompleteRow
            label="Місто" mode="city" value={profile.city}
            onText={(city) => setProfile((prev) => ({ ...prev, city, address: buildAddress({ ...prev, city }) }))}
            onSelect={(details, suggestion) => setProfile((prev) => { const city = details.city || suggestion.main_text; const regionName = details.region || prev.regionName; return { ...prev, city, regionName, street: "", house: "", lat: String(details.lat || prev.lat), lng: String(details.lng || prev.lng), address: buildAddress({ ...prev, city, regionName, street: "", house: "" }) }; })}
          />
          <AddressAutocompleteRow
            label="Вулиця" mode="street" value={profile.street} city={profile.city}
            onText={(street) => setProfile((prev) => ({ ...prev, street, address: buildAddress({ ...prev, street }) }))}
            onSelect={(details, suggestion) => setProfile((prev) => { const street = details.street || suggestion.main_text; return { ...prev, street, house: "", lat: String(details.lat || prev.lat), lng: String(details.lng || prev.lng), address: buildAddress({ ...prev, street, house: "" }) }; })}
          />
          <AddressAutocompleteRow
            label="Будинок" mode="house" value={profile.house} city={profile.city} street={profile.street}
            onText={(house) => setProfile((prev) => ({ ...prev, house, address: buildAddress({ ...prev, house }) }))}
            onSelect={(details, suggestion) => setProfile((prev) => { const house = details.house || suggestion.main_text; const city = details.city || prev.city; const regionName = details.region || prev.regionName; const street = details.street || prev.street; return { ...prev, city, regionName, street, house, lat: String(details.lat || prev.lat), lng: String(details.lng || prev.lng), address: details.formatted_address || buildAddress({ ...prev, city, regionName, street, house }) }; })}
          />
          <InputRow
            label="Опис"
            value={profile.description}
            onChange={(description) => setProfile((prev) => ({ ...prev, description }))}
            multiline
          />
          <AmenitiesRow onClick={() => navigate("partner", "partner-services")} />
          {activeTemplateFields.length ? activeTemplateFields.map(([key, label]) => (
            <InputRow
              key={`${profile.categorySlug}-${profile.placeType}-${key}`}
              label={String(label)}
              value={profile.templateFields[key] ?? ""}
              onChange={(value) => setProfile((prev) => ({ ...prev, templateFields: { ...prev.templateFields, [key]: value } }))}
            />
          )) : (
            <>
              <InputRow label="Кількість номерів" value={profile.roomCount} onChange={(roomCount) => setProfile((prev) => ({ ...prev, roomCount }))} />
              <InputRow label="Рік відкриття" value={profile.openedYear} onChange={(openedYear) => setProfile((prev) => ({ ...prev, openedYear }))} />
              <InputRow label="Мови обслуговування" value={profile.languages} onChange={(languages) => setProfile((prev) => ({ ...prev, languages }))} />
              <InputRow label="Тип розміщення" value={profile.accommodationType} onChange={(accommodationType) => setProfile((prev) => ({ ...prev, accommodationType }))} />
            </>
          )}
        </FormCard>
      </main>
      <PartnerBottomNav active="info" activated={activated} navigate={navigate} />
    </div>
  );
}

function RuleLine({
  icon: Icon,
  value,
  onChange,
}: {
  icon: typeof Clock3;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="gt-partner-rule-line">
      <Icon size={17} />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={value.length > 45 ? 2 : 1}
      />
      <Edit3 size={16} />
    </label>
  );
}

function PaymentLogos() {
  return (
    <div className="gt-payment-logos" aria-label="Підтримувані способи оплати">
      <span className="gt-payment-logo gt-payment-logo--visa" aria-label="Visa">
        <svg viewBox="0 0 76 26" role="img" aria-hidden="true">
          <text x="5" y="20" fontSize="20" fontWeight="900" fontStyle="italic" fontFamily="Arial Black, Arial, sans-serif">VISA</text>
        </svg>
      </span>
      <span className="gt-payment-logo gt-payment-logo--mastercard" aria-label="Mastercard">
        <svg viewBox="0 0 78 28" role="img" aria-hidden="true">
          <circle cx="31" cy="14" r="10.5" fill="#EB001B" />
          <circle cx="45" cy="14" r="10.5" fill="#F79E1B" />
          <path d="M38 5.8a10.5 10.5 0 0 1 0 16.4 10.5 10.5 0 0 1 0-16.4Z" fill="#FF5F00" />
        </svg>
      </span>
      <span className="gt-payment-logo gt-payment-logo--gpay" aria-label="Google Pay">
        <svg viewBox="0 0 82 28" role="img" aria-hidden="true">
          <text x="5" y="20" fontSize="18" fontWeight="800" fontFamily="Arial, sans-serif">
            <tspan fill="#4285F4">G</tspan><tspan fill="#3C4043"> Pay</tspan>
          </text>
        </svg>
      </span>
    </div>
  );
}

function RulesScreen({ navigate, activated }: PartnerProps) {
  const { profile, setProfile } = usePartnerProfile();
  const goBack = activated ? "partner-info" : "partner-info";

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader
        title="Правила проживання"
        navigate={navigate}
        back={goBack}
        nextLabel="Далі"
        onNext={() => navigate("partner", "partner-wifi")}
      />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <h3 className="gt-partner-section-title">Загальні правила</h3>
        <FormCard>
          <RuleLine
            icon={LogIn}
            value={profile.checkIn}
            onChange={(checkIn) => setProfile((prev) => ({ ...prev, checkIn }))}
          />
          <RuleLine
            icon={LogOut}
            value={profile.checkOut}
            onChange={(checkOut) => setProfile((prev) => ({ ...prev, checkOut }))}
          />
          <RuleLine
            icon={CigaretteOff}
            value="Куріння заборонено в приміщеннях готелю"
            onChange={() => undefined}
          />
          <RuleLine
            icon={Moon}
            value={profile.quietHours}
            onChange={(quietHours) => setProfile((prev) => ({ ...prev, quietHours }))}
          />
          <RuleLine
            icon={PawPrint}
            value={profile.petPolicy}
            onChange={(petPolicy) => setProfile((prev) => ({ ...prev, petPolicy }))}
          />
        </FormCard>

        <section className="gt-partner-text-section">
          <strong>Скасування бронювання</strong>
          <textarea
            value={profile.cancellation}
            onChange={(event) => setProfile((prev) => ({ ...prev, cancellation: event.target.value }))}
            rows={4}
          />
        </section>

        <section className="gt-partner-text-section gt-payment-section">
          <strong>Оплата</strong>
          <textarea
            value={profile.payment}
            onChange={(event) => setProfile((prev) => ({ ...prev, payment: event.target.value }))}
            rows={2}
          />
          <PaymentLogos />
        </section>

        <section className="gt-partner-text-section is-last">
          <strong>Інші умови</strong>
          <textarea
            value={profile.otherRules}
            onChange={(event) => setProfile((prev) => ({ ...prev, otherRules: event.target.value }))}
            rows={4}
          />
        </section>
      </main>
      <PartnerBottomNav active="info" activated={activated} navigate={navigate} />
    </div>
  );
}

function WifiScreen({ navigate, activated }: PartnerProps) {
  const { profile, setProfile } = usePartnerProfile();
  const [showPassword, setShowPassword] = useState(true);

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-wifi-screen">
      <PartnerHeader
        title="Wi‑Fi"
        navigate={navigate}
        back="partner-rules"
        nextLabel="Далі"
        onNext={() => navigate("partner", "partner-contacts")}
      />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-wifi-hero">
          <span>
            <Wifi size={56} />
          </span>
          <strong>Безкоштовний Wi‑Fi для гостей</strong>
        </div>

        <FormCard>
          <InputRow
            label="Назва мережі (SSID)"
            value={profile.wifiSsid}
            onChange={(wifiSsid) => setProfile((prev) => ({ ...prev, wifiSsid }))}
          />
          <label className="gt-partner-input-row">
            <span className="gt-partner-input-row__content">
              <small>Пароль</small>
              <input
                type={showPassword ? "text" : "password"}
                value={profile.wifiPassword}
                onChange={(event) => setProfile((prev) => ({ ...prev, wifiPassword: event.target.value }))}
              />
            </span>
            <div className="gt-inline-actions">
              <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                <Eye size={16} />
              </button>
              <Edit3 size={16} />
            </div>
          </label>
        </FormCard>

        <div className="gt-partner-tip-box">
          <strong>Поради для підключення</strong>
          <ul>
            <li>Переконайтеся, що Wi‑Fi увімкнено на вашому пристрої.</li>
            <li>Якщо підключення не вдається, спробуйте перезавантажити пристрій.</li>
            <li>Зверніться до адміністрації у разі проблем.</li>
          </ul>
        </div>
      </main>
      <PartnerBottomNav active="info" activated={activated} navigate={navigate} />
    </div>
  );
}

function ContactRow({
  icon: Icon,
  brandIcons,
  label,
  value,
  onChange,
  iconClassName,
}: {
  icon?: typeof Phone;
  brandIcons?: Array<{ src: string; alt: string }>;
  label: string;
  value: string;
  onChange: (next: string) => void;
  iconClassName?: string;
}) {
  return (
    <label className="gt-contact-edit-row">
      <span className={`gt-contact-edit-row__icon ${iconClassName ?? ""}`}>
        {brandIcons ? (
          <span className="gt-contact-brand-icons">
            {brandIcons.map(({ src, alt }) => (
              <img key={src} src={src} alt={alt} />
            ))}
          </span>
        ) : Icon ? (
          <Icon size={27} />
        ) : null}
      </span>
      <span className="gt-contact-edit-row__copy">
        <small>{label}</small>
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
      <i>
        <Edit3 size={20} />
      </i>
    </label>
  );
}

function ContactsScreen({ navigate, activated, onActivate }: PartnerProps & { onActivate: () => void }) {
  const { profile, setProfile } = usePartnerProfile();

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-contact-page">
      <PartnerHeader
        title="Контакти"
        navigate={navigate}
        back="partner-wifi"
        nextLabel="Зберегти"
        onNext={() => {
          void submitPartnerProfile(profile).then((place) => {
            if (place.status === "approved") onActivate();
            navigate("partner", place.status === "approved" ? "partner-cabinet" : "partner-pending");
          }).catch(() => navigate("partner", "partner-pending"));
        }}
      />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-contact-page-content">
        <section className="gt-contact-edit-card">
          <ContactRow
            icon={Phone}
            label="Телефон"
            value={profile.phone}
            onChange={(phone) => setProfile((prev) => ({ ...prev, phone }))}
            iconClassName="is-green"
          />
          <ContactRow
            brandIcons={[{ src: "/icons/viber.svg", alt: "Viber" }]}
            label="Viber / Telegram"
            value={profile.messenger}
            onChange={(messenger) => setProfile((prev) => ({ ...prev, messenger }))}
          />
          <ContactRow
            icon={Mail}
            label="Email"
            value={profile.email}
            onChange={(email) => setProfile((prev) => ({ ...prev, email }))}
            iconClassName="is-green"
          />
          <ContactRow
            icon={Globe2}
            label="Сайт"
            value={profile.website}
            onChange={(website) => setProfile((prev) => ({ ...prev, website }))}
            iconClassName="is-green"
          />
          <ContactRow
            brandIcons={[{ src: "/icons/instagram.svg", alt: "Instagram" }]}
            label="Instagram"
            value={profile.instagram}
            onChange={(instagram) => setProfile((prev) => ({ ...prev, instagram }))}
          />
          <ContactRow
            brandIcons={[{ src: "/icons/facebook.svg", alt: "Facebook" }]}
            label="Facebook"
            value={profile.facebook}
            onChange={(facebook) => setProfile((prev) => ({ ...prev, facebook }))}
          />
          <ContactRow
            icon={MapPin}
            label="Адреса"
            value={profile.address}
            onChange={(address) => setProfile((prev) => ({ ...prev, address }))}
            iconClassName="is-green"
          />
        </section>

        <section className="gt-contact-hours-panel">
          <div className="gt-contact-hours-panel__head">
            <span>Режим роботи</span>
            <Edit3 size={20} />
          </div>
          <div className="gt-contact-hours-panel__body">
            <label>
              <input
                value={profile.workMode}
                onChange={(event) => setProfile((prev) => ({ ...prev, workMode: event.target.value }))}
              />
            </label>
            <label>
              <input
                value={profile.workHours}
                onChange={(event) => setProfile((prev) => ({ ...prev, workHours: event.target.value }))}
              />
            </label>
          </div>
        </section>
      </main>
      <PartnerBottomNav active="info" activated={activated} navigate={navigate} />
    </div>
  );
}

type PartnerStatisticsTab = "general" | "clients" | "services";

const statisticsClients = [
  { initials: "ІП", name: "Іван Петренко", operations: 5, total: "2 450 ₴", commission: "123 ₴" },
  { initials: "МК", name: "Марія Коваль", operations: 3, total: "1 800 ₴", commission: "90 ₴" },
  { initials: "ОБ", name: "Олександр Бондар", operations: 2, total: "1 350 ₴", commission: "68 ₴" },
  { initials: "АШ", name: "Анна Шевченко", operations: 2, total: "980 ₴", commission: "49 ₴" },
  { initials: "ДР", name: "Дмитро Романюк", operations: 1, total: "750 ₴", commission: "38 ₴" },
  { initials: "НМ", name: "Наталія Мельник", operations: 1, total: "620 ₴", commission: "31 ₴" },
  { initials: "ЮГ", name: "Юрій Гнатюк", operations: 1, total: "540 ₴", commission: "27 ₴" },
  { initials: "ІК", name: "Ірина Климчук", operations: 1, total: "510 ₴", commission: "26 ₴" },
  { initials: "ВТ", name: "Василь Ткачук", operations: 1, total: "460 ₴", commission: "23 ₴" },
];

const statisticsServices = [
  { name: "Чан", operations: 56, total: "9 450 ₴", commission: "473 ₴", image: "/images/service-tub.webp" },
  { name: "Сауна", operations: 34, total: "6 120 ₴", commission: "306 ₴", image: "/images/service-sauna.webp" },
  { name: "Ресторан", operations: 28, total: "5 680 ₴", commission: "284 ₴", image: "/images/rest-excursion.webp" },
  { name: "SPA масаж", operations: 14, total: "2 650 ₴", commission: "133 ₴", image: "/images/rest-massage.webp" },
  { name: "Прокат велосипедів", operations: 8, total: "2 080 ₴", commission: "104 ₴", image: "/images/service-bikes.webp" },
  { name: "Пральня", operations: 6, total: "1 240 ₴", commission: "62 ₴", image: "/images/travel-thumbnails.webp" },
  { name: "Басейн", operations: 5, total: "980 ₴", commission: "49 ₴", image: "/images/service-pool.webp" },
];

function StatisticsDateFilter() {
  return (
    <button type="button" className="gt-stat-date-filter">
      <CalendarDays size={16} />
      <span>10 – 17 липня 2026</span>
      <ChevronRight size={14} className="gt-stat-date-filter__arrow" />
    </button>
  );
}

function StatisticMetricCard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change?: string;
}) {
  return (
    <article className="gt-stat-metric-card">
      <small>{title}</small>
      <strong>{value}</strong>
      {change ? <span>↑ {change}</span> : null}
    </article>
  );
}

function StatisticsGeneralTab() {
  return (
    <>
      <h3 className="gt-stat-section-heading">Ключові показники</h3>
      <section className="gt-stat-metric-grid">
        <StatisticMetricCard title="Переходи на сторінку" value="1 248" change="18% до попереднього тижня" />
        <StatisticMetricCard title="Реальні клієнти" value="328" change="18% до попереднього тижня" />
        <StatisticMetricCard title="Операції (сканування QR)" value="146" change="22% до попереднього тижня" />
        <StatisticMetricCard title="Сума операцій" value="24 560 ₴" change="20% до попереднього тижня" />
        <StatisticMetricCard title="Комісія Gid Tourist" value="1 228 ₴" change="5% від суми операцій" />
      </section>

      <section className="gt-stat-line-block">
        <h3 className="gt-stat-section-heading">Динаміка переходів</h3>
        <div className="gt-stat-line-chart">
          <svg viewBox="0 0 340 142" role="img" aria-label="Динаміка переходів за тиждень">
            <g className="gt-stat-chart-grid">
              <line x1="38" y1="18" x2="332" y2="18" />
              <line x1="38" y1="48" x2="332" y2="48" />
              <line x1="38" y1="78" x2="332" y2="78" />
              <line x1="38" y1="108" x2="332" y2="108" />
            </g>
            <g className="gt-stat-chart-ylabels">
              <text x="1" y="22">1500</text>
              <text x="1" y="52">1200</text>
              <text x="10" y="82">600</text>
              <text x="16" y="112">300</text>
              <text x="24" y="134">0</text>
            </g>
            <polyline
              className="gt-stat-chart-line"
              points="50,108 94,100 138,63 182,92 226,62 270,81 324,28"
              fill="none"
            />
            <g className="gt-stat-chart-points">
              {[
                [50, 108], [94, 100], [138, 63], [182, 92], [226, 62], [270, 81], [324, 28],
              ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />)}
            </g>
          </svg>
          <div className="gt-stat-chart-days">
            <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Нд</span>
          </div>
        </div>
      </section>

      <section className="gt-stat-summary-block">
        <h3 className="gt-stat-section-heading">Підсумки за період</h3>
        <div className="gt-stat-summary-list">
          <div><Search size={16} /><span>Переходи на сторінку</span><strong>1 248</strong></div>
          <div><Users size={16} /><span>Реальні клієнти</span><strong>328</strong></div>
          <div><QrCode size={16} /><span>Операції (сканування QR)</span><strong>146</strong></div>
          <div><WalletCards size={16} /><span>Загальна вартість операцій</span><strong>24 560 ₴</strong></div>
          <div><ReceiptText size={16} /><span>Комісія Gid Tourist</span><strong>1 228 ₴</strong></div>
        </div>
      </section>
    </>
  );
}

function StatisticsClientsTab() {
  const [showAll, setShowAll] = useState(false);
  const visibleClients = showAll ? statisticsClients : statisticsClients.slice(0, 7);

  return (
    <div className="gt-stat-clients-tab">
      <section className="gt-stat-client-metrics">
        <StatisticMetricCard title="Реальні клієнти" value="328" change="18%" />
        <StatisticMetricCard title="Нові клієнти" value="86" change="18%" />
        <StatisticMetricCard title="Повернулися" value="242" change="14%" />
      </section>

      <section className="gt-stat-table-section gt-stat-clients-section">
        <div className="gt-stat-section-title-row">
          <h3 className="gt-stat-section-heading">Список клієнтів</h3>
          <button type="button" className="gt-stat-filter-button"><SlidersHorizontal size={15} /> Фільтри</button>
        </div>
        <div className="gt-stat-client-table">
          <div className="gt-stat-client-table__head">
            <span>Клієнт</span><span>Операції</span><span>Сума операцій</span><span>Комісія</span>
          </div>
          {visibleClients.map((client) => (
            <div className="gt-stat-client-table__row" key={client.name}>
              <span className="gt-stat-client-name"><i>{client.initials}</i><b>{client.name}</b></span>
              <span>{client.operations}</span>
              <span>{client.total}</span>
              <span>{client.commission}</span>
            </div>
          ))}
        </div>
        <button type="button" className="gt-stat-show-all" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Показати основних клієнтів" : "Показати всіх клієнтів"}<ChevronRight size={17} />
        </button>
      </section>

      <section className="gt-stat-segmentation">
        <h3 className="gt-stat-section-heading">Сегментація клієнтів</h3>
        <div className="gt-stat-donut-layout">
          <div className="gt-stat-donut gt-stat-donut--clients"><span><strong>328</strong><small>клієнтів</small></span></div>
          <div className="gt-stat-donut-legend">
            <div><i className="is-blue" /><span>Нові</span><strong>86 (26%)</strong></div>
            <div><i className="is-green" /><span>Повернулися</span><strong>242 (74%)</strong></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatisticsServicesTab() {
  const [showAll, setShowAll] = useState(false);
  const visibleServices = showAll ? statisticsServices : statisticsServices.slice(0, 6);

  return (
    <>
      <article className="gt-stat-top-service">
        <div><small>Найпопулярніша послуга</small><strong>Чан</strong><span>56 операцій</span></div>
        <img src="/images/service-tub.webp" alt="Чан" />
      </article>

      <section className="gt-stat-table-section gt-stat-services-section">
        <h3 className="gt-stat-section-heading">Популярні послуги</h3>
        <div className="gt-stat-services-table">
          <div className="gt-stat-services-table__head">
            <span>Послуга</span><span>Операції</span><span>Сума операцій</span><span>Комісія</span>
          </div>
          {visibleServices.map((service) => (
            <div className="gt-stat-services-table__row" key={service.name}>
              <span className="gt-stat-service-name"><img src={service.image} alt="" /><b>{service.name}</b></span>
              <span>{service.operations}</span>
              <span>{service.total}</span>
              <span>{service.commission}</span>
            </div>
          ))}
        </div>
        <button type="button" className="gt-stat-show-all" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Показати основні послуги" : "Показати всі послуги"}<ChevronRight size={17} />
        </button>
      </section>

      <section className="gt-stat-categories">
        <h3 className="gt-stat-section-heading">Категорії послуг</h3>
        <div className="gt-stat-donut-layout">
          <div className="gt-stat-donut gt-stat-donut--services"><span><strong>146</strong><small>операцій</small></span></div>
          <div className="gt-stat-donut-legend gt-stat-donut-legend--categories">
            <div><i className="is-dark-green" /><span>Де поїсти</span><strong>70 (48%)</strong></div>
            <div><i className="is-green" /><span>Де купити</span><strong>28 (19%)</strong></div>
            <div><i className="is-sky" /><span>Розваги</span><strong>22 (15%)</strong></div>
            <div><i className="is-gray" /><span>Інше</span><strong>26 (18%)</strong></div>
          </div>
        </div>
      </section>
    </>
  );
}


function moderationPendingText(placeType: string) {
  const lower = placeType.trim().toLocaleLowerCase("uk");
  if (lower.includes("кафе")) return "Після підтвердження адміністрацією ваше кафе буде активним у відповідному розділі гіда та на карті.";
  if (lower.includes("готел")) return "Після підтвердження адміністрацією ваш готель буде активним у відповідному розділі гіда та на карті.";
  if (lower.includes("ресторан")) return "Після підтвердження адміністрацією ваш ресторан буде активним у відповідному розділі гіда та на карті.";
  if (lower.includes("магаз")) return "Після підтвердження адміністрацією ваш магазин буде активним у відповідному розділі гіда та на карті.";
  return `Після підтвердження адміністрацією ваш заклад (${placeType || "обраний тип"}) буде активним у відповідному розділі гіда та на карті.`;
}

function PartnerPendingScreen({ navigate, onActivate }: { navigate: Navigate; onActivate: () => void }) {
  const { profile } = usePartnerProfile();
  const [status, setStatus] = useState<"loading" | "pending" | "approved" | "rejected" | "error">("loading");
  const [comment, setComment] = useState("");

  const refresh = async () => {
    setStatus("loading");
    try {
      await ensureTelegramSession();
      const places = await stage2Fetch<Array<{ id: string; status: string; moderation_comment?: string | null }>>("/partner/places");
      const placeId = typeof window !== "undefined" ? window.localStorage.getItem(PARTNER_STAGE2_PLACE_KEY) : null;
      const place = places.find((item) => item.id === placeId) ?? places[0];
      if (!place) { setStatus("error"); return; }
      setComment(place.moderation_comment || "");
      if (place.status === "approved") {
        onActivate();
        setStatus("approved");
      } else if (place.status === "rejected") setStatus("rejected");
      else setStatus("pending");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Модерація закладу" navigate={navigate} back="partner-info" />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <section className="gt-partner-status-card">
          <span>{status === "approved" ? <Check size={30} /> : status === "rejected" ? <X size={30} /> : <Clock3 size={30} />}</span>
          <div>
            <strong>{status === "approved" ? "Заклад схвалено" : status === "rejected" ? "Потрібне доопрацювання" : status === "error" ? "Не вдалося перевірити статус" : "Заклад на модерації"}</strong>
            <small>{comment || (status === "approved" ? "Заклад підтверджено адміністрацією та активовано у відповідному розділі гіда і на карті." : moderationPendingText(profile.placeType))}</small>
          </div>
        </section>
        <button type="button" className="gt-partner-primary-button" onClick={() => status === "approved" ? navigate("partner", "partner-cabinet") : void refresh()}>{status === "approved" ? "Відкрити кабінет" : "Оновити статус"}</button>
        {status === "rejected" ? <button type="button" className="gt-partner-secondary-button" onClick={() => navigate("partner", "partner-info")}>Виправити дані</button> : null}
      </main>
      <PartnerBottomNav active="info" activated={status === "approved"} navigate={navigate} />
    </div>
  );
}

function StatisticsScreen({ navigate, activated }: PartnerProps) {
  const [tab, setTab] = useState<PartnerStatisticsTab>("general");

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav gt-partner-stats-screen">
      <PartnerHeader title="Статистика" navigate={navigate} back="partner-dashboard" />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-statistics-page">
        <div className="gt-stat-main-tabs">
          <button type="button" className={tab === "general" ? "is-active" : ""} onClick={() => setTab("general")}>Загальна</button>
          <button type="button" className={tab === "clients" ? "is-active" : ""} onClick={() => setTab("clients")}>Клієнти</button>
          <button type="button" className={tab === "services" ? "is-active" : ""} onClick={() => setTab("services")}>Послуги</button>
        </div>

        <div className="gt-stat-date-wrap"><StatisticsDateFilter /></div>

        {tab === "general" ? <StatisticsGeneralTab /> : null}
        {tab === "clients" ? <StatisticsClientsTab /> : null}
        {tab === "services" ? <StatisticsServicesTab /> : null}
      </main>
      <PartnerBottomNav active="stats" activated={activated} navigate={navigate} />
    </div>
  );
}

function UpdateScreen({ navigate, activated }: PartnerProps) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Оновити інформацію" navigate={navigate} back="partner-dashboard" />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-update-notice">
          <Info size={24} />
          <p>
            Підтримуйте інформацію актуальною,
            щоб гості завжди отримували
            достовірні дані про ваш заклад.
          </p>
        </div>

        <div className="gt-update-list">
          <strong>Що можна оновити</strong>
          <ul>
            <li>Фото закладу та номерів</li>
            <li>Опис та інформацію</li>
            <li>Послуги та зручності</li>
            <li>Правила проживання</li>
            <li>Контактні дані</li>
            <li>Ціни та спеціальні пропозиції</li>
          </ul>
        </div>

        <button type="button" className="gt-partner-refresh gt-partner-refresh--large" onClick={() => navigate("partner", "partner-dashboard")}>
          <RefreshCcw size={18} /> Оновити зараз
        </button>

        <div className="gt-last-update">
          <CalendarDays size={20} />
          <span>
            <small>Останнє оновлення</small>
            <strong>12 травня 2024, 14:30</strong>
          </span>
        </div>
      </main>
      <PartnerBottomNav active="home" activated={activated} navigate={navigate} />
    </div>
  );
}

function CabinetScreen({ navigate }: { navigate: Navigate }) {
  const items = [
    {
      slug: "partner-services",
      icon: Hotel,
      title: "Послуги закладу",
      note: "Додавайте та керуйте послугами вашого закладу",
    },
    {
      slug: "partner-info",
      icon: Building2,
      title: "Інформація про заклад",
      note: "Фото, опис, зручності та контактні дані",
    },
    {
      slug: "partner-rules",
      icon: ClipboardList,
      title: "Правила проживання",
      note: "Додати або змінити правила для гостей",
    },
    {
      slug: "partner-wifi",
      icon: Wifi,
      title: "Wi‑Fi",
      note: "Назва мережі та пароль для гостей",
    },
    {
      slug: "partner-contacts",
      icon: Phone,
      title: "Контакти",
      note: "Телефони, email та інші способи зв’язку",
    },
    {
      slug: "partner-checkin",
      icon: Clock3,
      title: "Час заїзду-виїзду",
      note: "Налаштуйте час заїзду та виїзду для гостей",
    },
  ];

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-cabinet-screen">
      <main className="gt-partner-mobile-content gt-partner-cabinet-content">
        <Hero showCopy={false} cabinet />
        <div className="gt-partner-cabinet-list">
          {items.map(({ slug, icon: Icon, title, note }) => (
            <button type="button" key={slug} onClick={() => navigate("partner", slug)}>
              <span className="gt-partner-list-icon">
                <Icon size={23} />
              </span>
              <span className="gt-partner-list-copy">
                <strong>{title}</strong>
                <small>{note}</small>
              </span>
              <ChevronRight size={21} />
            </button>
          ))}
        </div>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}


function usePartnerServices() {
  const [services, setServices] = useState<PartnerService[]>(defaultServices);

  useEffect(() => {
    setServices(readPartnerServices());
  }, []);

  const updateServices = (next: PartnerService[] | ((current: PartnerService[]) => PartnerService[])) => {
    setServices((current) => {
      const value = typeof next === "function" ? next(current) : next;
      savePartnerServices(value);
      return value;
    });
  };

  return { services, setServices: updateServices };
}

function ServiceSwitch({ checked, onChange, disabled = false }: { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={`gt-service-switch ${checked ? "is-on" : ""}`}
      aria-pressed={checked}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
    >
      <span />
    </button>
  );
}

function serviceIconFor(category: string) {
  if (category.includes("Харч")) return UtensilsCrossed;
  if (category.includes("SPA") || category.includes("Сауна")) return Waves;
  if (category.includes("Паркінг")) return CircleParking;
  if (category.includes("Трансфер")) return LogIn;
  if (category.includes("Актив")) return Bike;
  return Hotel;
}

function ServiceThumbnail({ service }: { service: PartnerService }) {
  if (service.image) {
    return <img className="gt-service-thumbnail" src={service.image} alt="" />;
  }
  const Icon = serviceIconFor(service.category);
  return (
    <span className="gt-service-thumbnail gt-service-thumbnail--icon">
      <Icon size={21} />
    </span>
  );
}

function ServicesScreen({ navigate }: { navigate: Navigate }) {
  const { services, setServices } = usePartnerServices();
  const activated = readPartnerActivated();
  const [audience, setAudience] = useState<PartnerServiceAudience>("hotel");
  const visibleServices = services.filter((service) => !service.hidden && service.audience === audience);
  const hiddenServices = services.filter((service) => service.hidden);

  const openEdit = (service: PartnerService) => {
    window.localStorage.setItem(SERVICE_SELECTED_STORAGE_KEY, service.id);
    navigate("partner", "partner-service-edit");
  };

  const startAdd = () => {
    saveServiceDraft({ ...emptyServiceDraft, audience });
    navigate("partner", "partner-service-add");
  };

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-services-page">
      <PartnerHeader title="Послуги закладу" navigate={navigate} back={activated ? "partner-dashboard" : "partner-info"} />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-services-content">
        <button type="button" className="gt-services-add-link" onClick={startAdd}>
          <Plus size={17} /> Додати послугу
        </button>

        <div className="gt-services-tabs" role="tablist">
          <button type="button" className={audience === "hotel" ? "is-active" : ""} onClick={() => setAudience("hotel")}>
            Для гостей закладу
          </button>
          <button type="button" className={audience === "all" ? "is-active" : ""} onClick={() => setAudience("all")}>
            Для всіх гостей
          </button>
        </div>

        <section className="gt-services-list">
          {visibleServices.map((service) => (
            <div
              className="gt-service-list-row"
              key={service.id}
              role="button"
              tabIndex={0}
              onClick={() => openEdit(service)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") openEdit(service);
              }}
            >
              <ServiceThumbnail service={service} />
              <span className="gt-service-list-row__copy">
                <strong>{service.name}</strong>
                <small>{service.scheduleLabel || service.description}</small>
              </span>
              <ServiceSwitch
                checked={service.active}
                onChange={(active) => setServices((current) => current.map((item) => item.id === service.id ? { ...item, active } : item))}
              />
              <GripVertical className="gt-service-drag" size={17} />
            </div>
          ))}
        </section>

        <button type="button" className="gt-hidden-services-row" onClick={() => navigate("partner", "partner-services-hidden")}>
          <span>Приховані послуги ({hiddenServices.length})</span>
          <ChevronRight size={17} />
        </button>
      </main>
      <PartnerBottomNav active={activated ? "home" : "info"} activated={activated} navigate={navigate} />
    </div>
  );
}

function HiddenServicesScreen({ navigate }: { navigate: Navigate }) {
  const { services, setServices } = usePartnerServices();
  const hiddenServices = services.filter((service) => service.hidden);

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-services-page">
      <PartnerHeader title="Сховані послуги" navigate={navigate} back="partner-services" />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-services-content">
        <section className="gt-services-list gt-services-list--compact">
          {hiddenServices.map((service) => (
            <div className="gt-service-list-row" key={service.id}>
              <ServiceThumbnail service={service} />
              <span className="gt-service-list-row__copy">
                <strong>{service.name}</strong>
                <small>{service.scheduleLabel || service.description}</small>
              </span>
              <ServiceSwitch
                checked={!service.hidden}
                onChange={() => setServices((current) => current.map((item) => item.id === service.id ? { ...item, hidden: false, active: true } : item))}
              />
            </div>
          ))}
          {hiddenServices.length === 0 ? <div className="gt-services-empty">Немає схованих послуг</div> : null}
        </section>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

function ServiceRadioCard({
  title,
  description,
  checked,
  onClick,
}: {
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`gt-service-radio-card ${checked ? "is-selected" : ""}`} onClick={onClick}>
      <span className="gt-service-radio-dot">{checked ? <i /> : null}</span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}

function ServiceField({
  label,
  value,
  placeholder,
  onChange,
  multiline = false,
  counter,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  counter?: number;
}) {
  return (
    <label className={`gt-service-field ${multiline ? "is-multiline" : ""}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} placeholder={placeholder} maxLength={counter} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} placeholder={placeholder} maxLength={counter} onChange={(event) => onChange(event.target.value)} />
      )}
      {counter ? <small>{value.length}/{counter}</small> : null}
    </label>
  );
}

function ServiceSelectRow({ label, value, placeholder, onClick }: { label: string; value: string; placeholder: string; onClick: () => void }) {
  return (
    <button type="button" className="gt-service-select-row" onClick={onClick}>
      <span>
        <small>{label}</small>
        <strong className={!value ? "is-placeholder" : ""}>{value || placeholder}</strong>
      </span>
      <ChevronRight size={17} />
    </button>
  );
}

function AddServiceScreen({ navigate }: { navigate: Navigate }) {
  const [draft, setDraft] = useState<PartnerService>(emptyServiceDraft);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    setDraft(readServiceDraft());
  }, []);

  useEffect(() => {
    saveServiceDraft(draft);
  }, [draft]);

  const save = () => {
    const services = readPartnerServices();
    const id = `service-${Date.now()}`;
    const next: PartnerService = {
      ...draft,
      id,
      name: draft.name.trim() || "Нова послуга",
      category: draft.category || "Додаткові послуги",
      scheduleLabel: draft.scheduleLabel || "Щодня",
      image: preview || draft.image,
    };
    savePartnerServices([...services, next]);
    window.localStorage.removeItem(SERVICE_DRAFT_STORAGE_KEY);
    window.localStorage.setItem(SERVICE_SELECTED_STORAGE_KEY, id);
    navigate("partner", "partner-services");
  };

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-editor-page">
      <PartnerHeader title="Додати послугу" navigate={navigate} back="partner-services" backLabel="Скасувати" nextLabel="Зберегти" onNext={save} />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-editor-content">
        <h3 className="gt-service-section-title">Основна інформація</h3>

        <label className="gt-service-photo-add">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : "");
              reader.readAsDataURL(file);
            }}
          />
          {preview ? <img src={preview} alt="Фото послуги" /> : <Camera size={24} />}
          <span>
            <strong>Додайте фото</strong>
            <small>Додайте одне або більше фото послуги</small>
          </span>
        </label>

        <ServiceField label="Назва послуги" value={draft.name} counter={100} onChange={(name) => setDraft((current) => ({ ...current, name }))} />
        <ServiceSelectRow label="Категорія" value={draft.category} placeholder="Оберіть категорію" onClick={() => navigate("partner", "partner-service-category")} />
        <ServiceField label="Опис послуги" value={draft.description} counter={500} multiline onChange={(description) => setDraft((current) => ({ ...current, description }))} />

        <h3 className="gt-service-section-title">Тип послуги</h3>
        <div className="gt-service-radio-stack">
          <ServiceRadioCard
            title="Для гостей закладу"
            description="Доступна лише для тих, хто проживає у вашому закладі"
            checked={draft.audience === "hotel"}
            onClick={() => setDraft((current) => ({ ...current, audience: "hotel" }))}
          />
          <ServiceRadioCard
            title="Для всіх гостей"
            description="Послуга буде показана всім користувачам Gid Tourist"
            checked={draft.audience === "all"}
            onClick={() => setDraft((current) => ({ ...current, audience: "all" }))}
          />
        </div>

        <h3 className="gt-service-section-title">Ціна послуги</h3>
        <ServiceSelectRow
          label="Тип ціни"
          value={priceTypeLabel(draft.priceType)}
          placeholder="Оберіть тип ціни"
          onClick={() => navigate("partner", "partner-service-price-type")}
        />
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

function priceTypeLabel(type: PartnerServicePriceType) {
  const labels: Record<PartnerServicePriceType, string> = {
    "": "",
    free: "Безкоштовно",
    fixed: "Фіксована ціна",
    from: "Від",
    range: "Діапазон цін",
    request: "За запитом",
  };
  return labels[type];
}

const serviceCategories = [
  ["Харчування", UtensilsCrossed],
  ["Сауна та SPA", Waves],
  ["Активний відпочинок", Bike],
  ["Трансфер", LogIn],
  ["Паркінг", CircleParking],
  ["Додаткові послуги", Sparkles],
] as const;

function CategorySelectScreen({ navigate }: { navigate: Navigate }) {
  const select = (category: string) => {
    const draft = readServiceDraft();
    saveServiceDraft({ ...draft, category });
    navigate("partner", "partner-service-add");
  };

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-options-page">
      <PartnerHeader title="Категорія послуги" navigate={navigate} back="partner-service-add" />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-options-content">
        <section className="gt-service-option-list">
          {serviceCategories.map(([category, Icon]) => (
            <button type="button" key={category} onClick={() => select(category)}>
              <Icon size={19} />
              <span>{category}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </section>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

const priceTypeOptions: Array<[PartnerServicePriceType, string, string]> = [
  ["free", "Безкоштовно", "Послуга надається безкоштовно"],
  ["fixed", "Фіксована ціна", "Одна ціна за всю послугу"],
  ["from", "Від", "Вкажіть ціну від"],
  ["range", "Діапазон цін", "Вкажіть мінімальну та максимальну ціну"],
  ["request", "За запитом", "Ціна узгоджується при бронюванні"],
];

function PriceTypeScreen({ navigate }: { navigate: Navigate }) {
  const [selected, setSelected] = useState<PartnerServicePriceType>(readServiceDraft().priceType);

  const choose = (priceType: PartnerServicePriceType) => {
    setSelected(priceType);
    const draft = readServiceDraft();
    saveServiceDraft({ ...draft, priceType });
    navigate("partner", "partner-service-add");
  };

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-options-page">
      <PartnerHeader title="Тип ціни" navigate={navigate} back="partner-service-add" />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-options-content">
        <div className="gt-service-radio-stack gt-service-radio-stack--plain">
          {priceTypeOptions.map(([value, title, description]) => (
            <ServiceRadioCard key={value} title={title} description={description} checked={selected === value} onClick={() => choose(value)} />
          ))}
        </div>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

function readSelectedService() {
  const id = typeof window === "undefined" ? "sauna" : window.localStorage.getItem(SERVICE_SELECTED_STORAGE_KEY) || "sauna";
  return readPartnerServices().find((service) => service.id === id) ?? defaultServices.find((service) => service.id === "sauna")!;
}

function EditServiceScreen({ navigate }: { navigate: Navigate }) {
  const [service, setService] = useState<PartnerService>(() => defaultServices.find((item) => item.id === "sauna")!);

  useEffect(() => {
    setService(readSelectedService());
  }, []);

  const persist = (next: PartnerService) => {
    setService(next);
    savePartnerServices(readPartnerServices().map((item) => item.id === next.id ? next : item));
  };

  const save = () => {
    persist(service);
    navigate("partner", "partner-services");
  };

  const remove = () => {
    savePartnerServices(readPartnerServices().filter((item) => item.id !== service.id));
    navigate("partner", "partner-services");
  };

  const images = [service.image || "/images/service-sauna.webp", "/images/service-pool.webp", "/images/service-tub.webp"];

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-editor-page">
      <PartnerHeader title="Редагування послуги" navigate={navigate} back="partner-services" nextLabel="Зберегти" onNext={save} />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-editor-content">
        <h3 className="gt-service-section-title">Фото послуги</h3>
        <div className="gt-service-photo-grid">
          {images.map((image, index) => <img src={image} key={`${image}-${index}`} alt="" />)}
          <button type="button"><ImagePlus size={22} /><small>Додати<br />фото</small></button>
        </div>
        <p className="gt-service-photo-hint">Перетягніть фото, щоб змінити порядок</p>

        <ServiceField label="Назва послуги" value={service.name} onChange={(name) => setService((current) => ({ ...current, name }))} />
        <ServiceSelectRow label="Категорія" value={service.category} placeholder="Оберіть категорію" onClick={() => {
          savePartnerServices(readPartnerServices().map((item) => item.id === service.id ? service : item));
          navigate("partner", "partner-service-edit-category");
        }} />
        <ServiceField label="Опис послуги" value={service.description} multiline counter={500} onChange={(description) => setService((current) => ({ ...current, description }))} />

        <h3 className="gt-service-section-title">Тип послуги</h3>
        <div className="gt-service-radio-stack">
          <ServiceRadioCard title="Для гостей закладу" description="Доступна лише для тих, хто проживає у вашому закладі" checked={service.audience === "hotel"} onClick={() => setService((current) => ({ ...current, audience: "hotel" }))} />
          <ServiceRadioCard title="Для всіх гостей" description="Послуга буде показана всім користувачам Gid Tourist" checked={service.audience === "all"} onClick={() => setService((current) => ({ ...current, audience: "all" }))} />
        </div>

        <div className="gt-service-toggle-block">
          <span><strong>Реклама послуги</strong><small>Показувати послугу всім користувачам Gid Tourist</small></span>
          <ServiceSwitch checked={service.promo} onChange={(promo) => setService((current) => ({ ...current, promo }))} />
        </div>

        <h3 className="gt-service-section-title">Ціна послуги</h3>
        <ServiceSelectRow label="Тип ціни" value={priceTypeLabel(service.priceType)} placeholder="Оберіть тип ціни" onClick={() => {
          savePartnerServices(readPartnerServices().map((item) => item.id === service.id ? service : item));
          saveServiceDraft(service);
          navigate("partner", "partner-service-edit-price-type");
        }} />
        {service.priceType !== "free" && service.priceType !== "request" ? (
          <div className="gt-service-inline-fields">
            <ServiceField label="Ціна" value={service.price} onChange={(price) => setService((current) => ({ ...current, price }))} />
            <ServiceField label="Валюта" value={service.currency} onChange={(currency) => setService((current) => ({ ...current, currency }))} />
          </div>
        ) : null}

        <h3 className="gt-service-section-title">Графік роботи</h3>
        <ServiceSelectRow label="Тип графіку" value={service.scheduleType === "daily" ? "Щодня" : service.scheduleType === "weekdays" ? "По днях тижня" : "Вибрані дні"} placeholder="Оберіть графік" onClick={() => {
          savePartnerServices(readPartnerServices().map((item) => item.id === service.id ? service : item));
          saveServiceDraft(service);
          navigate("partner", "partner-service-schedule-type");
        }} />
        <div className="gt-service-inline-fields">
          <ServiceField label="Час роботи" value={service.timeFrom} onChange={(timeFrom) => setService((current) => ({ ...current, timeFrom }))} />
          <ServiceField label="До" value={service.timeTo} onChange={(timeTo) => setService((current) => ({ ...current, timeTo }))} />
        </div>
        {service.breaks?.map((item, index) => (
          <div className="gt-service-break-row" key={`${item.from}-${item.to}-${index}`}>
            <span>Перерва {item.from} – {item.to}</span>
            <button type="button" onClick={() => setService((current) => ({ ...current, breaks: current.breaks?.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={14} /></button>
          </div>
        ))}
        <button type="button" className="gt-service-add-subrow" onClick={() => {
          savePartnerServices(readPartnerServices().map((item) => item.id === service.id ? service : item));
          saveServiceDraft(service);
          navigate("partner", "partner-service-break");
        }}><Plus size={15} /> Додати перерву</button>

        <h3 className="gt-service-section-title">Контакти для бронювання</h3>
        <ServiceField label="Телефон" value={service.phone} onChange={(phone) => setService((current) => ({ ...current, phone }))} />
        <ServiceField label="Додатковий телефон" value={service.extraPhone} onChange={(extraPhone) => setService((current) => ({ ...current, extraPhone }))} />
        <ServiceField label="Email" value={service.email} onChange={(email) => setService((current) => ({ ...current, email }))} />
        <ServiceField label="Як забронювати" value={service.bookingNote} multiline counter={200} onChange={(bookingNote) => setService((current) => ({ ...current, bookingNote }))} />
        <ServiceField label="Додаткова інформація" value={service.additionalInfo} multiline counter={300} onChange={(additionalInfo) => setService((current) => ({ ...current, additionalInfo }))} />

        <h3 className="gt-service-section-title">Зручності</h3>
        <div className="gt-service-chips">
          {service.amenities.map((amenity) => (
            <button type="button" key={amenity} onClick={() => setService((current) => ({ ...current, amenities: current.amenities.filter((item) => item !== amenity) }))}>{amenity} ×</button>
          ))}
        </div>
        <button type="button" className="gt-service-add-subrow" onClick={() => setService((current) => ({ ...current, amenities: current.amenities.includes("Wi‑Fi") ? current.amenities : [...current.amenities, "Wi‑Fi"] }))}><Plus size={15} /> Додати зручність</button>

        <h3 className="gt-service-section-title">Статус послуги</h3>
        <div className="gt-service-status-list">
          <div><span><strong>Активна</strong></span><ServiceSwitch checked={service.active} onChange={(active) => setService((current) => ({ ...current, active }))} /></div>
          <div><span><strong>Приховати послугу</strong><small>Послуга не буде відображатися гостям</small></span><ServiceSwitch checked={service.hidden} onChange={(hidden) => setService((current) => ({ ...current, hidden }))} /></div>
        </div>

        <button type="button" className="gt-service-delete" onClick={remove}><Trash2 size={16} /> Видалити послугу</button>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}


function EditCategorySelectScreen({ navigate }: { navigate: Navigate }) {
  const selectedService = readSelectedService();
  const select = (category: string) => {
    const current = readSelectedService();
    const next = { ...current, category };
    savePartnerServices(readPartnerServices().map((item) => item.id === next.id ? next : item));
    navigate("partner", "partner-service-edit");
  };

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-options-page">
      <PartnerHeader title="Категорія послуги" navigate={navigate} back="partner-service-edit" />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-options-content">
        <section className="gt-service-option-list">
          {serviceCategories.map(([category, Icon]) => (
            <button type="button" key={category} className={selectedService.category === category ? "is-selected" : ""} onClick={() => select(category)}>
              <Icon size={19} />
              <span>{category}</span>
              {selectedService.category === category ? <span className="gt-service-option-check">✓</span> : <ChevronRight size={16} />}
            </button>
          ))}
        </section>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

function EditPriceTypeScreen({ navigate }: { navigate: Navigate }) {
  const draft = readServiceDraft();
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-options-page">
      <PartnerHeader title="Тип ціни" navigate={navigate} back="partner-service-edit" />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-options-content">
        <div className="gt-service-radio-stack gt-service-radio-stack--plain">
          {priceTypeOptions.map(([value, title, description]) => (
            <ServiceRadioCard key={value} title={title} description={description} checked={draft.priceType === value} onClick={() => {
              const selected = readSelectedService();
              const next = { ...selected, priceType: value };
              savePartnerServices(readPartnerServices().map((item) => item.id === next.id ? next : item));
              navigate("partner", "partner-service-edit");
            }} />
          ))}
        </div>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

const scheduleTypeOptions: Array<[PartnerServiceScheduleType, string, string]> = [
  ["daily", "Щодня", "Один графік на кожен день"],
  ["weekdays", "По днях тижня", "Графік окремо для буднів та вихідних"],
  ["custom", "Вибрані дні", "Налаштувати індивідуально"],
];

function ScheduleTypeScreen({ navigate }: { navigate: Navigate }) {
  const selectedService = readSelectedService();
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-options-page">
      <PartnerHeader title="Тип графіку" navigate={navigate} back="partner-service-edit" />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-options-content">
        <div className="gt-service-radio-stack gt-service-radio-stack--plain">
          {scheduleTypeOptions.map(([value, title, description]) => (
            <ServiceRadioCard key={value} title={title} description={description} checked={selectedService.scheduleType === value} onClick={() => {
              const current = readSelectedService();
              const next = { ...current, scheduleType: value, scheduleLabel: value === "daily" ? `Щодня · з ${current.timeFrom} до ${current.timeTo}` : title };
              savePartnerServices(readPartnerServices().map((item) => item.id === next.id ? next : item));
              navigate("partner", "partner-service-edit");
            }} />
          ))}
        </div>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

function ServiceBreakScreen({ navigate }: { navigate: Navigate }) {
  const [from, setFrom] = useState("14:00");
  const [to, setTo] = useState("15:00");
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-service-options-page">
      <PartnerHeader title="Додати перерву" navigate={navigate} back="partner-service-edit" nextLabel="Зберегти" onNext={() => {
        const current = readSelectedService();
        const next = { ...current, breaks: [...(current.breaks ?? []), { from, to }] };
        savePartnerServices(readPartnerServices().map((item) => item.id === next.id ? next : item));
        navigate("partner", "partner-service-edit");
      }} />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-service-options-content">
        <ServiceSelectRow label="Час початку" value={from} placeholder="14:00" onClick={() => setFrom(from === "14:00" ? "13:00" : "14:00")} />
        <ServiceSelectRow label="Час закінчення" value={to} placeholder="15:00" onClick={() => setTo(to === "15:00" ? "16:00" : "15:00")} />
        <button type="button" className="gt-service-delete gt-service-delete--plain"><Trash2 size={15} /> Видалити перерву</button>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

function TimeSelectRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: string;
  onToggle?: () => void;
}) {
  return (
    <button type="button" className="gt-stay-time-row" onClick={onToggle}>
      <span>{label}</span>
      <div>
        <b>{value}</b>
        <ChevronRight size={14} />
      </div>
    </button>
  );
}

function ToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="gt-stay-time-toggle-row">
      <span>{label}</span>
      <button type="button" className={`gt-switch ${enabled ? "is-on" : ""}`} onClick={onToggle} aria-label={label}>
        <i />
      </button>
    </div>
  );
}

function CheckInScreen({ navigate }: { navigate: Navigate }) {
  const { profile, setProfile } = usePartnerProfile();
  const [earlyEnabled, setEarlyEnabled] = useState(true);
  const [lateEnabled, setLateEnabled] = useState(true);
  const [earlyTime, setEarlyTime] = useState("08:00");
  const [lateTime, setLateTime] = useState("18:00");

  const checkIn = profile.checkIn.replace("Поселення з ", "") || "14:00";
  const checkOut = profile.checkOut.replace("Виселення до ", "") || "11:00";

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav gt-stay-time-screen">
      <PartnerHeader
        title="Час заїзду-виїзду"
        navigate={navigate}
        back="partner-dashboard"
        nextLabel="Зберегти"
        onNext={() => navigate("partner", "partner-dashboard")}
      />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-stay-time-content">
        <section className="gt-stay-time-card">
          <TimeSelectRow
            label="Час заїзду"
            value={checkIn}
            onToggle={() => setProfile((prev) => ({ ...prev, checkIn: checkIn === "14:00" ? "Поселення з 15:00" : "Поселення з 14:00" }))}
          />
          <TimeSelectRow
            label="Час виїзду"
            value={checkOut}
            onToggle={() => setProfile((prev) => ({ ...prev, checkOut: checkOut === "11:00" ? "Виселення до 12:00" : "Виселення до 11:00" }))}
          />
          <ToggleRow label={"Ранній заїзд\n(за можливості)"} enabled={earlyEnabled} onToggle={() => setEarlyEnabled((prev) => !prev)} />
          <TimeSelectRow label="Час" value={earlyTime} onToggle={() => setEarlyTime((prev) => prev === "08:00" ? "09:00" : "08:00")} />
          <ToggleRow label={"Пізній виїзд\n(за можливості)"} enabled={lateEnabled} onToggle={() => setLateEnabled((prev) => !prev)} />
          <TimeSelectRow label="Час" value={lateTime} onToggle={() => setLateTime((prev) => prev === "18:00" ? "19:00" : "18:00")} />
        </section>

        <div className="gt-stay-time-note">
          <strong>Інформація для гостей</strong>
          <p>Бронювання номера діє з часу заселення до часу виїзду, вказаного вище.</p>
        </div>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
    </div>
  );
}

function ScannerScreen({ navigate }: { navigate: Navigate }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
          setCameraReady(true);
        }
      } catch {
        setCameraReady(false);
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="gt-qr-scanner-screen">
      <video ref={videoRef} className={`gt-qr-scanner-video ${cameraReady ? "is-ready" : ""}`} muted playsInline />
      <div className="gt-qr-scanner-shade" />
      <header className="gt-qr-scanner-screen__header">
        <button type="button" onClick={() => navigate("partner", "partner-dashboard")} aria-label="Закрити">
          <X size={22} />
        </button>
        <strong>Сканувати QR-код</strong>
        <button type="button" aria-label="Спалах">
          <Zap size={19} />
        </button>
      </header>

      <main className="gt-qr-scanner-screen__content">
        <div className="gt-qr-viewfinder">
          <span className="gt-qr-corner top-left" />
          <span className="gt-qr-corner top-right" />
          <span className="gt-qr-corner bottom-left" />
          <span className="gt-qr-corner bottom-right" />
          <div className="gt-qr-scan-line" />
        </div>
        <p>Наведіть камеру на QR-код клієнта<br />для надання знижки/бонусу</p>
      </main>
    </div>
  );
}

function ProfileInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="gt-profile-info-row">
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
      <Edit3 size={17} />
    </div>
  );
}

function PartnerProfileScreen({ navigate }: { navigate: Navigate }) {
  const { profile } = usePartnerProfile();

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav gt-partner-profile-screen">
      <main className="gt-partner-mobile-content gt-partner-form-page gt-profile-page-content">
        <section className="gt-profile-user-card">
          <div className="gt-profile-user-card__avatar">
            <img src="/images/partner-profile-avatar.png" alt="Іван Петренко" />
            <i><UserRound size={10} /></i>
          </div>
          <div className="gt-profile-user-card__copy">
            <strong>Іван Петренко</strong>
            <small>Адміністратор</small>
          </div>
        </section>

        <section className="gt-profile-section">
          <h3>Особиста інформація</h3>
          <div className="gt-profile-section__card">
            <ProfileInfoRow label="Ім'я" value="Іван Петренко" />
            <ProfileInfoRow label="Телефон" value={profile.phone} />
            <ProfileInfoRow label="Email" value="ivan.petrenko@girskiy-zatyshok.ua" />
          </div>
        </section>

        <section className="gt-profile-section gt-profile-security-section">
          <h3>Безпека</h3>
          <button type="button" className="gt-profile-security-row">
            <span>Змінити пароль</span>
            <ChevronRight size={17} />
          </button>
        </section>

        <button type="button" className="gt-profile-logout" onClick={() => {
          setSessionToken("");
          savePartnerActivated(false);
          window.localStorage.removeItem(PARTNER_STAGE2_PLACE_KEY);
          navigate("tourist", "home");
        }}><LogOut size={17} /> Вийти з акаунту</button>
      </main>
      <PartnerBottomNav active="profile" activated navigate={navigate} />
    </div>
  );
}



type FinanceTab = "overview" | "operations" | "payments";

type FinanceOperation = {
  date: string;
  time: string;
  service: string;
  amount: string;
  commission: string;
  icon: typeof UtensilsCrossed;
  tone: string;
};

const financeOperations: FinanceOperation[] = [
  { date: "17 липня 2026", time: "14:30", service: "Ресторан", amount: "1 250 ₴", commission: "50 ₴", icon: UtensilsCrossed, tone: "green" },
  { date: "17 липня 2026", time: "13:15", service: "Сауна", amount: "2 000 ₴", commission: "80 ₴", icon: Waves, tone: "sand" },
  { date: "16 липня 2026", time: "11:40", service: "Прокат велосипедів", amount: "350 ₴", commission: "14 ₴", icon: Bike, tone: "blue" },
  { date: "15 липня 2026", time: "20:10", service: "SPA масаж", amount: "1 800 ₴", commission: "72 ₴", icon: Sparkles, tone: "mint" },
  { date: "15 липня 2026", time: "18:05", service: "Ресторан", amount: "980 ₴", commission: "39,20 ₴", icon: UtensilsCrossed, tone: "sand" },
  { date: "14 липня 2026", time: "16:30", service: "Парковка", amount: "200 ₴", commission: "8 ₴", icon: CircleParking, tone: "blue" },
  { date: "14 липня 2026", time: "15:20", service: "Пральня", amount: "150 ₴", commission: "6 ₴", icon: RefreshCcw, tone: "green" },
  { date: "13 липня 2026", time: "21:45", service: "Чан", amount: "2 500 ₴", commission: "100 ₴", icon: Waves, tone: "green" },
];

const financePayments = [
  { date: "10 липня 2026", period: "3 – 9 липня 2026", amount: "4 523 ₴" },
  { date: "3 липня 2026", period: "26 червня – 2 липня 2026", amount: "4 185 ₴" },
  { date: "26 червня 2026", period: "19 – 25 червня 2026", amount: "3 964 ₴" },
  { date: "19 червня 2026", period: "12 – 18 червня 2026", amount: "3 842 ₴" },
];

function FinanceHeader({ navigate, title = "Взаєморозрахунки" }: { navigate: Navigate; title?: string }) {
  return (
    <PartnerHeader title={title} navigate={navigate} back="partner-dashboard" />
  );
}

function FinanceTabs({ tab, onChange }: { tab: FinanceTab; onChange: (tab: FinanceTab) => void }) {
  return (
    <div className="gt-finance-tabs">
      <button type="button" className={tab === "overview" ? "is-active" : ""} onClick={() => onChange("overview")}>Огляд</button>
      <button type="button" className={tab === "operations" ? "is-active" : ""} onClick={() => onChange("operations")}>Операції</button>
      <button type="button" className={tab === "payments" ? "is-active" : ""} onClick={() => onChange("payments")}>Виплати</button>
    </div>
  );
}

function FinanceDateButton({ withFilter = false }: { withFilter?: boolean }) {
  return (
    <div className={`gt-finance-date-row ${withFilter ? "has-filter" : ""}`}>
      <button type="button" className="gt-finance-date-button">
        <CalendarDays size={17} />
        <span>10 – 17 липня 2026</span>
        <ChevronRight size={15} />
      </button>
      {withFilter ? (
        <button type="button" className="gt-finance-filter-button"><SlidersHorizontal size={16} /> Фільтри</button>
      ) : null}
    </div>
  );
}

function FinanceSparkline({ red = false }: { red?: boolean }) {
  return (
    <svg className={`gt-finance-sparkline ${red ? "is-red" : ""}`} viewBox="0 0 150 70" role="img" aria-label="Динаміка обороту">
      <polyline points="6,56 27,47 47,22 67,43 89,24 111,34 142,7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {[ [6,56], [27,47], [47,22], [67,43], [89,24], [111,34], [142,7] ].map(([cx,cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="white" stroke="currentColor" strokeWidth="3" />
      ))}
    </svg>
  );
}

function FinanceMetricCard({ label, value, note, danger = false }: { label: string; value: string; note?: string; danger?: boolean }) {
  return (
    <div className={`gt-finance-metric-card ${danger ? "is-danger" : ""}`}>
      <small>{label}</small>
      <strong>{value}</strong>
      {note ? <span>{note}</span> : null}
    </div>
  );
}

function FinanceOverview() {
  return (
    <>
      <FinanceDateButton />
      <section className="gt-finance-turnover-card">
        <div>
          <small>Загальний оборот (через додаток)</small>
          <strong>124 560 ₴</strong>
          <span>↑ 18% до попереднього тижня</span>
        </div>
        <FinanceSparkline />
      </section>

      <div className="gt-finance-metrics-grid gt-finance-metrics-grid--three">
        <FinanceMetricCard label="Кількість операцій" value="146" />
        <FinanceMetricCard label="Нарахована комісія" value="4 982 ₴" note="4% від обороту" />
        <FinanceMetricCard label="Сплачено комісії" value="0 ₴" note="0% від нарахованої" />
      </div>

      <section className="gt-finance-period-card">
        <h3>Комісія за період</h3>
        <div><span>Загальна комісія</span><b>4 982 ₴</b></div>
        <div><span>Сплачено</span><b>0 ₴</b></div>
        <div className="is-due"><span>До сплати</span><b>4 982 ₴</b></div>
      </section>

      <section className="gt-finance-chart-card">
        <h3>Динаміка обороту та комісії</h3>
        <div className="gt-finance-chart-legend"><span><i className="is-turnover" />Оборот</span><span><i className="is-commission" />Комісія (4%)</span></div>
        <svg viewBox="0 0 330 150" role="img" aria-label="Графік обороту та комісії">
          <g className="grid">
            <line x1="22" y1="20" x2="322" y2="20"/><line x1="22" y1="60" x2="322" y2="60"/><line x1="22" y1="100" x2="322" y2="100"/><line x1="22" y1="136" x2="322" y2="136"/>
          </g>
          <polyline className="turnover" points="28,105 74,94 120,67 166,82 212,55 258,62 314,28" />
          <polyline className="commission" points="28,126 74,122 120,116 166,119 212,109 258,108 314,99" />
          {[28,74,120,166,212,258,314].map((cx, idx) => <circle key={`g-${cx}`} className="turnover-dot" cx={cx} cy={[105,94,67,82,55,62,28][idx]} r="4" />)}
          {[28,74,120,166,212,258,314].map((cx, idx) => <circle key={`b-${cx}`} className="commission-dot" cx={cx} cy={[126,122,116,119,109,108,99][idx]} r="4" />)}
        </svg>
        <div className="gt-finance-chart-days"><span>10 лип</span><span>11 лип</span><span>12 лип</span><span>13 лип</span><span>14 лип</span><span>15 лип</span><span>17 лип</span></div>
      </section>

      <div className="gt-finance-info-note"><Info size={18} /><p>Комісія нараховується автоматично за кожну підтверджену операцію через додаток.</p></div>
    </>
  );
}

function FinanceOperations() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? financeOperations : financeOperations.slice(0, 7);

  return (
    <>
      <FinanceDateButton withFilter />
      <div className="gt-finance-metrics-grid gt-finance-metrics-grid--three gt-finance-operation-metrics">
        <FinanceMetricCard label="Кількість операцій" value="146" />
        <FinanceMetricCard label="Оборот" value="124 560 ₴" />
        <FinanceMetricCard label="Комісія (4%)" value="4 982 ₴" />
      </div>

      <section className="gt-finance-history">
        <h3>Історія операцій</h3>
        <div className="gt-finance-history-head"><span>Дата і час</span><span>Послуга</span><span>Сума операції</span><span>Комісія (4%)</span></div>
        {visible.map(({ date, time, service, amount, commission, icon: Icon, tone }) => (
          <div className="gt-finance-operation-row" key={`${date}-${time}-${service}`}>
            <span className="date"><small>{date}</small><b>{time}</b></span>
            <span className="service"><i className={`tone-${tone}`}><Icon size={17} /></i><b>{service}</b></span>
            <strong>{amount}</strong>
            <strong>{commission}</strong>
          </div>
        ))}
        <button type="button" className="gt-finance-show-more" onClick={() => setShowAll((prev) => !prev)}>{showAll ? "Сховати" : "Показати ще"} <ChevronRight size={15} /></button>
      </section>
    </>
  );
}

function FinancePayments({ onConfirm }: { onConfirm: () => void }) {
  return (
    <>
      <FinanceDateButton />
      <section className="gt-finance-due-card">
        <div>
          <small>До сплати комісії</small>
          <strong>4 982 ₴</strong>
          <span>за період 10 – 17 липня 2026</span>
          <button type="button" onClick={onConfirm}>Підтвердити оплату</button>
        </div>
        <span className="gt-finance-wallet-icon"><WalletCards size={43} /></span>
      </section>

      <section className="gt-finance-payment-history">
        <h3>Історія виплат</h3>
        {financePayments.map(({ date, period, amount }) => (
          <button type="button" key={`${date}-${amount}`}>
            <span><small>{date}</small><b>Комісія за {period}</b><em>Платіжна картка **** 4242</em></span>
            <strong>{amount}<small>Сплачено</small></strong>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>

      <div className="gt-finance-info-note"><Info size={18} /><p>Комісія виплачується на вашу картку автоматично щотижня після підтвердження оплати.</p></div>
    </>
  );
}

function FinanceConfirmPayment({ onBack }: { onBack: () => void }) {
  const [receiptName, setReceiptName] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="gt-partner-mobile-screen gt-finance-confirm-screen">
      <header className="gt-finance-confirm-header">
        <button type="button" onClick={onBack}><ArrowLeft size={22} /></button>
        <strong>Підтвердити оплату</strong>
        <span />
      </header>
      <main className="gt-finance-confirm-content">
        <section className="gt-finance-confirm-summary">
          <div><small>Сума до сплати</small><strong>4 982 ₴</strong><span>за період 10 – 17 липня 2026</span></div>
          <i><WalletCards size={42} /></i>
        </section>

        <section className="gt-finance-confirm-section">
          <h3>Деталі платежу</h3>
          <div className="gt-finance-payment-detail"><span><small>Комісія за період</small><b>10 – 17 липня 2026</b></span><strong>4 982 ₴</strong></div>
          <div className="gt-finance-payment-detail"><span><small>Картка для оплати</small><b>**** 4242</b></span></div>
          <div className="gt-finance-payment-detail"><span><small>Отримувач</small><b>Gid Tourist</b></span></div>
          <div className="gt-finance-payment-detail"><span><small>IBAN</small><b>UA12 3456 7890 1234 5678 9101 112</b></span></div>
          <div className="gt-finance-payment-detail"><span><small>Призначення платежу</small><b>Комісія за 10 – 17 липня 2026</b></span></div>
        </section>

        <section className="gt-finance-confirm-section">
          <h3>Сума платежу</h3>
          <div className="gt-finance-amount-input"><strong>4 982</strong><span>₴</span></div>
        </section>

        <section className="gt-finance-confirm-section">
          <h3>Квитанція про оплату</h3>
          <label className="gt-finance-upload-box">
            <input type="file" accept="image/png,image/jpeg,application/pdf" onChange={(event) => setReceiptName(event.target.files?.[0]?.name ?? "")} />
            <ImagePlus size={27} />
            <span><b>{receiptName || "Додайте файл або фото квитанції"}</b><small>{receiptName ? "Файл додано" : "PDF, JPG, PNG до 10 МБ"}</small></span>
          </label>
        </section>

        <div className="gt-finance-confirm-warning"><Info size={18} /><p>Після відправлення оплати вона буде перевірена. Статус оновиться в історії виплат.</p></div>
        <button type="button" className="gt-finance-confirm-submit" onClick={() => setSent(true)}>{sent ? "Відправлено на перевірку" : "Відправити на підтвердження"}</button>
      </main>
    </div>
  );
}

function PartnerFinanceScreen({ navigate }: { navigate: Navigate }) {
  const [tab, setTab] = useState<FinanceTab>("overview");
  const [confirming, setConfirming] = useState(false);

  if (confirming) return <FinanceConfirmPayment onBack={() => setConfirming(false)} />;

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav gt-finance-screen">
      <FinanceHeader navigate={navigate} />
      <main className="gt-partner-mobile-content gt-partner-form-page gt-finance-content">
        <FinanceTabs tab={tab} onChange={setTab} />
        {tab === "overview" ? <FinanceOverview /> : null}
        {tab === "operations" ? <FinanceOperations /> : null}
        {tab === "payments" ? <FinancePayments onConfirm={() => setConfirming(true)} /> : null}
      </main>
      <PartnerBottomNav active="settlements" activated navigate={navigate} />
    </div>
  );
}

function PlaceholderScreen({
  navigate,
  title,
  description,
  icon: Icon,
  active = "home",
}: {
  navigate: Navigate;
  title: string;
  description: string;
  icon: typeof QrCode;
  active?: "home" | "info" | "stats" | "profile" | "settlements";
}) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title={title} navigate={navigate} back="partner-dashboard" />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-simple-partner-section">
          <span>
            <Icon size={42} />
          </span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </main>
      <PartnerBottomNav active={active} activated navigate={navigate} />
    </div>
  );
}

export function PartnerMobileScreen({ slug, navigate }: { slug: string; navigate: Navigate }) {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setActivated(readPartnerActivated());
    void ensureTelegramSession().then(async (session) => {
      if (!session) return;
      const places = await stage2Fetch<Array<{ id: string; status: string }>>("/partner/places");
      if (cancelled) return;
      const storedId = typeof window !== "undefined" ? window.localStorage.getItem(PARTNER_STAGE2_PLACE_KEY) : null;
      const place = places.find((item) => item.id === storedId) ?? places[0];
      const approved = place?.status === "approved";
      savePartnerActivated(Boolean(approved));
      setActivated(Boolean(approved));
      if (place?.id && typeof window !== "undefined") window.localStorage.setItem(PARTNER_STAGE2_PLACE_KEY, place.id);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [slug]);

  const resolvedSlug = useMemo(() => {
    if (activated && (slug === "partner-dashboard" || slug === "partner-onboarding")) {
      return "partner-cabinet";
    }
    if (!activated && slug === "partner-cabinet") {
      return "partner-dashboard";
    }
    if (slug === "partner-onboarding") return "partner-info";
    return slug;
  }, [activated, slug]);

  const activatePartner = () => {
    savePartnerActivated(true);
    setActivated(true);
  };

  switch (resolvedSlug) {
    case "partner-dashboard":
      return <PartnerStartScreen navigate={navigate} />;
    case "partner-info":
      return <PartnerInfoScreen navigate={navigate} activated={activated} />;
    case "partner-rules":
      return <RulesScreen navigate={navigate} activated={activated} />;
    case "partner-wifi":
      return <WifiScreen navigate={navigate} activated={activated} />;
    case "partner-contacts":
      return <ContactsScreen navigate={navigate} activated={activated} onActivate={activatePartner} />;
    case "partner-pending":
      return <PartnerPendingScreen navigate={navigate} onActivate={activatePartner} />;
    case "partner-statistics":
      return <StatisticsScreen navigate={navigate} activated={activated} />;
    case "partner-update":
      return <UpdateScreen navigate={navigate} activated={activated} />;
    case "partner-cabinet":
      return <CabinetScreen navigate={navigate} />;
    case "partner-services":
      return <ServicesScreen navigate={navigate} />;
    case "partner-services-hidden":
      return <HiddenServicesScreen navigate={navigate} />;
    case "partner-service-add":
      return <AddServiceScreen navigate={navigate} />;
    case "partner-service-category":
      return <CategorySelectScreen navigate={navigate} />;
    case "partner-service-price-type":
      return <PriceTypeScreen navigate={navigate} />;
    case "partner-service-edit":
      return <EditServiceScreen navigate={navigate} />;
    case "partner-service-edit-category":
      return <EditCategorySelectScreen navigate={navigate} />;
    case "partner-service-edit-price-type":
      return <EditPriceTypeScreen navigate={navigate} />;
    case "partner-service-schedule-type":
      return <ScheduleTypeScreen navigate={navigate} />;
    case "partner-service-break":
      return <ServiceBreakScreen navigate={navigate} />;
    case "partner-checkin":
      return <CheckInScreen navigate={navigate} />;
    case "scanner":
      return <ScannerScreen navigate={navigate} />;
    case "partner-finance":
      return <PartnerFinanceScreen navigate={navigate} />;
    case "place-editor":
      return <PartnerProfileScreen navigate={navigate} />;
    default:
      return activated ? <CabinetScreen navigate={navigate} /> : <PartnerStartScreen navigate={navigate} />;
  }
}
