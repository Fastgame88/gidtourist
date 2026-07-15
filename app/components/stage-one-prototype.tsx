"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  FileCheck2,
  Fingerprint,
  Home,
  Layers3,
  LayoutDashboard,
  MapPinned,
  Menu,
  PanelLeftClose,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  defaultScreenForRole,
  getScreen,
  roleCounts,
  roles,
  screensForRole,
  type RoleKey,
} from "../lib/prototype-data";
import { AdminScreen, AmbassadorScreen, RegionalScreen } from "./screens/admin-screens";
import { OverviewScreen } from "./screens/overview-screens";
import { PartnerScreen } from "./screens/partner-screens";
import { TouristScreen } from "./screens/tourist-screens";
import { StatusBadge } from "./prototype-ui";

const roleIcons = {
  overview: Layers3,
  tourist: Compass,
  partner: Building2,
  ambassador: Sparkles,
  regional: MapPinned,
  admin: ShieldCheck,
} satisfies Record<RoleKey, typeof Compass>;

const screenIcon = (slug: string) => {
  if (slug.includes("dashboard") || slug === "project-overview") return LayoutDashboard;
  if (slug.includes("qr") || slug === "scanner") return QrCode;
  if (slug.includes("booking") || slug === "calendar") return CalendarDays;
  if (slug.includes("finance") || slug === "ledger" || slug === "wallet") return WalletCards;
  if (slug.includes("moderation")) return FileCheck2;
  if (slug.includes("role") || slug.includes("audit")) return Fingerprint;
  if (slug.includes("map") || slug.includes("nearby") || slug.includes("location")) return MapPinned;
  if (slug === "home" || slug === "welcome") return Home;
  if (slug.includes("profile") || slug.includes("ambassador")) return UserRound;
  if (slug.includes("plan") || slug.includes("flow")) return BookOpenCheck;
  if (slug.includes("bonus") || slug.includes("purchase")) return Sparkles;
  return Layers3;
};

const isRoleKey = (value: string): value is RoleKey =>
  roles.some((role) => role.key === value);

