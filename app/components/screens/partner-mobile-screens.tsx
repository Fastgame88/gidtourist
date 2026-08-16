"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Edit3,
  Eye,
  Facebook,
  Globe2,
  Home,
  Hotel,
  Image as ImageIcon,
  Info,
  Instagram,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  QrCode,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  WalletCards,
  Wifi,
} from "lucide-react";
import type { RoleKey } from "../../lib/navigation";

type Navigate = (role: RoleKey, slug: string) => void;
type PartnerProps = { navigate: Navigate };

const heroImage = "/images/mountain-hotel.webp";

function PartnerHeader({ title, back, navigate }: { title: string; back?: string; navigate: Navigate }) {
  return (
    <header className="gt-partner-header">
      <button
        type="button"
        className="gt-partner-header__button"
        aria-label="Назад"
        onClick={() => back ? navigate("partner", back) : history.back()}
      >
        <ArrowLeft size={25} />
      </button>
      <strong>{title}</strong>
      <button type="button" className="gt-partner-header__button" aria-label="Меню"><MoreVertical size={25} /></button>
    </header>
  );
}

function PartnerBottomNav({ active = "home", final = false, navigate }: { active?: string; final?: boolean; navigate: Navigate }) {
  const items = final
    ? [
        ["home", "Головна", Home, "partner-cabinet"],
        ["stats", "Статистика", BarChart3, "partner-statistics"],
        ["qr", "QR", QrCode, "scanner"],
        ["settlements", "Взаєморозрахунки", WalletCards, "partner-finance"],
        ["profile", "Профіль", UserRound, "place-editor"],
      ] as const
    : [
        ["home", "Головна", Home, "partner-onboarding"],
        ["info", "Інфо", Info, "partner-info"],
        ["stats", "Статистика", BarChart3, "partner-statistics"],
        ["profile", "Профіль", UserRound, "place-editor"],
      ] as const;

  return (
    <nav className={`gt-partner-bottom-nav ${final ? "is-final" : ""}`}>
      {items.map(([key, label, Icon, slug]) => (
        <button
          type="button"
          key={key}
          className={`${active === key ? "is-active" : ""} ${key === "qr" ? "is-qr" : ""}`}
          onClick={() => navigate("partner", slug)}
        >
          <Icon size={23} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function Hero({ compact = false, cabinet = false }: { compact?: boolean; cabinet?: boolean }) {
  return (
    <section className={`gt-partner-hero ${compact ? "is-compact" : ""} ${cabinet ? "is-cabinet" : ""}`}>
      <img src={heroImage} alt="Гірський готель" />
      <div className="gt-partner-logo-card">
        <span className="gt-partner-logo-mark">⌁</span>
        <strong>ГІРСЬКИЙ<br />ЗАТИШОК</strong>
        <small>ГОТЕЛЬ</small>
      </div>
      {!cabinet ? (
        <div className="gt-partner-hero__copy">
          <h1>Стати партнером</h1>
          <p>Рекламуйте послуги свого закладу<br />в Gid Tourist та залучайте нових клієнтів.</p>
        </div>
      ) : null}
    </section>
  );
}

const onboardingItems = [
  { slug: "partner-info", icon: Building2, title: "Інформація про заклад", note: "Фото, опис, зручності та контактні дані" },
  { slug: "partner-rules", icon: ClipboardList, title: "Правила проживання", note: "Додати або змінити правила для гостей" },
  { slug: "partner-wifi", icon: Wifi, title: "Wi‑Fi", note: "Назва мережі та пароль для гостей" },
  { slug: "partner-contacts", icon: Phone, title: "Контакти", note: "Телефони, email та інші способи зв’язку" },
  { slug: "partner-statistics", icon: BarChart3, title: "Статистика переходів", note: "Перегляди закладу та дії гостей у додатку" },
];

function OnboardingMenu({ navigate, start = false }: PartnerProps & { start?: boolean }) {
  return (
    <>
      <div className="gt-partner-list-card">
        {onboardingItems.map(({ slug, icon: Icon, title, note }) => (
          <button type="button" key={slug} onClick={() => navigate("partner", slug)}>
            <span className="gt-partner-list-icon"><Icon size={25} /></span>
            <span className="gt-partner-list-copy"><strong>{title}</strong><small>{note}</small></span>
            <ChevronRight size={23} />
          </button>
        ))}
      </div>
      <button type="button" className="gt-partner-refresh" onClick={() => navigate("partner", "partner-update")}>
        <RefreshCcw size={20} /> {start ? "Оновити інформацію" : "Продовжити заповнення"}
      </button>
    </>
  );
}

function PartnerEntryScreen({ navigate }: PartnerProps) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Стати партнером" navigate={navigate} />
      <main className="gt-partner-mobile-content">
        <Hero />
        <section className="gt-partner-join-card">
          <div className="gt-partner-join-card__main">
            <span><Sparkles size={26} /></span>
            <div>
              <strong>Долучайтеся до партнерської мережі</strong>
              <p>Підвищуйте впізнаваність закладу, отримуйте більше гостей і збільшуйте прибуток разом з нами.</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("partner", "partner-onboarding")}>Стати партнером</button>
          <small>Про можливості партнерства <ChevronRight size={16} /></small>
        </section>
        <OnboardingMenu navigate={navigate} start />
      </main>
      <PartnerBottomNav navigate={navigate} active="home" />
    </div>
  );
}

function PartnerOnboardingHome({ navigate }: PartnerProps) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Стати партнером" back="partner-dashboard" navigate={navigate} />
      <main className="gt-partner-mobile-content">
        <Hero compact />
        <section className="gt-partner-join-card gt-partner-join-card--stacked">
          <div className="gt-partner-join-card__main">
            <span><ShieldCheck size={25} /></span>
            <div><strong>Долучайтеся до партнерської мережі</strong><p>Заповніть інформацію про заклад. Після перевірки кабінет партнера стане активним.</p></div>
          </div>
          <button type="button" onClick={() => navigate("partner", "partner-info")}>Дізнатися більше</button>
          <small>Про можливості партнерства <ChevronRight size={16} /></small>
        </section>
        <OnboardingMenu navigate={navigate} start />
      </main>
      <PartnerBottomNav navigate={navigate} active="home" />
    </div>
  );
}

function FieldRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={`gt-partner-field-row ${multiline ? "is-multiline" : ""}`}>
      <span><small>{label}</small><strong>{value}</strong></span>
      <Edit3 size={18} />
    </div>
  );
}

function PartnerInfoScreen({ navigate }: PartnerProps) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Інформація про заклад" back="partner-onboarding" navigate={navigate} />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <section className="gt-partner-photo-editor">
          <img src={heroImage} alt="Фото закладу" />
          <button type="button"><ImageIcon size={17} /> Змінити фото</button>
        </section>
        <div className="gt-partner-form-card">
          <FieldRow label="Назва закладу" value="Гірський Затишок" />
          <div className="gt-partner-field-row"><span><small>Тип закладу</small><strong>Готель</strong></span><ChevronRight size={18} /></div>
          <div className="gt-partner-field-row"><span><small>Адреса</small><strong>Татарів, вул. Незалежності, 155</strong></span><MapPin size={18} /></div>
          <FieldRow label="Опис" value="Затишний готель у серці Карпат з видом на гори та річку. Комфортні номери, чан, сауна та відкритий басейн." multiline />
          <FieldRow label="Послуги" value="SPA · чан · паркінг · Wi‑Fi · басейн" />
          <FieldRow label="Кількість номерів" value="18 номерів" />
          <FieldRow label="Рік відкриття" value="2018" />
          <FieldRow label="Мови обслуговування" value="Українська, English, Polski" />
          <FieldRow label="Тип розміщення" value="Готель" />
        </div>
      </main>
      <PartnerBottomNav navigate={navigate} active="info" />
    </div>
  );
}

function RulesScreen({ navigate }: PartnerProps) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Правила проживання" back="partner-onboarding" navigate={navigate} />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <h3 className="gt-partner-section-title">Загальні правила</h3>
        <div className="gt-partner-form-card">
          {[
            [Clock3, "Поселення з 14:00"],
            [Clock3, "Виселення до 11:00"],
            [ShieldCheck, "Куріння заборонено в приміщеннях готелю"],
            [Clock3, "Тихий час з 22:00 до 08:00"],
            [Store, "Розміщення з домашніми тваринами за попереднім погодженням"],
          ].map(([Icon, text]) => {
            const RuleIcon = Icon as typeof Clock3;
            return <div className="gt-partner-rule-row" key={text as string}><RuleIcon size={18} /><span>{text as string}</span><Edit3 size={17} /></div>;
          })}
        </div>
        <div className="gt-partner-text-section"><strong>Скасування бронювання</strong><p>Безкоштовне скасування бронювання можливе за 7 днів до дати заїзду. У разі пізнішого скасування стягується штраф у розмірі вартості першої доби.</p></div>
        <div className="gt-partner-text-section"><strong>Оплата</strong><p>Ми приймаємо готівку, банківські картки та безготівковий розрахунок.</p><div className="gt-payment-badges"><b>VISA</b><b>●●</b><b>G Pay</b></div></div>
        <div className="gt-partner-text-section"><strong>Інші умови</strong><p>Адміністрація готелю залишає за собою право змінювати правила проживання. Актуальні правила діють на момент поселення.</p></div>
      </main>
      <PartnerBottomNav navigate={navigate} active="info" />
    </div>
  );
}

