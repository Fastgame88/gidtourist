"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  BedDouble,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  CigaretteOff,
  Edit3,
  Eye,
  Home,
  Hotel,
  Image as ImageIcon,
  Info,
  Globe2,
  Mail,
  Instagram,
  Facebook,
  MessageCircleMore,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  MoreVertical,
  PawPrint,
  Phone,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  Wifi,
} from "lucide-react";
import type { RoleKey } from "../../lib/navigation";

type Navigate = (role: RoleKey, slug: string) => void;
type PartnerProps = { navigate: Navigate; activated: boolean };

type PartnerProfile = {
  placeName: string;
  placeType: string;
  address: string;
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
};

const heroImage = "/images/mountain-hotel.webp";
const PROFILE_STORAGE_KEY = "gid-tourist-partner-profile";
const ACTIVATED_STORAGE_KEY = "gid-tourist-partner-activated";

const defaultProfile: PartnerProfile = {
  placeName: "Гірський Затишок",
  placeType: "Готель",
  address: "Татарів, вул. Незалежності, 155",
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

function PartnerHeader({
  title,
  navigate,
  back,
  nextLabel,
  onNext,
  showMenu = false,
}: {
  title: string;
  navigate: Navigate;
  back?: string;
  nextLabel?: string;
  onNext?: () => void;
  showMenu?: boolean;
}) {
  return (
    <header className="gt-partner-header">
      <button
        type="button"
        className="gt-partner-header__button"
        aria-label="Назад"
        onClick={() => (back ? navigate("partner", back) : history.back())}
      >
        <ArrowLeft size={23} />
      </button>
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

function AmenitiesRow() {
  const amenities = [
    { icon: Hotel, label: "Готель" },
    { icon: BedDouble, label: "Номери" },
    { icon: ShieldCheck, label: "Сауна" },
    { icon: MapPin, label: "Паркінг" },
    { icon: Wifi, label: "Wi‑Fi" },
  ];

  return (
    <div className="gt-amenities-row">
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
    </div>
  );
}

function PartnerInfoScreen({ navigate, activated }: PartnerProps) {
  const { profile, setProfile } = usePartnerProfile();
  const goBack = activated ? "partner-cabinet" : "partner-dashboard";

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
          <img src={heroImage} alt="Фото закладу" />
          <button type="button">
            <ImageIcon size={16} /> Змінити фото
          </button>
        </section>

        <FormCard>
          <InputRow
            label="Назва закладу"
            value={profile.placeName}
            onChange={(placeName) => setProfile((prev) => ({ ...prev, placeName }))}
          />
          <InputRow
            label="Тип закладу"
            value={profile.placeType}
            onChange={(placeType) => setProfile((prev) => ({ ...prev, placeType }))}
            rightIcon={<ChevronRight size={16} />}
          />
          <InputRow
            label="Адреса"
            value={profile.address}
            onChange={(address) => setProfile((prev) => ({ ...prev, address }))}
            rightIcon={<MapPin size={16} />}
          />
          <InputRow
            label="Опис"
            value={profile.description}
            onChange={(description) => setProfile((prev) => ({ ...prev, description }))}
            multiline
          />
          <AmenitiesRow />
          <InputRow
            label="Кількість номерів"
            value={profile.roomCount}
            onChange={(roomCount) => setProfile((prev) => ({ ...prev, roomCount }))}
          />
          <InputRow
            label="Рік відкриття"
            value={profile.openedYear}
            onChange={(openedYear) => setProfile((prev) => ({ ...prev, openedYear }))}
          />
          <InputRow
            label="Мови обслуговування"
            value={profile.languages}
            onChange={(languages) => setProfile((prev) => ({ ...prev, languages }))}
          />
          <InputRow
            label="Тип розміщення"
            value={profile.accommodationType}
            onChange={(accommodationType) => setProfile((prev) => ({ ...prev, accommodationType }))}
          />
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
  label,
  value,
  onChange,
  iconClassName,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  onChange: (next: string) => void;
  iconClassName: string;
}) {
  return (
    <label className="gt-contact-edit-row">
      <span className={`gt-contact-edit-row__icon ${iconClassName}`}>
        <Icon size={18} />
      </span>
      <span className="gt-contact-edit-row__copy">
        <small>{label}</small>
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
      <i>
        <Edit3 size={15} />
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
          onActivate();
          navigate("partner", "partner-dashboard");
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
            icon={MessageCircleMore}
            label="Viber / Telegram"
            value={profile.messenger}
            onChange={(messenger) => setProfile((prev) => ({ ...prev, messenger }))}
            iconClassName="is-violet"
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
            icon={Instagram}
            label="Instagram"
            value={profile.instagram}
            onChange={(instagram) => setProfile((prev) => ({ ...prev, instagram }))}
            iconClassName="is-instagram"
          />
          <ContactRow
            icon={Facebook}
            label="Facebook"
            value={profile.facebook}
            onChange={(facebook) => setProfile((prev) => ({ ...prev, facebook }))}
            iconClassName="is-facebook"
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
            <Edit3 size={15} />
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

function StatisticsScreen({ navigate, activated }: PartnerProps) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader
        title="Статистика переходів"
        navigate={navigate}
        back="partner-dashboard"
      />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-stat-tabs">
          <button className="is-active">Тиждень</button>
          <button>Місяць</button>
          <button>Рік</button>
        </div>

        <div className="gt-stat-total">
          <small>Всього переходів</small>
          <strong>1 248</strong>
          <span>↑ 18% порівняно з попереднім тижнем</span>
        </div>

        <section className="gt-stat-chart">
          <strong>Графік переходів</strong>
          <div className="gt-stat-chart__area">
            <svg viewBox="0 0 300 110" role="img" aria-label="Графік переходів">
              <polyline
                points="8,66 52,28 96,55 140,25 184,69 228,24 292,10"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g>
                {[
                  [8, 66],
                  [52, 28],
                  [96, 55],
                  [140, 25],
                  [184, 69],
                  [228, 24],
                  [292, 10],
                ].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="white" stroke="currentColor" strokeWidth="3" />
                ))}
              </g>
            </svg>
            <div>
              <span>Пн</span>
              <span>Вт</span>
              <span>Ср</span>
              <span>Чт</span>
              <span>Пт</span>
              <span>Сб</span>
              <span>Нд</span>
            </div>
          </div>
        </section>

        <section className="gt-stat-sources">
          <strong>Джерела переходів</strong>
          {[
            ["Пошук додатку", "713 (57%)", 57],
            ["Карта", "312 (25%)", 25],
            ["Категорії", "148 (12%)", 12],
            ["Рекомендації", "75 (6%)", 6],
          ].map(([name, value, width]) => (
            <div key={name as string}>
              <span>
                <b>{name as string}</b>
                <small>{value as string}</small>
              </span>
              <i>
                <em style={{ width: `${width}%` }} />
              </i>
            </div>
          ))}
        </section>
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

function CheckInScreen({ navigate }: { navigate: Navigate }) {
  const { profile, setProfile } = usePartnerProfile();

  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Час заїзду-виїзду" navigate={navigate} back="partner-dashboard" />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <FormCard>
          <InputRow
            label="Час заїзду"
            value={profile.checkIn}
            onChange={(checkIn) => setProfile((prev) => ({ ...prev, checkIn }))}
          />
          <InputRow
            label="Час виїзду"
            value={profile.checkOut}
            onChange={(checkOut) => setProfile((prev) => ({ ...prev, checkOut }))}
          />
        </FormCard>
      </main>
      <PartnerBottomNav active="home" activated navigate={navigate} />
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
    setActivated(readPartnerActivated());
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
    case "partner-statistics":
      return <StatisticsScreen navigate={navigate} activated={activated} />;
    case "partner-update":
      return <UpdateScreen navigate={navigate} activated={activated} />;
    case "partner-cabinet":
      return <CabinetScreen navigate={navigate} />;
    case "partner-services":
      return (
        <PlaceholderScreen
          navigate={navigate}
          title="Послуги закладу"
          icon={Hotel}
          description="Тут буде логіка керування послугами закладу в новому інтерфейсі партнера."
        />
      );
    case "partner-checkin":
      return <CheckInScreen navigate={navigate} />;
    case "scanner":
      return (
        <PlaceholderScreen
          navigate={navigate}
          title="QR"
          icon={QrCode}
          description="Тут буде логіка QR для монетизованого партнера."
        />
      );
    case "partner-finance":
      return (
        <PlaceholderScreen
          navigate={navigate}
          title="Взаєморозрахунки"
          icon={WalletCards}
          active="settlements"
          description="Тут буде логіка взаєморозрахунків у кабінеті монетизованого партнера."
        />
      );
    case "place-editor":
      return (
        <PlaceholderScreen
          navigate={navigate}
          title="Профіль"
          icon={UserRound}
          active="profile"
          description="Тут буде логіка профілю партнера без видалення старих даних та функцій у проєкті."
        />
      );
    default:
      return activated ? <CabinetScreen navigate={navigate} /> : <PartnerStartScreen navigate={navigate} />;
  }
}