function readHash(): { role: RoleKey; slug: string } {
  if (typeof window === "undefined") {
    return { role: "overview", slug: "project-overview" };
  }
  const [rawRole = "overview", rawSlug = "project-overview"] = window.location.hash
    .replace(/^#\/?/, "")
    .split("/");
  const role = isRoleKey(rawRole) ? rawRole : "overview";
  const validSlug = screensForRole(role).some((screen) => screen.slug === rawSlug)
    ? rawSlug
    : defaultScreenForRole(role);
  return { role, slug: validSlug };
}

const screenNotes: Record<string, string[]> = {
  welcome: [
    "Статичний QR визначає контекст, але не доводить фізичну присутність.",
    "Геолокація запитується окремою дією користувача.",
    "Telegram initData має перевірятися тільки на backend.",
  ],
  booking: [
    "Окремий календар для кожного ресурсу.",
    "Зайнятий або ручний слот не можна забронювати повторно.",
    "Buffer входить у розрахунок доступності.",
  ],
  qr: [
    "Одноразовий signed token із nonce та expiry 30–60 секунд.",
    "Персональні дані не зашиваються у відкритий QR.",
    "Повторне використання токена блокується backend.",
  ],
  "purchase-confirmation": [
    "Клієнт бачить партнера, суму, earn і spend до підтвердження.",
    "Quote не змінює баланс.",
    "Confirm створює transaction і ledger entries ідемпотентно.",
  ],
  ledger: [
    "Фінансові записи append-only.",
    "Сторнування посилається на початкову операцію.",
    "Баланс є проєкцією debit / credit entries.",
  ],
  default: [
    "Дані на екрані демонстраційні й використовуються для погодження UX.",
    "Структура компонентів спільна для всіх ролей.",
    "Бойова інтеграція цього модуля виконується у відповідному етапі MVP.",
  ],
};

function TouristBottomNav({
  activeSlug,
  navigate,
}: {
  activeSlug: string;
  navigate: (role: RoleKey, slug: string) => void;
}) {
  const items = [
    ["home", "Головна", Home],
    ["plan", "Мій план", BookOpenCheck],
    ["wallet", "Бонуси", WalletCards],
    ["profile", "Профіль", UserRound],
  ] as const;
  return (
    <nav className="tourist-bottom-nav" aria-label="Навігація туриста">
      {items.map(([slug, label, Icon]) => (
        <button
          key={slug}
          type="button"
          className={activeSlug === slug ? "is-active" : ""}
          onClick={() => navigate("tourist", slug)}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function StageOnePrototype() {
  const initial = { role: "overview" as RoleKey, slug: "project-overview" };
  const [role, setRole] = useState<RoleKey>(initial.role);
  const [slug, setSlug] = useState(initial.slug);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const syncHash = () => {
      const next = readHash();
      setRole(next.role);
      setSlug(next.slug);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const navigate = (nextRole: RoleKey, nextSlug: string) => {
    const valid = getScreen(nextRole, nextSlug);
    setRole(nextRole);
    setSlug(valid.slug);
    setSidebarOpen(false);
    window.history.replaceState(null, "", `#/${nextRole}/${valid.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeScreen = useMemo(() => getScreen(role, slug), [role, slug]);
  const activeRole = roles.find((item) => item.key === role) ?? roles[0];
  const roleScreens = screensForRole(role);
  const isTourist = role === "tourist";
  const notes = screenNotes[slug] ?? screenNotes.default;

  const renderScreen = () => {
    if (role === "overview") return <OverviewScreen slug={slug} navigate={navigate} />;
    if (role === "tourist") return <TouristScreen slug={slug} navigate={navigate} />;
    if (role === "partner") return <PartnerScreen slug={slug} navigate={navigate} />;
    if (role === "ambassador") return <AmbassadorScreen slug={slug} />;
    if (role === "regional") return <RegionalScreen slug={slug} navigate={navigate} />;
    return <AdminScreen slug={slug} navigate={navigate} />;
  };

  return (
    <div className={`prototype-app prototype-app--${role}`}>
      <aside className={`prototype-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">
            <Compass size={23} />
          </span>
          <div>
            <strong>Гід туриста</strong>
            <span>Етап 1 · дизайн</span>
          </div>
          <button type="button" aria-label="Закрити меню" onClick={() => setSidebarOpen(false)}>
            <PanelLeftClose size={19} />
          </button>
        </div>

        <div className="role-switcher">
          <p>Режим перегляду</p>
          <div className="role-switcher__list">
            {roles.map((item) => {
              const Icon = roleIcons[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  className={role === item.key ? "is-active" : ""}
                  onClick={() => navigate(item.key, defaultScreenForRole(item.key))}
                  title={item.description}
                >
                  <span>
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{item.shortLabel}</strong>
                    <small>{roleCounts[item.key]} екранів</small>
                  </div>
                  {role === item.key ? <i /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <nav className="screen-nav" aria-label="Екрани прототипу">
          <div className="screen-nav__heading">
            <span>Екрани</span>
            <StatusBadge tone="neutral">{roleScreens.length}</StatusBadge>
          </div>
          <div className="screen-nav__list">
            {roleScreens.map((screen) => {
              const Icon = screenIcon(screen.slug);
              return (
                <button
                  type="button"
                  key={screen.id}
                  className={slug === screen.slug ? "is-active" : ""}
                  onClick={() => navigate(role, screen.slug)}
                >
                  <span className="screen-nav__icon">
                    <Icon size={17} />
                  </span>
                  <div>
                    <strong>{screen.shortTitle}</strong>
                    <small>{screen.id}</small>
                  </div>
                  {slug === screen.slug ? <Check size={14} /> : null}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer-card">
          <div>
            <BadgeCheck size={18} />
            <strong>Перша версія готова</strong>
          </div>
          <p>Усі ключові ролі й сценарії доступні для погодження.</p>
          <button type="button" onClick={() => navigate("overview", "project-overview")}>
            Огляд етапу <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Закрити меню"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <main className="prototype-main">
        <header className="review-topbar">
          <button className="mobile-menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Відкрити меню">
            <Menu size={20} />
          </button>
          <div className="review-topbar__title">
            <span>{activeScreen.id}</span>
            <div>
              <strong>{activeScreen.title}</strong>
              <small>{activeScreen.description}</small>
            </div>
          </div>
          <div className="review-topbar__meta">
            <StatusBadge tone={isTourist ? "green" : "blue"}>
              {isTourist ? <Smartphone size={13} /> : <LayoutDashboard size={13} />}
              {isTourist ? "Mobile first" : "Desktop workspace"}
            </StatusBadge>
            <button className="role-mobile-select" type="button" onClick={() => setSidebarOpen(true)}>
              {activeRole.shortLabel} <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className={`prototype-workspace ${isTourist ? "prototype-workspace--mobile" : "prototype-workspace--desktop"}`}>
          {isTourist ? (
            <div className="mobile-review-layout">
              <div className="phone-review-wrap">
                <div className="phone-review-label">
                  <span>Telegram Mini App</span>
                  <span>390 × 844</span>
                </div>
                <div className="phone-frame">
                  <div className="phone-statusbar">
                    <strong>9:41</strong>
                    <span>
                      <i className="signal-icon" />
                      <i className="wifi-icon" />
                      <i className="battery-icon" />
                    </span>
                  </div>
                  <div className="phone-content">{renderScreen()}</div>
                  {slug !== "welcome" ? (
                    <TouristBottomNav activeSlug={slug} navigate={navigate} />
                  ) : null}
                </div>
              </div>
              <aside className="prototype-notes">
                <div className="prototype-notes__heading">
                  <span>{activeScreen.id}</span>
                  <div>
                    <p className="eyebrow">Логіка екрана</p>
                    <h2>{activeScreen.shortTitle}</h2>
                  </div>
                </div>
                <p>{activeScreen.description}</p>
                <div className="prototype-note-list">
                  {notes.map((note) => (
                    <div key={note}>
                      <span>
                        <Check size={12} />
                      </span>
                      <p>{note}</p>
                    </div>
                  ))}
                </div>
                <div className="stage-boundary-note">
                  <Fingerprint size={18} />
                  <div>
                    <strong>Межа етапу 1</strong>
                    <p>Інтерфейс клікабельний, але використовує демонстраційні дані без реальних транзакцій.</p>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="desktop-preview-frame">
              <div className="desktop-preview-bar">
                <div>
                  <i />
                  <i />
                  <i />
                </div>
                <span>
                  <ShieldCheck size={13} /> Захищений режим · {activeRole.label}
                </span>
                <StatusBadge tone="green" dot>Prototype</StatusBadge>
              </div>
              <div className="desktop-preview-content">{renderScreen()}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