function WifiScreen({ navigate }: PartnerProps) {
  const [show, setShow] = useState(true);
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Wi‑Fi" back="partner-onboarding" navigate={navigate} />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-wifi-hero"><span><Wifi size={62} /></span><strong>Безкоштовний Wi‑Fi для гостей</strong></div>
        <div className="gt-partner-form-card">
          <FieldRow label="Назва мережі (SSID)" value="Girskyi_Zatyshok_Guest" />
          <div className="gt-partner-field-row"><span><small>Пароль</small><strong className="gt-green-text">{show ? "zatyshok155" : "••••••••••"}</strong></span><button type="button" onClick={() => setShow((v) => !v)}><Eye size={18} /></button><Edit3 size={18} /></div>
        </div>
        <div className="gt-partner-tip-box"><strong>Поради для підключення</strong><ul><li>Переконайтеся, що Wi‑Fi увімкнено на вашому пристрої.</li><li>Якщо підключення не вдається, спробуйте перезавантажити пристрій.</li><li>Зверніться до адміністрації у разі проблем.</li></ul></div>
      </main>
      <PartnerBottomNav navigate={navigate} active="info" />
    </div>
  );
}

function ContactsScreen({ navigate }: PartnerProps) {
  const contacts = [
    [Phone, "Телефон", "+38 067 123 45 67"], [Phone, "Viber / Telegram", "+38 067 123 45 67"], [Mail, "Email", "info@girskiy-zatyshok.ua"],
    [Globe2, "Сайт", "girskiy-zatyshok.ua"], [Instagram, "Instagram", "@girskyi_zatyshok"], [Facebook, "Facebook", "facebook.com/girskiy.zatyshok"], [MapPin, "Адреса", "Татарів, вул. Незалежності, 155"],
  ] as const;
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Контакти" back="partner-onboarding" navigate={navigate} />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-partner-form-card gt-contact-list">
          {contacts.map(([Icon, label, value]) => <div className="gt-contact-row" key={label}><Icon size={21} /><span><small>{label}</small><strong>{value}</strong></span><Edit3 size={17} /></div>)}
        </div>
        <div className="gt-partner-hours"><span><Clock3 size={22} /><strong>Режим роботи</strong></span><Edit3 size={17} /><div><small>Щодня</small><b>00:00 – 24:00</b></div></div>
      </main>
      <PartnerBottomNav navigate={navigate} active="info" />
    </div>
  );
}

function StatisticsScreen({ navigate, final = false }: PartnerProps & { final?: boolean }) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Статистика переходів" back={final ? "partner-cabinet" : "partner-onboarding"} navigate={navigate} />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-stat-tabs"><button className="is-active">Тиждень</button><button>Місяць</button><button>Рік</button></div>
        <div className="gt-stat-total"><small>Всього переходів</small><strong>1 248</strong><span>↑ 18% порівняно з попереднім тижнем</span></div>
        <div className="gt-stat-chart"><strong>Графік переходів</strong><div className="gt-stat-chart__area"><svg viewBox="0 0 300 110" role="img" aria-label="Графік переходів"><polyline points="8,66 52,28 96,55 140,25 184,69 228,24 292,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><g>{[[8,66],[52,28],[96,55],[140,25],[184,69],[228,24],[292,10]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="white" stroke="currentColor" strokeWidth="3" />)}</g></svg><div><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Нд</span></div></div></div>
        <div className="gt-stat-sources"><strong>Джерела переходів</strong>{[["Пошук додатку","713 (57%)",57],["Карта","312 (25%)",25],["Категорії","148 (12%)",12],["Рекомендації","75 (6%)",6]].map(([name,value,width])=><div key={name as string}><span><b>{name as string}</b><small>{value as string}</small></span><i><em style={{width:`${width}%`}} /></i></div>)}</div>
      </main>
      <PartnerBottomNav navigate={navigate} active="stats" final={final} />
    </div>
  );
}

