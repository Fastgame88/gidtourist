"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  FileCheck2,
  Fingerprint,
  Home,
  Layers3,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  getScreen,
  roles,
  screensForRole,
  type RoleKey,
} from "../lib/navigation";
import { AdminScreen, AmbassadorScreen, RegionalScreen } from "./screens/admin-screens";
import { PartnerScreen } from "./screens/partner-screens";
import { TouristScreen } from "./screens/tourist-screens";
import { Avatar, IconButton } from "./ui";

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      ready: () => void;
      expand: () => void;
      setHeaderColor?: (color: string) => void;
      setBackgroundColor?: (color: string) => void;
    };
  };
};

const portalAccounts: Record<Exclude<RoleKey, "tourist">, { name: string; detail: string; initials: string }> = {
  partner: { name: "Коруна SPA", detail: "Оксана Романюк", initials: "ОР" },
  ambassador: { name: "Марія Коваль", detail: "Амбасадор", initials: "МК" },
  regional: { name: "Івано-Франківська", detail: "Регіональний адміністратор", initials: "ІФ" },
  admin: { name: "Гід туриста", detail: "Суперадміністратор", initials: "ГА" },
};

const roleIcons = {
  tourist: Compass,
  partner: Building2,
  ambassador: Sparkles,
  regional: MapPinned,
  admin: ShieldCheck,
} satisfies Record<RoleKey, typeof Compass>;

function iconForScreen(slug: string) {
  if (slug.includes("dashboard")) return LayoutDashboard;
  if (slug.includes("qr") || slug === "scanner") return QrCode;
  if (slug.includes("booking") || slug === "calendar") return CalendarDays;
  if (slug.includes("finance") || slug === "ledger" || slug === "wallet") return WalletCards;
  if (slug.includes("moderation")) return FileCheck2;
  if (slug.includes("audit")) return Fingerprint;
  if (slug.includes("analytics")) return BarChart3;
  if (slug.includes("map") || slug.includes("nearby") || slug.includes("location")) return MapPinned;
  if (slug === "home" || slug === "welcome") return Home;
  if (slug.includes("profile")) return UserRound;
  if (slug.includes("plan")) return BookOpenCheck;
  return Layers3;
}

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
    <nav className="tourist-bottom-nav" aria-label="Основна навігація">
      {items.map(([itemSlug, label, Icon]) => (
        <button
          key={itemSlug}
          type="button"
          className={activeSlug === itemSlug ? "is-active" : ""}
          onClick={() => navigate("tourist", itemSlug)}
        >
          <Icon size={23} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function ProductApplication({ role, slug }: { role: RoleKey; slug: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeScreen = getScreen(role, slug);

  useEffect(() => {
    if (role !== "tourist") return;
    const webApp = (window as TelegramWindow).Telegram?.WebApp;
    webApp?.ready();
    webApp?.expand();
    webApp?.setHeaderColor?.("#f8fbf9");
    webApp?.setBackgroundColor?.("#f8fbf9");
  }, [role]);

  const navigate = (nextRole: RoleKey, nextSlug: string) => {
    const screen = getScreen(nextRole, nextSlug);
    setMenuOpen(false);
    router.push(`/${nextRole}/${screen.slug}`);
  };

  if (role === "tourist") {
    return (
      <main className="tourist-app-shell">
        <div className={`tourist-app-frame ${slug === "welcome" ? "tourist-app-frame--welcome" : ""}`}>
          <div className="phone-content">
            <TouristScreen slug={activeScreen.slug} navigate={navigate} />
          </div>
          {slug !== "welcome" ? <TouristBottomNav activeSlug={slug} navigate={navigate} /> : null}
        </div>
      </main>
    );
  }

  const roleInfo = roles.find((item) => item.key === role) ?? roles[1];
  const account = portalAccounts[role];
  const RoleIcon = roleIcons[role];
  const portalScreens = screensForRole(role);

  const screenContent = role === "partner"
    ? <PartnerScreen slug={activeScreen.slug} navigate={navigate} />
    : role === "ambassador"
      ? <AmbassadorScreen slug={activeScreen.slug} />
      : role === "regional"
        ? <RegionalScreen slug={activeScreen.slug} navigate={navigate} />
        : <AdminScreen slug={activeScreen.slug} navigate={navigate} />;

  return (
    <div className={`portal-shell portal-shell--${role}`}>
      <aside className={`portal-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="portal-brand">
          <span><Compass size={28} /></span>
          <div><strong>Гід туриста</strong><small>{roleInfo.label}</small></div>
          <button type="button" aria-label="Закрити меню" onClick={() => setMenuOpen(false)}><X size={23} /></button>
        </div>

        <div className="portal-context">
          <span><RoleIcon size={22} /></span>
          <div><small>Робочий простір</small><strong>{account.name}</strong></div>
        </div>

        <nav className="portal-navigation" aria-label={roleInfo.label}>
          <p>Навігація</p>
          {portalScreens.map((screen) => {
            const Icon = iconForScreen(screen.slug);
            const active = screen.slug === activeScreen.slug;
            return (
              <button
                key={screen.slug}
                type="button"
                className={active ? "is-active" : ""}
                onClick={() => navigate(role, screen.slug)}
              >
                <span><Icon size={22} /></span>
                <strong>{screen.shortTitle}</strong>
                {active ? <Check size={17} /> : <ChevronRight size={17} />}
              </button>
            );
          })}
        </nav>

        <div className="portal-account">
          <Avatar initials={account.initials} tone="green" />
          <div><strong>{account.name}</strong><small>{account.detail}</small></div>
          <IconButton label="Вийти"><LogOut size={20} /></IconButton>
        </div>
      </aside>

      {menuOpen ? <button type="button" className="portal-backdrop" aria-label="Закрити меню" onClick={() => setMenuOpen(false)} /> : null}

      <main className="portal-main">
        <header className="portal-topbar">
          <button type="button" className="portal-menu-button" aria-label="Відкрити меню" onClick={() => setMenuOpen(true)}><Menu size={24} /></button>
          <div><small>{roleInfo.label}</small><strong>{activeScreen.title}</strong></div>
          <div className="portal-topbar__actions">
            <IconButton label="Сповіщення"><Bell size={22} /></IconButton>
            <Avatar initials={account.initials} tone="green" />
          </div>
        </header>
        <section className="portal-content">{screenContent}</section>
      </main>
    </div>
  );
}