function UpdateScreen({ navigate }: PartnerProps) {
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav">
      <PartnerHeader title="Оновити інформацію" back="partner-onboarding" navigate={navigate} />
      <main className="gt-partner-mobile-content gt-partner-form-page">
        <div className="gt-update-notice"><Info size={25} /><p>Підтримуйте інформацію актуальною, щоб гості завжди отримували достовірні дані про ваш заклад.</p></div>
        <div className="gt-update-list"><strong>Що можна оновити</strong><ul><li>Фото закладу та номерів</li><li>Опис та інформацію</li><li>Послуги та зручності</li><li>Правила проживання</li><li>Контактні дані</li><li>Ціни та спеціальні пропозиції</li></ul></div>
        <button type="button" className="gt-partner-refresh gt-partner-refresh--large" onClick={() => navigate("partner", "partner-cabinet")}><Save size={19} /> Оновити зараз</button>
        <div className="gt-last-update"><CalendarDays size={22} /><span><small>Останнє оновлення</small><strong>12 травня 2024, 14:30</strong></span></div>
      </main>
      <PartnerBottomNav navigate={navigate} active="info" />
    </div>
  );
}

function CabinetScreen({ navigate }: PartnerProps) {
  const items = [
    ["partner-services", Hotel, "Послуги закладу", "Додавайте та керуйте послугами вашого закладу"],
    ["partner-info", Building2, "Інформація про заклад", "Фото, опис, зручності та контактні дані"],
    ["partner-rules", ClipboardList, "Правила проживання", "Додати або змінити правила для гостей"],
    ["partner-wifi", Wifi, "Wi‑Fi", "Назва мережі та пароль для гостей"],
    ["partner-contacts", Phone, "Контакти", "Телефони, email та інші способи зв’язку"],
    ["partner-checkin", Clock3, "Час заїзду-виїзду", "Налаштуйте час заїзду та виїзду для гостей"],
  ] as const;
  return (
    <div className="gt-partner-mobile-screen has-bottom-nav is-cabinet-screen">
      <PartnerHeader title="Кабінет партнера" navigate={navigate} />
      <main className="gt-partner-mobile-content">
        <Hero cabinet />
        <div className="gt-partner-cabinet-list">
          {items.map(([slug, Icon, title, note]) => <button type="button" key={slug} onClick={() => navigate("partner", slug)}><span className="gt-partner-list-icon"><Icon size={25} /></span><span className="gt-partner-list-copy"><strong>{title}</strong><small>{note}</small></span><ChevronRight size={23} /></button>)}
        </div>
      </main>
      <PartnerBottomNav navigate={navigate} active="home" final />
    </div>
  );
}

function SimpleCabinetSection({ navigate, title, icon: Icon, description }: PartnerProps & { title: string; icon: typeof BedDouble; description: string }) {
  return <div className="gt-partner-mobile-screen has-bottom-nav"><PartnerHeader title={title} back="partner-cabinet" navigate={navigate} /><main className="gt-partner-mobile-content gt-partner-form-page"><div className="gt-simple-partner-section"><span><Icon size={44} /></span><h2>{title}</h2><p>{description}</p><button type="button" className="gt-partner-refresh"><RefreshCcw size={19} /> Зберегти зміни</button></div></main><PartnerBottomNav navigate={navigate} active="home" final /></div>;
}

export function PartnerMobileScreen({ slug, navigate }: { slug: string; navigate: Navigate }) {
  switch (slug) {
    case "partner-dashboard": return <PartnerEntryScreen navigate={navigate} />;
    case "partner-onboarding": return <PartnerOnboardingHome navigate={navigate} />;
    case "partner-info": return <PartnerInfoScreen navigate={navigate} />;
    case "partner-rules": return <RulesScreen navigate={navigate} />;
    case "partner-wifi": return <WifiScreen navigate={navigate} />;
    case "partner-contacts": return <ContactsScreen navigate={navigate} />;
    case "partner-statistics": return <StatisticsScreen navigate={navigate} />;
    case "partner-update": return <UpdateScreen navigate={navigate} />;
    case "partner-cabinet": return <CabinetScreen navigate={navigate} />;
    case "partner-services": return <SimpleCabinetSection navigate={navigate} title="Послуги закладу" icon={Hotel} description="Тут буде керування послугами закладу. Поточну логіку проєкту не видалено — цей екран підготовлений під новий дизайн кабінету." />;
    case "partner-checkin": return <SimpleCabinetSection navigate={navigate} title="Час заїзду-виїзду" icon={Clock3} description="Налаштування часу заїзду та виїзду гостей у новому партнерському інтерфейсі." />;
    default: return null;
  }
}
