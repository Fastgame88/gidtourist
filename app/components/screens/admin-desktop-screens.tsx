"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Edit3,
  Database,
  Eye,
  FileText,
  Filter,
  Gift,
  ImagePlus,
  Info,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MoreVertical,
  Palette,
  Percent,
  Plug,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Store,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
  UtensilsCrossed,
  Waves,
  Camera,
  ShoppingBag,
  Send,
  Star,
} from "lucide-react";
import type { RoleKey } from "../../lib/navigation";
import { adminStage2Fetch, type Stage2Category, type Stage2PlaceTypeTemplate } from "../../lib/stage2-api";

type Navigate = (role: RoleKey, slug: string) => void;
type AdminProps = { navigate: Navigate };

type NavKey = "partners" | "content" | "clients" | "settlements" | "bonuses" | "statistics" | "settings";

type TableColumn = {
  label: string;
  className?: string;
};

const adminNav: Array<{ key: NavKey; label: string; slug: string; icon: typeof UserRound }> = [
  { key: "partners", label: "Партнери", slug: "admin-partners", icon: UserRound },
  { key: "content", label: "Контент / QR", slug: "admin-stage2", icon: MapPin },
  { key: "clients", label: "Клієнти", slug: "admin-clients", icon: UsersRound },
  { key: "settlements", label: "Взаєморозрахунки", slug: "admin-settlements", icon: FileText },
  { key: "bonuses", label: "Бонуси", slug: "admin-bonuses", icon: Gift },
  { key: "statistics", label: "Статистика", slug: "admin-statistics", icon: BarChart3 },
  { key: "settings", label: "Налаштування", slug: "admin-settings", icon: Settings },
];

function AdminLogo() {
  return (
    <div className="ad-logo">
      <span className="ad-logo__mark">
        <svg viewBox="0 0 44 34" aria-hidden="true">
          <path d="M3 29L13 13l8 10 7-14 13 20H3Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M8 24h27" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>
      <strong>Gid Tourist</strong>
    </div>
  );
}

function AdminSidebar({ active, navigate }: { active: NavKey; navigate: Navigate }) {
  return (
    <aside className="ad-sidebar">
      <AdminLogo />
      <nav className="ad-sidebar__nav">
        {adminNav.map(({ key, label, slug, icon: Icon }) => (
          <button
            type="button"
            key={key}
            className={active === key ? "is-active" : ""}
            onClick={() => navigate("admin", slug)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="ad-sidebar__account">
        <span>А</span>
        <div>
          <strong>Адміністратор</strong>
          <small>admin@gidtourist.ua</small>
        </div>
        <ChevronDown size={16} />
      </div>
    </aside>
  );
}

function AdminShell({ active, navigate, children, contentClassName = "" }: AdminProps & { active: NavKey; children: ReactNode; contentClassName?: string }) {
  return (
    <div className="ad-shell">
      <AdminSidebar active={active} navigate={navigate} />
      <main className={`ad-main ${contentClassName}`.trim()}>{children}</main>
    </div>
  );
}

function AdminPageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: () => void;
}) {
  return (
    <header className="ad-page-header">
      <div className="ad-page-header__copy">
        {back ? (
          <button type="button" className="ad-back-link" onClick={back}>
            <ArrowLeft size={17} /> Назад
          </button>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <div className="ad-page-header__action">{action}</div> : null}
    </header>
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="ad-btn ad-btn--primary" onClick={onClick}>
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="ad-btn ad-btn--outline" onClick={onClick}>
      {children}
    </button>
  );
}

function SearchBox({ placeholder }: { placeholder: string }) {
  return (
    <label className="ad-search-box">
      <Search size={20} />
      <input placeholder={placeholder} />
    </label>
  );
}

function SelectBox({ label, value }: { label?: string; value: string }) {
  return (
    <button type="button" className="ad-select-box">
      <span>
        {label ? <small>{label}</small> : null}
        <strong>{value}</strong>
      </span>
      <ChevronDown size={16} />
    </button>
  );
}


function MiniSparkline() {
  return (
    <svg className="ad-spark" viewBox="0 0 120 28" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points="2,23 18,20 31,14 47,16 63,10 78,13 94,7 118,4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DateRange({ value = "01.05.2024 – 31.05.2024" }: { value?: string }) {
  return (
    <button type="button" className="ad-date-range">
      <CalendarDays size={17} />
      <span>{value}</span>
      <ChevronDown size={15} />
    </button>
  );
}

function FilterStrip({ type = "partners" }: { type?: "partners" | "clients" | "bonuses" | "settlements" | "stats" }) {
  const isPartners = type === "partners";
  const isClients = type === "clients";
  const isSettlements = type === "settlements";
  const isBonuses = type === "bonuses";
  return (
    <div className="ad-filter-strip">
      {type !== "stats" ? <SearchBox placeholder={isPartners || isSettlements ? "Пошук партнера..." : "Пошук клієнта..."} /> : null}
      {isClients || isBonuses ? <SelectBox label="Статус" value="Усі статуси" /> : null}
      {isPartners || isSettlements || type === "stats" ? <SelectBox label="Локація" value="Усі локації" /> : null}
      {isPartners || isSettlements || type === "stats" ? <SelectBox label="Категорія" value="Усі категорії" /> : null}
      {isPartners ? <SelectBox label="Тип розміщення" value="Усі типи" /> : null}
      {isPartners ? <SelectBox label="Статус" value="Усі статуси" /> : null}
      {isSettlements ? <SelectBox label="Статус рахунку" value="Усі статуси" /> : null}
      {isSettlements ? <SelectBox label="Статус оплати" value="Усі статуси" /> : null}
      {isClients || isBonuses ? <SelectBox label="Місто / локація" value="Усі міста" /> : null}
      {isBonuses ? <SelectBox label="Загальний статус" value="Усі статуси" /> : null}
      {isBonuses ? <SelectBox label="Рівень бонусів" value="Усі" /> : null}
      {type === "stats" ? <SelectBox label="Тип розміщення" value="Усі типи" /> : null}
      {type === "stats" ? <SelectBox label="Статус партнера" value="Усі статуси" /> : null}
      <OutlineButton><RefreshCcw size={17} /> Скинути фільтри</OutlineButton>
    </div>
  );
}

function Status({ tone = "green", children }: { tone?: "green" | "blue" | "gray" | "orange" | "red"; children: ReactNode }) {
  return <span className={`ad-status ad-status--${tone}`}>{children}</span>;
}

function AdminTable({ columns, children }: { columns: TableColumn[]; children: ReactNode }) {
  return (
    <div className="ad-table-wrap">
      <div className="ad-table-head" style={{ gridTemplateColumns: columns.map((c) => c.className || "1fr").join(" ") }}>
        {columns.map((col) => <span key={col.label}>{col.label}</span>)}
      </div>
      {children}
    </div>
  );
}

function TableRow({ columns, children }: { columns: string[]; children: ReactNode }) {
  return <div className="ad-table-row" style={{ gridTemplateColumns: columns.join(" ") }}>{children}</div>;
}

function Pagination({ label }: { label: string }) {
  return (
    <div className="ad-pagination">
      <span>{label}</span>
      <div>
        <button type="button"><ChevronLeft size={16} /></button>
        <button type="button" className="is-active">1</button>
        <button type="button">2</button>
        <button type="button">3</button>
        <span>…</span>
        <button type="button"><ChevronRight size={16} /></button>
      </div>
      <SelectBox value="10 на сторінці" />
    </div>
  );
}

function PartnerListIcon({ name }: { name: string }) {
  const Icon = name.includes("Колиба") ? UtensilsCrossed
    : name.includes("Чан") ? Waves
    : name.includes("Jeep") || name.includes("Таксі") ? BriefcaseBusiness
    : name.includes("Рафтинг") ? Waves
    : name.includes("Фотограф") ? Camera
    : name.includes("сувеніри") ? ShoppingBag
    : Info;
  return <span className="ad-partner-list-icon"><Icon size={22} /></span>;
}

const partnerRows = [
  ["🍴", "Колиба “Біля річки”", "Ресторан", "Де поїсти", "Яремче", "Преміум", "Активний"],
  ["♨", "Чан Карпати", "Чани", "Де відпочити", "Микуличин", "Преміум", "Активний"],
  ["🚙", "Jeep Tour Карпати", "Джип-тури", "Розваги", "Буковель", "Преміум", "Активний"],
  ["🌊", "Рафтинг Прут", "Рафтинг", "Розваги", "Ворохта", "Преміум", "Активний"],
  ["📷", "Фотограф Карпати", "Фото-послуги", "Розваги", "Яремче", "Преміум", "Чернетка"],
  ["🛍", "Гуцульські сувеніри", "Магазин", "Де купити", "Косів", "Преміум", "Активний"],
  ["🚕", "Таксі Карпати", "Трансфер", "Трансфер", "Івано-Франківськ", "Преміум", "Активний"],
  ["ⓘ", "Рятувальна служба Карпат", "Халепа?", "Халепа?", "Яремче", "Соціальний", "Активний"],
];

function PartnersScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="partners" navigate={navigate} contentClassName="ad-main--partners">
      <AdminPageHeader
        title="Партнери"
        action={<PrimaryButton onClick={() => navigate("admin", "admin-partner-create")}><Plus size={18} /> Новий партнер</PrimaryButton>}
      />
      <FilterStrip type="partners" />
      <AdminTable columns={[
        { label: "Назва", className: "1.8fr" }, { label: "Категорія", className: "1fr" }, { label: "Локація", className: ".9fr" },
        { label: "Тип розміщення", className: "1.05fr" }, { label: "Статус", className: ".8fr" }, { label: "Дії", className: ".7fr" },
      ]}>
        {partnerRows.map((row) => (
          <TableRow key={row[1]} columns={["1.8fr", "1fr", ".9fr", "1.05fr", ".8fr", ".7fr"]}>
            <div className="ad-entity-cell"><PartnerListIcon name={row[1]} /><div><strong>{row[1]}</strong><small>{row[2]}</small></div></div>
            <span>{row[3]}</span><span>{row[4]}</span><Status>{row[5]}</Status>
            <Status tone={row[6] === "Чернетка" ? "gray" : "green"}>{row[6]}</Status>
            <div className="ad-row-actions"><button onClick={() => navigate("admin", "admin-partner-details")}><Eye size={17} /></button><button onClick={() => navigate("admin", "admin-partner-details")}><Edit3 size={17} /></button><button><MoreVertical size={17} /></button></div>
          </TableRow>
        ))}
      </AdminTable>
      <Pagination label="Показано 1–8 з 8 партнерів" />
    </AdminShell>
  );
}

const clientRows = [
  ["ІК", "Ірина Коваль", "Активний користувач", "Івано-Франківськ", "Активний", "1 280 балів", "Сканування QR · 18.05.2024"],
  ["ОМ", "Олександр Мельник", "Пасивний користувач", "Львів", "Активний", "420 балів", "Перегляд локації · 17.05.2024"],
  ["МФ", "Марія Федоришин", "Активний користувач", "Яремче", "Активний", "2 150 балів", "Бронювання · 16.05.2024"],
  ["АП", "Андрій Петрук", "Пасивний користувач", "Київ", "Неактивний", "90 балів", "Вхід у застосунок · 14.05.2024"],
  ["НБ", "Наталія Бойчук", "Активний користувач", "Татарів", "Активний", "860 балів", "Використано пропозицію · 13.05.2024"],
  ["ІГ", "Іван Гаврилюк", "Активний користувач", "Буковель", "На модерації", "530 балів", "Залишив відгук · 12.05.2024"],
  ["ХС", "Христина Савчук", "Пасивний користувач", "Чернівці", "Активний", "300 балів", "Перегляд бонусів · 11.05.2024"],
  ["ВК", "Василь Клим", "Активний користувач", "Коломия", "Чернетка", "0 балів", "Реєстрація · 10.05.2024"],
];

function ClientsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="clients" navigate={navigate} contentClassName="ad-main--clients">
      <AdminPageHeader title="Клієнти" />
      <FilterStrip type="clients" />
      <AdminTable columns={[
        { label: "Ім'я", className: "1.5fr" }, { label: "Місто / локація", className: "1fr" }, { label: "Статус", className: ".9fr" },
        { label: "Бонуси", className: ".8fr" }, { label: "Остання активність", className: "1.45fr" }, { label: "Дії", className: ".8fr" },
      ]}>
        {clientRows.map((row) => (
          <TableRow key={row[1]} columns={["1.5fr", "1fr", ".9fr", ".8fr", "1.45fr", ".8fr"]}>
            <div className="ad-client-cell"><span>{row[0]}</span><div><strong>{row[1]}</strong><small>{row[2]}</small></div></div>
            <span>{row[3]}</span>
            <Status tone={row[4] === "Активний" ? "green" : row[4] === "На модерації" ? "orange" : "gray"}>{row[4]}</Status>
            <strong>{row[5]}</strong><span>{row[6]}</span>
            <div className="ad-row-actions"><button className="ad-text-btn" onClick={() => navigate("admin", "admin-client-details")}>Картка</button><button><MoreVertical size={17} /></button></div>
          </TableRow>
        ))}
      </AdminTable>
      <Pagination label="Показано 1–8 з 8 клієнтів" />
    </AdminShell>
  );
}

function SummaryCard({ label, value, note, tone = "green", icon }: { label: string; value: string; note?: string; tone?: string; icon?: ReactNode }) {
  return (
    <div className={`ad-summary-card ad-summary-card--${tone}`}>
      {icon ? <span className="ad-summary-card__icon">{icon}</span> : null}
      <div><small>{label}</small><strong>{value}</strong>{note ? <em>{note}</em> : null}</div>
    </div>
  );
}

function BonusesScreen({ navigate }: AdminProps) {
  const rows = [
    ["ІП", "Іван Петренко", "+380 67 123 45 67", "Яремче", "Активний", "2 450", "12 850", "10 400", "Сьогодні, 10:30"],
    ["ОМ", "Ольга Мельник", "+380 50 765 43 21", "Микуличин", "Активний", "1 870", "8 230", "6 360", "Вчора, 18:45"],
    ["АС", "Андрій Савчук", "+380 63 987 65 43", "Ворохта", "Неактивний", "560", "5 600", "5 040", "20.05.2024"],
    ["НК", "Наталія Коваль", "+380 68 234 56 78", "Косів", "Активний", "3 290", "15 750", "12 460", "Сьогодні, 09:15"],
    ["ДБ", "Дмитро Бондар", "+380 97 654 32 10", "Буковель", "Заблокований", "0", "2 150", "2 150", "10.03.2024"],
    ["ІВ", "Ірина Василенко", "+380 66 321 45 67", "Яремче", "Активний", "1 120", "4 980", "3 860", "19.05.2024"],
  ];
  return (
    <AdminShell active="bonuses" navigate={navigate}>
      <AdminPageHeader title="Бонуси" action={<div className="ad-page-actions"><DateRange /><PrimaryButton><Download size={17}/> Експорт</PrimaryButton></div>} />
      <div className="ad-summary-grid ad-summary-grid--five">
        <SummaryCard label="Загальний оборот" value="1 245 820 грн" note="+12.5%" tone="green" />
        <SummaryCard label="Нараховано бонусів" value="124 582" note="+8.3%" tone="violet" />
        <SummaryCard label="Використано бонусів" value="68 120" note="+10.1%" tone="blue" />
        <SummaryCard label="Середній відсоток" value="5.48%" note="+0.6%" tone="orange" />
        <SummaryCard label="Кількість клієнтів" value="1 248" note="+14.2%" tone="green" />
      </div>
      <FilterStrip type="bonuses" />
      <AdminTable columns={[
        { label: "Ім'я", className: "1.35fr" }, { label: "Телефон", className: "1fr" }, { label: "Місто", className: ".8fr" }, { label: "Загальний статус", className: ".9fr" },
        { label: "Бонуси на рахунку", className: ".9fr" }, { label: "Нараховано всього", className: ".9fr" }, { label: "Використано всього", className: ".9fr" }, { label: "Остання активність", className: "1fr" },
      ]}>
        {rows.map((r) => <TableRow key={r[1]} columns={["1.35fr", "1fr", ".8fr", ".9fr", ".9fr", ".9fr", ".9fr", "1fr"]}>
          <div className="ad-client-cell"><span>{r[0]}</span><div><strong>{r[1]}</strong><small>{r[2]}</small></div></div>
          <span>{r[2]}</span><span>{r[3]}</span><Status tone={r[4] === "Активний" ? "green" : r[4] === "Заблокований" ? "red" : "gray"}>{r[4]}</Status>
          <strong className="ad-green-number">{r[5]}</strong><strong>{r[6]}</strong><strong>{r[7]}</strong><span>{r[8]}</span>
        </TableRow>)}
      </AdminTable>
      <Pagination label="Показано 1–8 з 1 248 клієнтів" />
    </AdminShell>
  );
}

function PartnerCreateScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="partners" navigate={navigate} contentClassName="ad-main--create">
      <AdminPageHeader
        title="Створення партнера"
        subtitle="Заповніть інформацію про партнера"
        action={<div className="ad-page-actions"><OutlineButton>Скасувати</OutlineButton><OutlineButton>Зберегти</OutlineButton><PrimaryButton><FileText size={17}/> Зберегти і розмістити</PrimaryButton></div>}
      />
      <section className="ad-create-form">
        {[
          ["1", "Назва", <input key="name" placeholder="Введіть назву партнера" />],
          ["2", "Категорія", <SelectBox key="category" value="Оберіть категорію" />],
          ["3", "Тип розміщення", <div key="placement" className="ad-placement-options"><label className="is-selected"><i><Check size={14}/></i><span><strong>Соціальний</strong><small>Безкоштовне розміщення</small></span></label><label><i/><span><strong>Базовий</strong><small>Інфо про заклад + QR для гостей</small></span></label><label><i/><span><strong>Платний / Преміум</strong><small>Просування послуг та монетизація</small></span></label></div>],
          ["4", "Ставка, %", <div key="rate" className="ad-input-with-suffix"><input placeholder="Наприклад, 10"/><span>%</span></div>],
          ["5", "Адреса або геолокація", <div key="addr" className="ad-inline-field"><input placeholder="Введіть адресу"/><OutlineButton><MapPin size={16}/> Вказати на мапі</OutlineButton></div>],
          ["6", "Телефон", <input key="phone" placeholder="+380 (___) ___-__-__" />],
          ["7", "Графік роботи", <div key="schedule" className="ad-placement-options ad-placement-options--schedule"><label><i/><span><strong>Цілодобово</strong></span></label><label className="is-selected"><i><Check size={14}/></i><span><strong>За графіком</strong></span><b>09:00</b><em>–</em><b>18:00</b></label></div>],
          ["8", "Короткий опис", <textarea key="desc" placeholder="Опишіть партнера, послуги, особливості тощо..." rows={3} />],
          ["9", "Фото", <button key="photo" className="ad-upload-box"><ImagePlus size={23}/><span><strong>Завантажте 3 фото партнера</strong><small>Рівно 3 фото — обов'язково</small></span></button>],
          ["10", "Telegram ID", <input key="tg" placeholder="Введіть Telegram ID (числовий ідентифікатор)" />],
          ["11", "Структура кабінету партнера", <div key="modules" className="ad-module-grid"><div className="ad-module-preview"><strong>Каркас</strong><small>Базова структура кабінету партнера</small><span>7 модулів увімкнено</span></div>{["Час заїзду / виїзду","Рецепція","Wi‑Fi","Парковка","Правила проживання","Сніданок","Оперативні контакти","Інше"].map((m)=><label key={m}><i><Check size={13}/></i>{m}</label>)}</div>],
        ].map(([num, label, control]) => <div className={`ad-create-row ad-create-row--${num as string}`} key={num as string}><div className="ad-create-row__label"><span>{num as string}</span><strong>{label as string}</strong></div><div className="ad-create-row__control">{control as ReactNode}</div></div>)}
      </section>
    </AdminShell>
  );
}

function ClientHeader({ navigate }: AdminProps) {
  return (
    <div className="ad-detail-header ad-client-detail-header">
      <div className="ad-detail-person">
        <span className="ad-client-header-avatar"><UserRound size={25} /></span>
        <div>
          <div className="ad-detail-title-line"><h1>Ірина Коваль</h1><Status>Активний</Status></div>
          <small>ID клієнта: 00187 · Зареєстровано: 03.02.2024 · Оновлено: 20.05.2024</small>
        </div>
      </div>
      <div className="ad-page-actions"><OutlineButton><Edit3 size={16}/> Редагувати</OutlineButton><OutlineButton><ShieldCheck size={16}/> Заблокувати</OutlineButton><PrimaryButton onClick={() => navigate("admin", "admin-client-history")}>Інші дії <ChevronDown size={15}/></PrimaryButton></div>
    </div>
  );
}

function ClientInfoItem({ icon, label, children, className = "" }: { icon: ReactNode; label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`ad-client-info-item ${className}`.trim()}>
      <span className="ad-client-info-item__icon">{icon}</span>
      <div><small>{label}</small>{children}</div>
    </div>
  );
}

function ClientDetailsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="clients" navigate={navigate} contentClassName="ad-main--clients ad-main--client-detail">
      <ClientHeader navigate={navigate}/>
      <section className="ad-detail-card ad-client-detail-card">
        <div className="ad-detail-card__title"><h2>Дані клієнта</h2><Status>Після погодження даних ви зможете редагувати клієнта</Status></div>
        <div className="ad-client-reference-grid">
          <div className="ad-client-reference-col">
            <ClientInfoItem icon={<UserRound size={17}/>} label="Тип клієнта"><strong>Активний користувач</strong></ClientInfoItem>
            <ClientInfoItem icon={<Phone size={17}/>} label="Телефон"><strong>+380 (98) 555-12-34</strong></ClientInfoItem>
            <ClientInfoItem icon={<MapPin size={17}/>} label="Місто / локація"><strong>Івано-Франківськ</strong></ClientInfoItem>
            <ClientInfoItem icon={<Clock3 size={17}/>} label="Остання активність"><strong>Сканування QR · 18.05.2024</strong></ClientInfoItem>
          </div>
          <div className="ad-client-reference-col">
            <ClientInfoItem icon={<ShieldCheck size={17}/>} label="Статус"><strong>Підтверджений</strong></ClientInfoItem>
            <ClientInfoItem icon={<Send size={17}/>} label="Telegram ID"><strong>@iryna_koval</strong></ClientInfoItem>
          </div>
          <div className="ad-client-reference-col ad-client-reference-col--wide">
            <ClientInfoItem icon={<FileText size={17}/>} label="Короткий профіль"><strong>Любить сімейний відпочинок у Карпатах, активні маршрути та локальну кухню.<br/>Часто користується рекомендаціями сервісу.</strong></ClientInfoItem>
            <ClientInfoItem icon={<Star size={17}/>} label="Інтереси"><span className="ad-tags"><i>Сімейний відпочинок</i><i>Релакс</i><i>Локальна кухня</i><i>Екскурсії</i></span></ClientInfoItem>
          </div>
        </div>
      </section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Бонуси</h2><Info size={16}/></div><div className="ad-summary-grid ad-summary-grid--four"><SummaryCard label="Поточний бонусний баланс" value="1 280 балів" note="Доступно для використання"/><SummaryCard label="Нараховано" value="3 640 балів" note="За весь період" tone="neutral"/><SummaryCard label="Використано" value="2 360 балів" note="За весь період" tone="neutral"/><SummaryCard label="Запрошені друзі" value="7" note="Успішні реєстрації" tone="neutral"/></div></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Статистика</h2><DateRange /></div><div className="ad-mini-stats">{[["Відкрито карток","86"],["QR-сканувань","24"],["Бронювань","5"],["Відвідано локацій","18"],["Відгуки","9"],["Використані пропозиції","12"]].map(([l,v])=><div key={l}><small>{l}</small><strong>{v}</strong><span>↗ 11%</span><MiniSparkline/></div>)}</div></section>
    </AdminShell>
  );
}

function ClientHistoryScreen({ navigate }: AdminProps) {
  const bonusHistory = [
    ["28.05.2024 14:32","Нарахування","Бронювання №B-4821\nГірський Затишок","+240","Зараховано"],
    ["24.05.2024 10:15","Нарахування","QR-сканування в локації\nВодоспад Пробій","+15","Зараховано"],
    ["20.05.2024 16:40","Списання","Оплата за бронювання №B-4710\nГірський Затишок","-180","Списано"],
    ["18.05.2024 09:22","Нарахування","Відгук про перебування\nГірський Затишок","+20","Зараховано"],
  ];
  return (
    <AdminShell active="clients" navigate={navigate} contentClassName="ad-main--clients ad-main--client-history">
      <ClientHeader navigate={navigate}/>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Історія бонусів</h2><DateRange/></div><AdminTable columns={[{label:"Дата / час",className:"1fr"},{label:"Тип операції",className:"1fr"},{label:"Опис",className:"2.2fr"},{label:"Бонуси",className:".7fr"},{label:"Партнер",className:"1.2fr"},{label:"Статус",className:".8fr"}]}>{bonusHistory.map((r)=><TableRow key={r[0]} columns={["1fr","1fr","2.2fr",".7fr","1.2fr",".8fr"]}><span>{r[0]}</span><Status tone={r[1]==="Списання"?"red":"green"}>{r[1]}</Status><span className="ad-preline">{r[2]}</span><strong className={r[3].startsWith("-")?"ad-red-number":"ad-green-number"}>{r[3]}</strong><span>Гірський Затишок</span><Status>{r[4]}</Status></TableRow>)}</AdminTable></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Історія активності</h2><DateRange/></div><AdminTable columns={[{label:"Дата / час",className:"1fr"},{label:"Тип активності",className:"1fr"},{label:"Деталі",className:"2fr"},{label:"Партнер / Локація",className:"1.4fr"},{label:"Пристрій",className:"1.2fr"}]}>{[["28.05.2024 14:32","Бронювання","Бронювання №B-4821\n2 дорослих, 2 ночі","Гірський Затишок\nЯремче","Веб\nChrome / Windows"],["24.05.2024 10:15","QR-сканування","Водоспад Пробій\nОтримано 15 бонусів","Гірський Затишок\nЯремче","Мобільний додаток\niOS 17.4"],["20.05.2024 16:40","Відгук","Оцінка 5 ⭐\nЧудове місце для відпочинку!","Гірський Затишок\nЯремче","Мобільний додаток\niOS 17.4"]].map((r)=><TableRow key={r[0]} columns={["1fr","1fr","2fr","1.4fr","1.2fr"]}><span>{r[0]}</span><strong>{r[1]}</strong><span className="ad-preline">{r[2]}</span><span className="ad-preline">{r[3]}</span><span className="ad-preline">{r[4]}</span></TableRow>)}</AdminTable></section>
    </AdminShell>
  );
}

function PartnerDetailHeader({ navigate }: AdminProps) {
  return (
    <div className="ad-detail-header ad-partner-detail-header">
      <div className="ad-detail-person">
        <span className="ad-partner-header-icon"><UtensilsCrossed size={24}/></span>
        <div>
          <div className="ad-detail-title-line"><h1>Ресторан «Гуцульщина»</h1><Status>Активний</Status></div>
          <small>ID партнера: 00057 · Створено: 15.03.2024 · Оновлено: 20.05.2024</small>
        </div>
      </div>
      <div className="ad-page-actions"><OutlineButton><Edit3 size={16}/> Редагувати</OutlineButton><OutlineButton>Призупинити</OutlineButton><PrimaryButton onClick={() => navigate("admin", "admin-partner-history")}>Інші дії <ChevronDown size={15}/></PrimaryButton></div>
    </div>
  );
}

function PartnerInfoItem({ icon, label, children, className = "" }: { icon: ReactNode; label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`ad-partner-info-item ${className}`.trim()}>
      <span className="ad-partner-info-item__icon">{icon}</span>
      <div><small>{label}</small>{children}</div>
    </div>
  );
}

function PartnerDetailsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="partners" navigate={navigate} contentClassName="ad-main--partner-detail">
      <PartnerDetailHeader navigate={navigate}/>
      <section className="ad-detail-card ad-partner-reference-card">
        <div className="ad-detail-card__title"><h2>Дані партнера</h2><Status>Після погодження даних ви зможете редагувати партнера</Status></div>
        <div className="ad-partner-reference-grid">
          <div className="ad-partner-reference-col">
            <PartnerInfoItem icon={<Store size={17}/>} label="Категорія"><strong>Харчування</strong></PartnerInfoItem>
            <PartnerInfoItem icon={<Building2 size={17}/>} label="Тип розміщення"><strong>Преміум партнер 🏅 (монетизований)</strong></PartnerInfoItem>
            <PartnerInfoItem icon={<Percent size={17}/>} label="Ставка, %"><strong>12%</strong></PartnerInfoItem>
            <PartnerInfoItem icon={<MapPin size={17}/>} label="Адреса / геолокація"><strong>м. Яремче, вул. Свободи, 247</strong></PartnerInfoItem>
            <PartnerInfoItem icon={<Phone size={17}/>} label="Телефон"><strong>+380 (98) 765-43-21</strong></PartnerInfoItem>
          </div>
          <div className="ad-partner-reference-col">
            <PartnerInfoItem icon={<Clock3 size={17}/>} label="Графік роботи"><strong>Щоденно 11:00 – 22:00</strong></PartnerInfoItem>
            <PartnerInfoItem icon={<FileText size={17}/>} label="Короткий опис"><strong>Ресторан гуцульської кухні з автентичними стравами, затишною атмосферою та видом на Карпати. Ідеальне місце для сімейного відпочинку та святкувань.</strong></PartnerInfoItem>
            <PartnerInfoItem icon={<Camera size={17}/>} label="Фото">
              <div className="ad-photo-strip ad-photo-strip--images">
                <img src="/images/mountain-hotel.webp" alt="Фото партнера 1" />
                <img src="/images/rest-excursion.webp" alt="Фото партнера 2" />
                <img src="/images/rest-massage.webp" alt="Фото партнера 3" />
                <span>+3</span>
              </div>
            </PartnerInfoItem>
          </div>
          <div className="ad-partner-reference-col ad-partner-reference-col--wide">
            <PartnerInfoItem icon={<Send size={17}/>} label="Telegram ID"><strong>@Hutsulshchyna_rest</strong></PartnerInfoItem>
            <PartnerInfoItem icon={<BriefcaseBusiness size={17}/>} label="Структура кабінету партнера">
              <span className="ad-tags">{["Меню","Резерв столика","Графік роботи","Контакти","Галерея","Акції та новини","Відгуки","Wi‑Fi","Парковка","Локація"].map(t=><i key={t}>✓ {t}</i>)}</span>
            </PartnerInfoItem>
          </div>
        </div>
      </section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Взаєморозрахунки</h2><Info size={16}/></div><div className="ad-settlement-equation"><SummaryCard label="Загальна сума продажів через додаток" value="247 360 ₴" note="За весь період"/><span>−</span><SummaryCard label="Нараховано комісії (платформою)" value="29 683 ₴" note="Комісія 12%" tone="neutral"/><span>−</span><SummaryCard label="Списано балів у партнера (клієнтами)" value="18 450 ₴" note="За весь період" tone="neutral"/><span>=</span><SummaryCard label="До сплати платформі" value="−59 087 ₴" note="Кредитний баланс" tone="green"/></div><button type="button" className="ad-link-button" onClick={() => navigate("admin", "admin-partner-history")}>Перейти до взаєморозрахунків →</button></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Статистика</h2><DateRange/></div><div className="ad-mini-stats">{[["Перегляди","4 125"],["QR-сканування","1 872"],["Бронювання столів","326"],["Кількість клієнтів","589"],["Відгуки","72"],["Продажі / операції","247 360 ₴"]].map(([l,v])=><div key={l}><small>{l}</small><strong>{v}</strong><span>↗ 13%</span><MiniSparkline/></div>)}</div></section>
    </AdminShell>
  );
}

function PartnerHistoryScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="partners" navigate={navigate} contentClassName="ad-main--partner-history">
      <PartnerDetailHeader navigate={navigate}/>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Історія взаєморозрахунків (нарахування за продаж)</h2><DateRange/></div><AdminTable columns={[{label:"Дата операції",className:"1fr"},{label:"Клієнт",className:"1fr"},{label:"Операція / Послуга",className:"2fr"},{label:"Сума продажу",className:"1fr"},{label:"Ставка платформи",className:"1fr"},{label:"Нараховано партнеру",className:"1.1fr"}]}>{[["31.05.2024 18:42","Іван Петренко","Рахунок №9371\nРесторанні послуги","1 280 ₴","10%","128 ₴"],["31.05.2024 15:21","Оксана Гнатюк","Рахунок №1362\nРесторанні послуги","950 ₴","10%","95 ₴"],["30.05.2024 20:05","Тарас Мельник","Рахунок №5181\nВечірнє обслуговування","5 600 ₴","10%","560 ₴"]].map(r=><TableRow key={r[0]} columns={["1fr","1fr","2fr","1fr","1fr","1.1fr"]}>{r.map((v,i)=><span key={i} className={i===2?"ad-preline":""}>{v}</span>)}</TableRow>)}</AdminTable></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Історія оплат бонусами (лише повна оплата)</h2></div><div className="ad-info-banner"><Info size={17}/> Оплата бонусами доступна лише на повну суму чека. Часткове списання бонусів недоступне.</div><AdminTable columns={[{label:"Дата операції",className:"1fr"},{label:"Клієнт",className:"1fr"},{label:"Операція / Послуга",className:"2fr"},{label:"Сума чека",className:"1fr"},{label:"Оплачено бонусами",className:"1.2fr"}]}>{[["31.05.2024 12:08","Іван Петренко","Рахунок №1391\nРесторанні послуги","1 120 ₴","1 120 бонусів"],["28.05.2024 21:44","Володимир Дячук","Рахунок №8350\nРесторанні послуги","3 480 ₴","3 480 бонусів"]].map(r=><TableRow key={r[0]} columns={["1fr","1fr","2fr","1fr","1.2fr"]}>{r.map((v,i)=><span key={i} className={i===2?"ad-preline":""}>{v}</span>)}</TableRow>)}</AdminTable></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Історія активності партнера</h2></div><AdminTable columns={[{label:"Дата та час",className:"1fr"},{label:"Тип дії",className:"1fr"},{label:"Опис",className:"2fr"},{label:"Виконавець",className:"1.5fr"}]}>{[["20.05.2024 11:28","Оновлення даних","Оновлено банківські реквізити партнера","Адміністратор (admin@gidtourist.ua)"],["15.05.2024 09:42","Фінансова операція","Додано списання бонус партнеру на суму 1 200 ₴","Адміністратор (admin@gidtourist.ua)"],["12.05.2024 16:15","Зміна статусу","Партнера активовано","Адміністратор (admin@gidtourist.ua)"]].map(r=><TableRow key={r[0]} columns={["1fr","1fr","2fr","1.5fr"]}>{r.map((v,i)=><span key={i}>{v}</span>)}</TableRow>)}</AdminTable></section>
    </AdminShell>
  );
}

function SettlementsScreen({ navigate }: AdminProps) {
  const rows = [
    ["🏠","Колиба “Біля річки”","Татарів","Де поїсти","1","7 400 грн","7 400 грн","0 грн","Оплачено","green"],
    ["🏨","Готель “Карпатські зорі”","Микуличин","Де відпочити","1","26 000 грн","18 000 грн","8 000 грн","Частково оплачено","orange"],
    ["🎡","Парк розваг “Драйв”","Поляниця","Розваги","1","18 750 грн","0 грн","18 750 грн","Прострочено","red"],
    ["🛍","Магазин “Гірські товари”","Яремче","Де купити","1","5 600 грн","5 600 грн","0 грн","Оплачено","green"],
    ["🚕","Таксі Карпати","Ворохта","Трансфер","1","3 200 грн","0 грн","3 200 грн","Очікує оплату","orange"],
  ];
  return (
    <AdminShell active="settlements" navigate={navigate} contentClassName="ad-main--settlements">
      <AdminPageHeader title="Взаєморозрахунки з партнерами" subtitle="Контроль рахунків і платежів партнерів" action={<div className="ad-page-actions"><DateRange/><PrimaryButton><Download size={17}/> Експорт</PrimaryButton></div>} />
      <div className="ad-summary-grid ad-summary-grid--five"><SummaryCard label="Виставлено рахунків" value="128 450 грн" note="12 рахунків" tone="blue"/><SummaryCard label="Оплачено" value="92 350 грн" note="8 рахунків"/><SummaryCard label="Очікує оплату" value="28 100 грн" note="3 рахунки" tone="orange"/><SummaryCard label="Прострочено" value="7 850 грн" note="2 рахунки" tone="red"/><SummaryCard label="Загальна заборгованість" value="35 950 грн" note="Очікує + Прострочено" tone="violet"/></div>
      <FilterStrip type="settlements" />
      <div className="ad-category-chips">{["Усі категорії","Де купити","Де поїсти","Де відпочити","Розваги","Трансфер","Халепа?"].map((x,i)=><button className={i===0?"is-active":""} key={x}>{x}</button>)}</div>
      <div className="ad-settlement-layout"><div><AdminTable columns={[{label:"Партнер",className:"1.6fr"},{label:"Локація",className:".8fr"},{label:"Категорія",className:".9fr"},{label:"Виставлено рахунків",className:".7fr"},{label:"Сума рахунків",className:".9fr"},{label:"Оплачено",className:".9fr"},{label:"Борг",className:".8fr"},{label:"Статус",className:"1fr"}]}>{rows.map(r=><TableRow key={r[1]} columns={["1.6fr",".8fr",".9fr",".7fr",".9fr",".9fr",".8fr","1fr"]}><div className="ad-entity-cell"><span>{r[0]}</span><strong>{r[1]}</strong></div><span>{r[2]}</span><span>{r[3]}</span><span>{r[4]}</span><strong>{r[5]}</strong><strong className="ad-green-number">{r[6]}</strong><strong className={r[7]!=="0 грн"?"ad-red-number":""}>{r[7]}</strong><Status tone={r[9] as "green"|"orange"|"red"}>{r[8]}</Status></TableRow>)}</AdminTable><Pagination label="Показано 1–6 з 6 партнерів"/><div className="ad-settlement-bottom"><div className="ad-debtors"><h3>⚠ Боржники</h3><div><span>Парк розваг “Драйв”</span><b>15 днів</b><strong>18 750 грн</strong></div><div><span>Таксі Карпати</span><b>5 днів</b><strong>3 200 грн</strong></div><button>Переглянути всіх боржників (2)</button></div><div className="ad-quick-actions"><h3>Швидкі дії</h3>{["Сформувати рахунки за період","Надіслати рахунки партнерам","Імпорт оплат з банку","Відмітити оплату готівкою"].map(t=><button key={t}>{t}</button>)}</div></div></div><aside className="ad-invoice-details"><div className="ad-section-title"><h2>Деталі рахунку</h2><button>×</button></div><div className="ad-invoice-partner"><span>🏠</span><div><strong>Колиба “Біля річки”</strong><small>Ресторан · Татарів</small></div></div>{[["Період","01.05.2024 – 31.05.2024"],["Номер рахунку","INV-2024-05-0007"],["Дата виставлення","01.06.2024"],["Сума до оплати","7 400 грн"],["Статус оплати","Оплачено"],["Дата оплати","02.06.2024"],["Спосіб оплати","Банківський переказ"]].map(([l,v])=><div className="ad-invoice-line" key={l}><span>{l}</span><strong>{v}</strong></div>)}<OutlineButton><FileText size={16}/> Переглянути рахунок</OutlineButton><h3>Історія рахунків</h3>{["01.05.2024 – 31.05.2024","01.04.2024 – 30.04.2024","01.03.2024 – 31.03.2024"].map((d,i)=><div className="ad-invoice-history" key={d}><span>{d}<small>INV-2024-0{i+3}-000{7-i}</small></span><strong>{["7 400 грн","6 800 грн","6 200 грн"][i]}<Status>Оплачено</Status></strong></div>)}</aside></div>
    </AdminShell>
  );
}

const statTabs = [
  ["Огляд","admin-statistics"], ["Партнери","admin-statistics-partners"], ["Клієнти","admin-statistics-clients"], ["Бонуси","admin-statistics-bonuses"], ["Розрахунки","admin-statistics-settlements"],
] as const;

function StatsTabs({ slug, navigate }: { slug: string; navigate: Navigate }) {
  return <div className="ad-stat-tabs">{statTabs.map(([label,s])=><button key={s} className={slug===s?"is-active":""} onClick={()=>navigate("admin",s)}>{label}</button>)}</div>;
}

function StatTop({ slug, navigate, title }: { slug: string; navigate: Navigate; title: string }) {
  return <><AdminPageHeader title={title} action={<div className="ad-page-actions"><DateRange/><PrimaryButton><Download size={17}/> Експорт <ChevronDown size={15}/></PrimaryButton></div>}/><StatsTabs slug={slug} navigate={navigate}/></>;
}

function LineChart({ variant = "green" }: { variant?: "green" | "mixed" }) {
  return <div className={`ad-line-chart ad-line-chart--${variant}`}><div className="ad-chart-grid"/><svg viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,150 40,110 80,140 120,90 160,75 200,120 240,95 280,65 320,82 360,42 400,68 440,38 480,92 520,35 560,55 600,20" fill="none" stroke="currentColor" strokeWidth="4"/><polyline className="secondary" points="0,160 40,150 80,145 120,130 160,136 200,125 240,118 280,120 320,100 360,106 400,95 440,80 480,88 520,70 560,62 600,50" fill="none" stroke="currentColor" strokeWidth="3"/></svg><div className="ad-chart-labels"><span>01.05</span><span>06.05</span><span>11.05</span><span>16.05</span><span>21.05</span><span>26.05</span><span>31.05</span></div></div>;
}

function Donut({ center, colors = "green" }: { center: string; colors?: string }) {
  return <div className={`ad-donut ad-donut--${colors}`}><span>{center}<small>Всього</small></span></div>;
}

function StatisticsOverview({ navigate }: AdminProps) {
  return <AdminShell active="statistics" navigate={navigate} contentClassName="ad-main--statistics"><StatTop slug="admin-statistics" navigate={navigate} title="Статистика"/><div className="ad-summary-grid ad-summary-grid--four"><SummaryCard label="Загальний оборот" value="1 245 820 грн" note="+12.5% порівняно з 01.04.2024 – 30.04.2024"/><SummaryCard label="Кількість клієнтів" value="8 732" note="+8.2% порівняно з попереднім періодом" tone="violet"/><SummaryCard label="Нараховано бонусів" value="124 582 грн" note="+9.7% порівняно з попереднім періодом" tone="orange"/><SummaryCard label="Кількість партнерів" value="186" note="+6 нових партнерів" tone="blue"/></div><FilterStrip type="stats"/><div className="ad-stats-dashboard"><section className="ad-chart-card ad-chart-card--wide"><div className="ad-section-title"><h2>Оборот за період</h2><SelectBox value="По днях"/></div><LineChart variant="mixed"/></section><section className="ad-chart-card ad-category-turnover-card"><h2>Оборот за категоріями</h2><div className="ad-donut-layout"><Donut center="1 245 820 грн" colors="multi"/><ul>{["Де купити 32%","Де поїсти 24%","Де відпочити 18%","Розваги 12%","Трансфер 9%","Халепа? 5%"].map(x=><li key={x}>{x}</li>)}</ul></div></section><section className="ad-chart-card"><h2>Розподіл по локаціях</h2>{["Яремче 28%","Татарів 24%","Микуличин 18%","Ворохта 16%","Поляниця 9%","Інше 5%"].map((x,i)=><div className="ad-progress-line" key={x}><span>{x}</span><i><b style={{width:`${92-i*12}%`}}/></i></div>)}</section><section className="ad-chart-card"><h2>Топ партнерів за оборотом</h2><div className="ad-simple-table">{["Колиба “Біля річки”","Готель “Карпатські зорі”","Магазин “Гірські товари”","Парк розваг “Драйв”","Таксі Карпати"].map((x,i)=><div key={x}><span>{i+1}</span><strong>{x}</strong><span>{["98 450 грн","82 600 грн","75 320 грн","62 180 грн","55 310 грн"][i]}</span></div>)}</div></section><section className="ad-chart-card ad-client-activity-card"><h2>Активність клієнтів</h2><div className="ad-summary-grid ad-summary-grid--four"><SummaryCard label="Нові клієнти" value="1 245"/><SummaryCard label="Активні клієнти" value="5 672"/><SummaryCard label="Повернулися" value="2 815"/><SummaryCard label="Здійснено покупок" value="18 732"/></div><div className="ad-simple-table">{["QR код","Партнер","Рекомендації","Соціальні мережі","Інше"].map((x,i)=><div key={x}><strong>{x}</strong><span>{["3 245","2 876","1 254","856","501"][i]}</span><span>{["468 250 грн","389 420 грн","182 310 грн","128 450 грн","77 390 грн"][i]}</span></div>)}</div></section><section className="ad-chart-card"><h2>Фінансова картина</h2>{[["Виставлено рахунків","128 450 грн"],["Оплачено","92 350 грн"],["Очікує оплату","28 100 грн"],["Прострочено","7 850 грн"],["Загальна заборгованість","35 950 грн"]].map(([l,v])=><div className="ad-key-value" key={l}><span>{l}</span><strong>{v}</strong></div>)}<h2>Бонусна програма</h2>{[["Нараховано бонусів","124 582 грн"],["Використано бонусів","68 420 грн"],["Кількість операцій","2 856"],["Середній чек з бонусами","132 грн"]].map(([l,v])=><div className="ad-key-value" key={l}><span>{l}</span><strong>{v}</strong></div>)}</section></div></AdminShell>;
}

function StatsMetricGrid({ kind }: { kind: "partners" | "clients" | "bonuses" | "settlements" }) {
  const data = kind === "partners" ? [["Усього партнерів","186"],["Активні партнери","148"],["Нові партнери","12"],["Неактивні партнери","38"]] : kind === "clients" ? [["Усього клієнтів","8 732"],["Нові клієнти","1 245"],["Активні клієнти","5 672"],["Повернулися клієнти","2 815"]] : kind === "bonuses" ? [["Нараховано бонусів","124 582 грн"],["Використано бонусів","68 420 грн"],["Кількість операцій з бонусами","2 856"],["Середній чек з бонусами","132 грн"]] : [["Виставлено рахунків","128 450 грн"],["Оплачено","92 350 грн"],["Очікує оплату","28 100 грн"],["Прострочено","7 850 грн"],["Заборгованість","35 950 грн"]];
  return <div className={`ad-summary-grid ${kind==="settlements"?"ad-summary-grid--five":"ad-summary-grid--four"}`}>{data.map(([l,v],i)=><SummaryCard key={l} label={l} value={v} note={i===0?"+8.2% порівняно з попер. періодом":"+6.1%"} tone={i===2?"orange":i===3?"red":"green"}/>)}</div>;
}

function StatisticsSubscreen({ navigate, kind }: AdminProps & { kind: "partners" | "clients" | "bonuses" | "settlements" }) {
  const slug = `admin-statistics-${kind}`;
  const titleMap = { partners: "Статистика — Партнери", clients: "Статистика — Клієнти", bonuses: "Статистика — Бонуси", settlements: "Статистика — Розрахунки" };
  const donutCenter = kind === "partners" ? "186" : kind === "clients" ? "8 732" : kind === "bonuses" ? "124 582 грн" : "128 450 грн";
  return <AdminShell active="statistics" navigate={navigate} contentClassName="ad-main--statistics"><StatTop slug={slug} navigate={navigate} title={titleMap[kind]}/><StatsMetricGrid kind={kind}/><FilterStrip type="stats"/><div className="ad-stats-subgrid"><section className="ad-chart-card ad-chart-card--wide"><h2>{kind==="clients"?"Динаміка клієнтів":kind==="partners"?"Динаміка кількості партнерів":kind==="bonuses"?"Динаміка бонусів, грн":"Динаміка розрахунків, грн"}</h2><LineChart variant="mixed"/></section><section className="ad-chart-card"><h2>{kind==="clients"?"Клієнти за локаціями":kind==="partners"?"Партнери за категоріями":kind==="bonuses"?"Бонуси за категоріями (нараховано)":"Статус рахунків"}</h2><div className="ad-donut-layout"><Donut center={donutCenter} colors="multi"/><ul>{["Де купити 32%","Де поїсти 24%","Де відпочити 18%","Розваги 12%","Трансфер 9%","Інше 5%"].map(x=><li key={x}>{x}</li>)}</ul></div></section><section className="ad-chart-card"><h2>{kind==="clients"?"Клієнти за статтю":kind==="partners"?"Топ партнерів за оборотом":kind==="bonuses"?"Топ партнерів за нарахованими бонусами":"Заборгованість по локаціях"}</h2>{["Колиба “Біля річки”","Готель “Карпатські зорі”","Магазин “Гірські товари”","Парк розваг “Драйв”","Таксі Карпати"].map((x,i)=><div className="ad-progress-line" key={x}><span>{x}</span><i><b style={{width:`${92-i*13}%`}}/></i></div>)}</section><section className="ad-chart-card"><h2>{kind==="clients"?"Топ клієнтів":kind==="partners"?"Активність партнерів":kind==="bonuses"?"Топ клієнтів за використаними бонусами":"Рахунки"}</h2><div className="ad-simple-table">{["Олександр К.","Марія І.","Іван П.","Наталія Т.","Андрій С."].map((x,i)=><div key={x}><span>{i+1}</span><strong>{x}</strong><span>{["28","24","21","19","18"][i]}</span></div>)}</div></section></div></AdminShell>;
}

type SettingsSlug =
  | "admin-settings"
  | "admin-settings-general"
  | "admin-settings-company"
  | "admin-settings-partners"
  | "admin-settings-bonuses"
  | "admin-settings-notifications"
  | "admin-settings-security"
  | "admin-settings-integrations"
  | "admin-settings-audit";

const settingsTabs: Array<{ label: string; slug: SettingsSlug }> = [
  { label: "Загальні", slug: "admin-settings-general" },
  { label: "Компанія", slug: "admin-settings-company" },
  { label: "Партнери та комісії", slug: "admin-settings-partners" },
  { label: "Бонусна система", slug: "admin-settings-bonuses" },
  { label: "Сповіщення", slug: "admin-settings-notifications" },
  { label: "Безпека", slug: "admin-settings-security" },
  { label: "Інтеграції", slug: "admin-settings-integrations" },
  { label: "Журнал дій", slug: "admin-settings-audit" },
];

function SettingsTabs({ active, navigate }: { active: SettingsSlug; navigate: Navigate }) {
  const normalized = active === "admin-settings" ? "admin-settings-general" : active;
  return (
    <nav className="ad-settings-tabs">
      {settingsTabs.map((tab) => (
        <button
          type="button"
          key={tab.slug}
          className={normalized === tab.slug ? "is-active" : ""}
          onClick={() => navigate("admin", tab.slug)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function SettingsTop({ title, active, navigate }: { title: string; active: SettingsSlug; navigate: Navigate }) {
  return (
    <>
      <AdminPageHeader
        title={`Налаштування — ${title}`}
        action={<div className="ad-page-actions"><DateRange /><PrimaryButton><Download size={17}/> Експорт <ChevronDown size={15}/></PrimaryButton></div>}
      />
      <SettingsTabs active={active} navigate={navigate} />
    </>
  );
}

function SettingToggle({ label, on = true, note }: { label: string; on?: boolean; note?: string }) {
  return (
    <div className="ad-setting-toggle-row">
      <div><strong>{label}</strong>{note ? <small>{note}</small> : null}</div>
      <button type="button" className={`ad-toggle ${on ? "is-on" : ""}`} aria-label={label}><i /></button>
    </div>
  );
}

function SettingField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <label className={`ad-setting-field ${wide ? "is-wide" : ""}`}>
      <span>{label}</span>
      <div>{value}<ChevronDown size={15}/></div>
    </label>
  );
}

function SettingsPanel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return <section className={`ad-settings-panel ${className}`.trim()}><h2>{title}</h2>{children}</section>;
}

function GeneralSettingsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings">
      <SettingsTop title="Загальні" active="admin-settings-general" navigate={navigate} />
      <div className="ad-settings-layout ad-settings-layout--two">
        <SettingsPanel title="Загальні налаштування">
          <div className="ad-setting-fields-grid">
            <SettingField label="Мова інтерфейсу" value="Українська" />
            <SettingField label="Часовий пояс" value="(UTC+03:00) Київ" />
            <SettingField label="Формат дати" value="DD.MM.YYYY" />
            <SettingField label="Валюта" value="UAH (₴) – Гривня" />
          </div>
          <div className="ad-settings-toggle-stack">
            <SettingToggle label="Показувати архівних партнерів" />
            <SettingToggle label="Показувати неактивних клієнтів" />
            <SettingToggle label="Автоматичне оновлення даних" />
          </div>
        </SettingsPanel>
        <SettingsPanel title="Логотип та брендування">
          <div className="ad-branding-box">
            <div className="ad-brand-logo"><AdminLogo /></div>
            <div className="ad-brand-actions"><OutlineButton><Upload size={16}/> Змінити логотип</OutlineButton><button type="button" className="ad-danger-outline"><Trash2 size={15}/> Видалити</button></div>
          </div>
          <div className="ad-color-row"><span>Основний колір</span><b className="is-green"/> <strong>#16A34A</strong></div>
          <div className="ad-color-row"><span>Додатковий колір</span><b className="is-dark"/> <strong>#1F2937</strong></div>
        </SettingsPanel>
        <SettingsPanel title="Локації">
          <p className="ad-settings-help">Керуйте локаціями, у яких працюють ваші партнери.</p>
          <div className="ad-settings-table">
            <div className="ad-settings-table__head"><span>Локація</span><span>Кількість партнерів</span><span>Дії</span></div>
            {[['Яремче','42'],['Микуличин','28'],['Татарів','35'],['Ворохта','37'],['Поляниця','31'],['Інше','13']].map(([name,count])=><div key={name}><span>⋮⋮ &nbsp; {name}</span><span>{count}</span><span className="ad-mini-actions"><button><Edit3 size={14}/></button><button className="is-danger"><Trash2 size={14}/></button></span></div>)}
          </div>
          <OutlineButton><Plus size={16}/> Додати локацію</OutlineButton>
        </SettingsPanel>
        <SettingsPanel title="Інші налаштування">
          <SettingToggle label="Дозволити реєстрацію нових партнерів" />
          <SettingToggle label="Потрібне підтвердження партнера адміністратором" />
          <SettingToggle label="Дозволити партнерам редагувати свої дані" />
          <SettingToggle label="Відображати рейтинг партнера" />
          <SettingToggle label="Показувати підказки в інтерфейсі" />
          <SettingToggle label="Режим технічного обслуговування" on={false} />
        </SettingsPanel>
        <SettingsPanel title="Зберігання даних" className="ad-settings-panel--storage">
          <div className="ad-setting-fields-grid"><SettingField label="Термін зберігання логів" value="12 місяців"/><SettingField label="Термін зберігання архівних даних" value="24 місяці"/></div>
          <div className="ad-info-banner"><Info size={17}/> Після завершення терміну дані будуть автоматично архівовані або видалені.</div>
        </SettingsPanel>
        <SettingsPanel title="Дії">
          <div className="ad-settings-actions"><OutlineButton><Download size={16}/> Експорт налаштувань</OutlineButton><button type="button" className="ad-danger-outline"><RefreshCcw size={16}/> Скинути налаштування</button></div>
          <div className="ad-warning-banner">Скидання налаштувань поверне всі параметри до значень за замовчуванням.</div>
        </SettingsPanel>
      </div>
    </AdminShell>
  );
}

function CompanySettingsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings">
      <SettingsTop title="Компанія" active="admin-settings-company" navigate={navigate} />
      <div className="ad-settings-layout ad-settings-layout--two">
        <SettingsPanel title="Інформація про компанію">
          <div className="ad-setting-fields-grid">
            <SettingField label="Назва компанії" value="Gid Tourist"/><SettingField label="Email" value="info@gidtourist.ua"/>
            <SettingField label="Юридична назва" value="ФОП Іваненко Іван Іванович"/><SettingField label="Телефон" value="+38 (097) 123-45-67"/>
            <SettingField label="ЄДРПОУ / ІПН" value="1234567890"/><SettingField label="Вебсайт" value="https://gidtourist.ua"/>
            <SettingField label="Країна" value="Україна"/><SettingField label="Адреса" value="м. Яремче, вул. Свободи, 123"/>
          </div>
        </SettingsPanel>
        <SettingsPanel title="Банківські реквізити">
          <div className="ad-kv-list">{[['IBAN','UA12 3456 7890 1234 5678 9012 3456 789'],['Банк','АТ КБ “ПриватБанк”'],['ЄДРПОУ банку','14360570']].map(([l,v])=><div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div>
          <h3>Додаткові реквізити</h3><div className="ad-kv-list">{[['Платник ПДВ','Так'],['Ставка ПДВ','20%'],['Тип діяльності','Надання туристичних послуг'],['Примітка','Доступна за співпраці']].map(([l,v])=><div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div>
        </SettingsPanel>
        <SettingsPanel title="Додаткова інформація"><div className="ad-setting-fields-grid"><SettingField label="Часовий пояс" value="(UTC+03:00) Київ"/><SettingField label="Формат дати" value="DD.MM.YYYY"/><SettingField label="Валюта" value="UAH (₴) – Гривня"/><SettingField label="Формат часу" value="24 години (HH:mm)"/><SettingField label="Мова інтерфейсу" value="Українська"/><SettingField label="Початок робочого тижня" value="Понеділок"/></div></SettingsPanel>
        <SettingsPanel title="Документи компанії">
          <div className="ad-doc-list">{[['Свідоцтво про реєстрацію ФОП','svidotstvo_fop.pdf'],['Виписка з ЄДР','vypyska_edr.pdf'],['Платник ПДВ','pdv.pdf'],['Статут / Положення','statut.pdf']].map(([doc,file])=><div key={doc}><FileText size={16}/><span><strong>{doc}</strong><small>{file}</small></span><small>12.01.2024</small><button><Download size={14}/></button><button className="is-danger"><Trash2 size={14}/></button></div>)}</div>
          <OutlineButton><Plus size={16}/> Додати документ</OutlineButton>
        </SettingsPanel>
        <SettingsPanel title="Логотип та брендування"><div className="ad-branding-box"><div className="ad-brand-logo"><AdminLogo /></div><div className="ad-brand-actions"><OutlineButton><Upload size={16}/> Змінити логотип</OutlineButton><button className="ad-danger-outline"><Trash2 size={15}/> Видалити</button></div></div><div className="ad-color-row"><span>Основний колір</span><b className="is-green"/><strong>#16A34A</strong></div><div className="ad-color-row"><span>Додатковий колір</span><b className="is-dark"/><strong>#1F2937</strong></div></SettingsPanel>
        <SettingsPanel title="Налаштування брендування"><SettingToggle label="Відображати логотип у рахунках та чеках"/><SettingToggle label="Використовувати фірмові кольори в інтерфейсі"/><div className="ad-info-banner"><Info size={17}/> Зміни брендування застосовуються до всіх документів та сторінок адміністративної панелі.</div></SettingsPanel>
      </div>
    </AdminShell>
  );
}

function PartnerCommissionSettingsScreen({ navigate }: AdminProps) {
  const statuses = [['Активний','Партнер активний та співпрацює','42','green'],['На перевірці','Заявка партнера на розгляді','5','orange'],['Призупинений','Співпраця тимчасово призупинена','3','blue'],['Неактивний','Партнер неактивний','7','gray'],['Заблокований','Доступ партнера заблоковано','2','red']] as const;
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings">
      <SettingsTop title="Партнери та комісії" active="admin-settings-partners" navigate={navigate}/>
      <div className="ad-settings-layout ad-settings-layout--two">
        <SettingsPanel title="Умови комісії (за замовчуванням)" className="ad-settings-panel--commission-default"><div className="ad-setting-fields-grid"><SettingField label="Тип комісії" value="Відсоток від суми замовлення"/><SettingField label="Розмір комісії" value="10 %"/></div><div className="ad-info-banner"><Info size={17}/> Індивідуальні умови комісії для партнерів можна налаштувати на сторінці партнера.</div></SettingsPanel>
        <SettingsPanel title="Додаткові налаштування"><SettingToggle label="Потрібне підтвердження партнера адміністратором"/><SettingToggle label="Автоматично призначати стандартну комісію"/><SettingToggle label="Дозволяти партнерам бачити свою комісію"/><SettingToggle label="Показувати партнерам борг у кабінеті"/></SettingsPanel>
        <SettingsPanel title="Статуси партнерів"><div className="ad-status-settings-list">{statuses.map(([name,desc,count,tone])=><div key={name}><span className={`ad-status-dot is-${tone}`}/><strong>{name}</strong><small>{desc}</small><b>{count}</b><button><Edit3 size={14}/></button></div>)}</div><OutlineButton><Plus size={15}/> Додати статус</OutlineButton></SettingsPanel>
        <SettingsPanel title="Типи партнерів"><div className="ad-settings-table ad-settings-table--partner-types"><div className="ad-settings-table__head"><span>Тип</span><span>Опис</span><span>Комісія</span><span>Дія</span></div>{[['Готелі','Проживання','10%'],['Ресторани','Харчування','8%'],['Екскурсії','Тури та екскурсії','12%'],['Транспорт','Трансфери, таксі','7%'],['Інші','Інші послуги','10%']].map(r=><div key={r[0]}><strong>{r[0]}</strong><span>{r[1]}</span><strong>{r[2]}</strong><span className="ad-mini-actions"><button><Edit3 size={14}/></button><button className="is-danger"><Trash2 size={14}/></button></span></div>)}</div><OutlineButton><Plus size={15}/> Додати тип</OutlineButton></SettingsPanel>
      </div>
      <SettingsPanel title="Додаткові умови комісії" className="ad-settings-panel--full"><div className="ad-commission-cards"><div><span>Мінімальна сума замовлення</span><strong>1 000 <small>грн</small></strong><p>Комісія нараховується тільки при перевищенні суми</p></div><div><span>Термін дії комісії</span><strong>365 <small>днів</small></strong><p>Комісія дійсна протягом зазначеного періоду</p></div><div><SettingToggle label="Бонус за активність"/><strong>2 <small>%</small></strong><p>Додатковий відсоток до комісії за активність</p></div><div><SettingToggle label="Комісія за передоплату"/><strong>1 <small>%</small></strong><p>Додатковий відсоток за оплату наперед</p></div></div></SettingsPanel>
    </AdminShell>
  );
}

function BonusSettingsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings">
      <SettingsTop title="Бонусна система" active="admin-settings-bonuses" navigate={navigate}/>
      <SettingsPanel title="Основні налаштування бонусної системи" className="ad-settings-panel--full">
        <div className="ad-setting-fields-grid ad-setting-fields-grid--three"><SettingField label="Тип нарахування бонусів" value="Відсоток від суми"/><SettingField label="Розмір бонусу" value="5 %"/><SettingField label="Валюта бонусів" value="Гривня (UAH)"/><SettingField label="Мінімальна сума нарахування" value="100 грн"/><SettingField label="Мінімальна сума списання" value="100 грн"/><SettingField label="Термін дії бонусів" value="365 днів"/></div>
        <div className="ad-settings-toggle-stack"><SettingToggle label="Нараховувати бонуси за акційні товари"/><SettingToggle label="Списання бонусів частинами"/><SettingToggle label="Заборонити списання бонусів при оплаті алкоголю та тютюну"/></div>
      </SettingsPanel>
      <SettingsPanel title="Рівні бонусної системи" className="ad-settings-panel--full"><div className="ad-settings-table ad-settings-table--bonus"><div className="ad-settings-table__head"><span>Рівень</span><span>Назва</span><span>Умова (сума покупок)</span><span>Бонус</span><span>Статус</span><span>Дії</span></div>{[['1','Бронзовий','від 0 грн','5%'],['2','Срібний','від 10 000 грн','7%'],['3','Золотий','від 25 000 грн','10%'],['4','Платиновий','від 50 000 грн','12%']].map(r=><div key={r[0]}><span>{r[0]}</span><strong>{r[1]}</strong><span>{r[2]}</span><strong>{r[3]}</strong><Status>Активний</Status><span className="ad-mini-actions"><button><Edit3 size={14}/></button><button className="is-danger"><Trash2 size={14}/></button></span></div>)}</div><OutlineButton><Plus size={15}/> Додати рівень</OutlineButton></SettingsPanel>
    </AdminShell>
  );
}

function NotificationSettingsScreen({ navigate }: AdminProps) {
  const rows = [
    ['Реєстрація нового партнера',[true,false,true,true]],['Підтвердження партнера',[true,false,true,true]],['Нове замовлення',[true,true,true,true]],['Комісія нарахована',[true,false,true,true]],['Виплата комісії',[true,true,true,true]],['Низький баланс партнера',[true,true,true,false]],['Системні повідомлення',[true,false,false,true]],
  ] as const;
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings">
      <SettingsTop title="Сповіщення" active="admin-settings-notifications" navigate={navigate}/>
      <div className="ad-settings-layout ad-settings-layout--notifications">
        <SettingsPanel title="Канали сповіщень"><p className="ad-settings-help">Виберіть канали, через які ви хочете отримувати сповіщення</p><div className="ad-channel-list"><div><Mail size={21}/><span><strong>Email</strong><small>info@gidtourist.ua</small></span><button className="ad-toggle is-on"><i/></button></div><div><Smartphone size={21}/><span><strong>SMS</strong><small>+38 (097) 123-45-67</small></span><button className="ad-toggle is-on"><i/></button></div><div><span className="ad-telegram-icon">➤</span><span><strong>Telegram</strong><small>@gid_tourist_bot</small></span><button className="ad-toggle is-on"><i/></button></div><div><Bell size={21}/><span><strong>Push-повідомлення</strong><small>Увімкнено в браузері</small></span><button className="ad-toggle is-on"><i/></button></div></div></SettingsPanel>
        <SettingsPanel title="Типи сповіщень"><div className="ad-notification-matrix"><div className="ad-notification-matrix__head"><span>Тип сповіщення</span><span>Email</span><span>SMS</span><span>Telegram</span><span>Push</span></div>{rows.map(([name,values])=><div key={name}><strong>{name}</strong>{values.map((v,i)=><span key={i} className={`ad-checkbox ${v?'is-checked':''}`}>{v?'✓':''}</span>)}</div>)}</div></SettingsPanel>
        <SettingsPanel title="Додаткові налаштування"><div className="ad-notification-extra"><SettingToggle label="Отримувати зведення за день"/><SelectBox value="18:00"/><SettingToggle label="Отримувати зведення за тиждень" on={false}/><SelectBox value="Понеділок"/><SettingToggle label="Не надсилати сповіщення вночі"/><div className="ad-time-range"><span>22:00</span><b>–</b><span>08:00</span></div></div></SettingsPanel>
        <SettingsPanel title="Тестове сповіщення"><p className="ad-settings-help">Надіслати тестове сповіщення на всі активні канали</p><PrimaryButton>Надіслати тест</PrimaryButton></SettingsPanel>
      </div>
    </AdminShell>
  );
}

function SecuritySettingsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings">
      <SettingsTop title="Безпека" active="admin-settings-security" navigate={navigate}/>
      <div className="ad-settings-layout ad-settings-layout--two">
        <SettingsPanel title="Вхід та пароль"><SettingToggle label="Двофакторна автентифікація для адміністраторів"/><SettingToggle label="Вимагати складний пароль"/><SettingToggle label="Блокувати вхід після 5 невдалих спроб"/><div className="ad-setting-fields-grid"><SettingField label="Термін дії пароля" value="90 днів"/><SettingField label="Тривалість сесії" value="12 годин"/></div></SettingsPanel>
        <SettingsPanel title="Доступ адміністраторів"><div className="ad-security-users">{[['А','Адміністратор','admin@gidtourist.ua','Повний доступ'],['МІ','Марія Іванова','maria@gidtourist.ua','Фінанси, партнери'],['СП','Сергій Петренко','serhii@gidtourist.ua','Партнери, статистика']].map(r=><div key={r[2]}><span>{r[0]}</span><div><strong>{r[1]}</strong><small>{r[2]}</small></div><Status>{r[3]}</Status><button><Edit3 size={14}/></button></div>)}</div><OutlineButton><Plus size={15}/> Додати адміністратора</OutlineButton></SettingsPanel>
        <SettingsPanel title="Обмеження доступу"><SettingToggle label="Дозволити вхід тільки з перевірених IP" on={false}/><SettingToggle label="Вести журнал усіх входів"/><SettingToggle label="Сповіщати про вхід з нового пристрою"/><SettingToggle label="Автоматично завершувати неактивні сесії"/></SettingsPanel>
        <SettingsPanel title="Активні сесії"><div className="ad-kv-list">{[['Chrome / Windows','Київ · 192.168.1.1 · Зараз'],['Telegram WebApp / iOS','Яремче · 192.168.1.15 · 2 год тому'],['Safari / macOS','Львів · 192.168.1.21 · Вчора']].map(([device,meta])=><div key={device}><span>{device}<small>{meta}</small></span><button className="ad-danger-outline">Завершити</button></div>)}</div></SettingsPanel>
      </div>
    </AdminShell>
  );
}

function IntegrationBrand({ type }: { type: "1c" | "vchasno" | "mailchimp" | "telegram" | "analytics" }) {
  if (type === "1c") return <span className="ad-integration-brand is-1c"><b>1C</b></span>;
  if (type === "vchasno") return <span className="ad-integration-brand is-vchasno"><i/><i/></span>;
  if (type === "mailchimp") return <span className="ad-integration-brand is-mailchimp"><b>M</b></span>;
  if (type === "telegram") return <span className="ad-integration-brand is-telegram"><Send size={16}/></span>;
  return <span className="ad-integration-brand is-analytics"><i/><i/><i/></span>;
}

function IntegrationsSettingsScreen({ navigate }: AdminProps) {
  const items = [
    ['1C:Підприємство','Обмін даними з 1С','Підключено','31.05.2024 12:45','1c'],
    ['Вчасно.Каса','Фіскалізація чеків','Підключено','31.05.2024 12:40','vchasno'],
    ['Mailchimp','Email-розсилки','Підключено','31.05.2024 11:20','mailchimp'],
    ['Telegram Bot','Telegram-бот для сповіщень','Підключено','31.05.2024 10:15','telegram'],
    ['Google Analytics','Аналітика та статистика','Не підключено','—','analytics'],
  ] as const;
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings ad-main--integrations">
      <SettingsTop title="Інтеграції" active="admin-settings-integrations" navigate={navigate}/>
      <SettingsPanel title="Інтеграції" className="ad-settings-panel--full ad-integrations-reference-panel">
        <div className="ad-integrations-table ad-integrations-table--reference">
          <div className="ad-integrations-table__head"><span>Сервіс</span><span>Опис</span><span>Статус</span><span>Остання синхронізація</span><span>Дії</span></div>
          {items.map(([service,desc,status,last,type])=><div key={service}>
            <span className="ad-integration-service"><IntegrationBrand type={type}/><strong>{service}</strong></span>
            <span>{desc}</span>
            <Status tone={status==='Підключено'?'green':'gray'}>{status}</Status>
            <span>{last}</span>
            <span className="ad-mini-actions"><button><Settings size={16}/></button>{status==='Підключено'?<button className="is-danger"><Trash2 size={16}/></button>:null}</span>
          </div>)}
        </div>
        <OutlineButton><Plus size={16}/> Додати інтеграцію</OutlineButton>
      </SettingsPanel>
      <div className="ad-settings-layout ad-settings-layout--two ad-integration-bottom-panels">
        <SettingsPanel title="API ключі"><label className="ad-api-key"><span>Ваш API ключ</span><div>•••••••••••••••••••• <Eye size={17}/></div></label><OutlineButton><RefreshCcw size={16}/> Згенерувати новий</OutlineButton></SettingsPanel>
        <SettingsPanel title="Документація API"><p className="ad-settings-help">Інтегруйте з системою через API</p><OutlineButton>Перейти до документації</OutlineButton></SettingsPanel>
      </div>
    </AdminShell>
  );
}

function AuditSettingsScreen({ navigate }: AdminProps) {
  const rows = [
    ['31.05.2024 12:45:32','Адміністратор','Підтверджено партнера “Рибак. М’ясна історія”','Партнери','192.168.1.1'],
    ['31.05.2024 12:40:18','Марія Іванова','Нараховано комісію партнеру “Верне Тур” (1 250 грн)','Взаєморозрахунки','192.168.1.15'],
    ['31.05.2024 12:35:05','Сергій Петренко','Створено нового партнера “Карпати Екскурс”','Партнери','192.168.1.18'],
    ['31.05.2024 11:22:47','Адміністратор','Змінено налаштування комісії для типу “Екскурсії”','Налаштування','192.168.1.1'],
    ['31.05.2024 10:15:33','Марія Іванова','Експорт звіту по взаєморозрахунках','Взаєморозрахунки','192.168.1.15'],
    ['31.05.2024 09:40:11','Сергій Петренко','Вхід у систему','Система','192.168.1.18'],
    ['31.05.2024 09:12:09','Марія Іванова','Оновлено дані партнера “Говерла Тур”','Партнери','192.168.1.15'],
    ['31.05.2024 08:55:23','Адміністратор','Налаштовано інтеграцію 1С','Інтеграції','192.168.1.1'],
  ];
  return (
    <AdminShell active="settings" navigate={navigate} contentClassName="ad-main--settings">
      <SettingsTop title="Журнал дій" active="admin-settings-audit" navigate={navigate}/>
      <SettingsPanel title="Журнал дій" className="ad-settings-panel--full">
        <div className="ad-audit-filters"><SettingField label="Період" value="01.05.2024 – 31.05.2024"/><SettingField label="Користувач" value="Всі користувачі"/><SettingField label="Дія" value="Всі дії"/><SettingField label="Сервіс" value="Всі сервіси"/><OutlineButton><Filter size={16}/> Фільтри</OutlineButton></div>
        <div className="ad-audit-table"><div className="ad-audit-table__head"><span>Дата і час</span><span>Користувач</span><span>Дія</span><span>Сервіс / Розділ</span><span>IP-адреса</span></div>{rows.map(r=><div key={r[0]}>{r.map((v,i)=><span key={i}>{v}</span>)}</div>)}</div>
        <div className="ad-audit-footer"><span>Показано 1–8 з 256 записів</span><div className="ad-pagination-mini"><button>‹</button><button className="is-active">1</button><button>2</button><button>3</button><span>…</span><button>32</button><button>›</button></div></div>
      </SettingsPanel>
    </AdminShell>
  );
}


type QrConstructor = new (element: HTMLElement, options: { text: string; width: number; height: number; correctLevel?: number }) => unknown;

declare global {
  interface Window { QRCode?: QrConstructor & { CorrectLevel?: { M?: number } }; __gidQrCodePromise?: Promise<QrConstructor>; }
}

function Stage2QrPreview({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!value || !ref.current) return;
    let cancelled = false;
    const load = () => {
      if (window.QRCode) return Promise.resolve(window.QRCode);
      if (window.__gidQrCodePromise) return window.__gidQrCodePromise;
      window.__gidQrCodePromise = new Promise<QrConstructor>((resolve, reject) => {
        const existing = document.querySelector('script[data-gid-qrcode="1"]') as HTMLScriptElement | null;
        const script = existing ?? document.createElement("script");
        if (!existing) {
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
          script.async = true;
          script.dataset.gidQrcode = "1";
          document.head.appendChild(script);
        }
        const done = () => window.QRCode ? resolve(window.QRCode) : reject(new Error("QRCode did not initialize"));
        if (window.QRCode) done();
        else {
          script.addEventListener("load", done, { once: true });
          script.addEventListener("error", () => reject(new Error("Failed to load QR generator")), { once: true });
        }
      });
      return window.__gidQrCodePromise;
    };
    ref.current.innerHTML = "";
    void load().then((QRCode) => {
      if (cancelled || !ref.current) return;
      ref.current.innerHTML = "";
      new QRCode(ref.current, { text: value, width: 180, height: 180, correctLevel: window.QRCode?.CorrectLevel?.M });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [value]);
  return <div className="ad-stage2-qr-preview__code" ref={ref} aria-label="QR-код точки входу" />;
}

function Stage2ContentScreen({ navigate }: AdminProps) {
  const [adminKey, setAdminKey] = useState("");
  const [pending, setPending] = useState<Array<{ id: string; name: string; category_slug: string; subcategory?: string | null; address: string; status: string; organization_name?: string; region_name?: string; moderation_comment?: string | null }>>([]);
  const [moderationCategories, setModerationCategories] = useState<Record<string, string>>({});
  const [qrRows, setQrRows] = useState<Array<{ id: string; start_param: string; type: string; source: string; active: boolean; region_name: string; place_name?: string | null; place_id?: string | null }>>([]);
  const [approvedPlaces, setApprovedPlaces] = useState<Array<{ id: string; name: string; category_slug: string; region_name: string }>>([]);
  const [stage2Categories, setStage2Categories] = useState<Stage2Category[]>([]);
  const [placeTemplates, setPlaceTemplates] = useState<Stage2PlaceTypeTemplate[]>([]);
  const [templateCategory, setTemplateCategory] = useState("hotel");
  const [templateType, setTemplateType] = useState("Готель");
  const [templateTitle, setTemplateTitle] = useState("Новий готель");
  const [templateDescription, setTemplateDescription] = useState("Комфортний готель для відпочинку гостей.");
  const [templateAmenities, setTemplateAmenities] = useState("Номери, Паркінг, Wi‑Fi, Сніданок");
  const [templateServices, setTemplateServices] = useState("Сніданок, Прибирання, Сауна, Басейн, Трансфер");
  const [templateFields, setTemplateFields] = useState("room_count=Кількість номерів; opened_year=Рік відкриття");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [qrPlaceId, setQrPlaceId] = useState("place-girskyi-zatyshok");
  const [qrParam, setQrParam] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySubcategories, setCategorySubcategories] = useState("");
  const [emergencyTitle, setEmergencyTitle] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");
  const [qrPreviewParam, setQrPreviewParam] = useState("");

  useEffect(() => {
    const stored = window.sessionStorage.getItem("gid-tourist-admin-stage2-key") || "";
    setAdminKey(stored);
    void load(stored);
  }, []);

  const load = async (key = adminKey) => {
    setLoading(true); setMessage("");
    try {
      const [moderation, qr, approved, categories, templates] = await Promise.all([
        adminStage2Fetch<typeof pending>("/admin/stage2/moderation", key),
        adminStage2Fetch<typeof qrRows>("/admin/stage2/qr", key),
        adminStage2Fetch<typeof approvedPlaces>("/admin/stage2/places?status=approved", key),
        adminStage2Fetch<Stage2Category[]>("/categories", key),
        adminStage2Fetch<Stage2PlaceTypeTemplate[]>("/place-type-templates", key),
      ]);
      setPending(moderation);
      setModerationCategories((current) => Object.fromEntries(moderation.map((row) => [row.id, current[row.id] || row.category_slug])));
      setQrRows(qr); setApprovedPlaces(approved); setStage2Categories(categories); setPlaceTemplates(templates);
      if (!qrPlaceId && approved[0]?.id) setQrPlaceId(approved[0].id);
      if (!qrPreviewParam && qr[0]?.start_param) setQrPreviewParam(qr[0].start_param);
      if (key) window.sessionStorage.setItem("gid-tourist-admin-stage2-key", key);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Помилка доступу до Stage 2 API");
    } finally { setLoading(false); }
  };

  const moderate = async (id: string, status: "approved" | "rejected") => {
    const comment = status === "rejected" ? (window.prompt("Причина повернення на доопрацювання:") || "Потрібне доопрацювання") : undefined;
    const category_slug = status === "approved" ? moderationCategories[id] : undefined;
    await adminStage2Fetch(`/admin/stage2/places/${encodeURIComponent(id)}/status`, adminKey, { method: "PATCH", body: JSON.stringify({ status, comment, category_slug }) });
    setMessage(status === "approved" ? "Заклад схвалено і він уже доступний туристам у вибраному розділі." : "Заклад повернуто на доопрацювання.");
    await load();
  };

  const createQr = async () => {
    const row = await adminStage2Fetch<{ id: string; start_param: string }>("/admin/stage2/qr", adminKey, { method: "POST", body: JSON.stringify({ place_id: qrPlaceId || null, type: "entry_point", source: "hotel", start_param: qrParam || undefined }) });
    setQrParam(""); setQrPreviewParam(row.start_param); setMessage(`QR-контекст створено: ${row.start_param}`); await load();
  };

  const toggleQr = async (id: string, active: boolean) => {
    await adminStage2Fetch(`/admin/stage2/qr/${encodeURIComponent(id)}`, adminKey, { method: "PATCH", body: JSON.stringify({ active }) });
    setMessage(active ? "QR-контекст активовано" : "QR-контекст деактивовано");
    await load();
  };

  const deepLink = (startParam: string) => {
    const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
    const app = process.env.NEXT_PUBLIC_TELEGRAM_APP_SHORT_NAME;
    if (bot && app) return `https://t.me/${bot}/${app}?startapp=${encodeURIComponent(startParam)}`;
    if (typeof window !== "undefined") return `${window.location.origin}/tourist/welcome?startapp=${encodeURIComponent(startParam)}`;
    return startParam;
  };

  return (
    <AdminShell active="content" navigate={navigate} contentClassName="ad-main--stage2">
      <AdminPageHeader title="Контент / QR — Етап 2" subtitle="Модерація закладів, QR-контекст, категорії та локальні контакти" action={<OutlineButton onClick={() => void load()}><RefreshCcw size={17}/> Оновити</OutlineButton>} />
      <section className="ad-stage2-access">
        <label><span>ADMIN_API_KEY</span><input type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Секрет ADMIN_API_KEY з backend Railway; можна лишити порожнім, якщо STAGE2_ADMIN_API_KEY заданий у frontend" /></label>
        <PrimaryButton onClick={() => void load(adminKey)}>{loading ? "Підключення…" : "Перевірити API"}</PrimaryButton>
        <small className="ad-stage2-api-help">Це не URL API. Ключ лише підтверджує права адміністратора; URL backend береться з BACKEND_API_URL / NEXT_PUBLIC_API_URL.</small>
        {message ? <p>{message}</p> : null}
      </section>

      <section className="ad-stage2-section">
        <AdminPageHeader title="Модерація нових закладів" subtitle="Розділ визначається автоматично за типом закладу; перед Approve адміністратор може змінити його вручну" />
        <AdminTable columns={[{label:"Заклад",className:"1.4fr"},{label:"Розділ у гіді",className:"1fr"},{label:"Адреса",className:"1.3fr"},{label:"Статус",className:".7fr"},{label:"Дії",className:"1fr"}]}>
          {pending.map((row) => <TableRow key={row.id} columns={["1.4fr","1fr","1.3fr",".7fr","1fr"]}>
            <div><strong>{row.name}</strong><small>{row.subcategory || row.organization_name || row.region_name}</small></div>
            <div className="ad-stage2-moderation-category">
              <select value={moderationCategories[row.id] || row.category_slug} onChange={(event) => setModerationCategories((current) => ({ ...current, [row.id]: event.target.value }))}>
                {!stage2Categories.some((item) => item.slug === (moderationCategories[row.id] || row.category_slug)) ? <option value={moderationCategories[row.id] || row.category_slug}>{moderationCategories[row.id] || row.category_slug}</option> : null}
                {stage2Categories.filter((item) => item.slug !== "emergency").map((item) => <option key={item.slug} value={item.slug}>{item.slug === "hotel" ? "Про заклад / готель" : item.name}</option>)}
              </select>
              <small>Тип: {row.subcategory || "не вказано"}</small>
            </div>
            <span>{row.address}</span><Status tone={row.status === "rejected" ? "red" : "orange"}>{row.status}</Status>
            <div className="ad-row-actions"><button className="ad-text-btn" onClick={() => void moderate(row.id,"approved")}>Approve</button><button className="ad-text-btn is-danger" onClick={() => void moderate(row.id,"rejected")}>Reject</button></div>
          </TableRow>)}
          {!pending.length ? <div className="ad-stage2-empty-row">Черга модерації порожня</div> : null}
        </AdminTable>
      </section>

      <section className="ad-stage2-grid">
        <div className="ad-stage2-card">
          <h2>Створити QR точки входу</h2><p>Вкажіть ID схваленого готелю/точки. Backend створить унікальний start_param.</p>
          <select value={qrPlaceId} onChange={(e)=>setQrPlaceId(e.target.value)}>
            <option value="">Публічна точка без закладу</option>
            {approvedPlaces.map((place) => <option key={place.id} value={place.id}>{place.name} · {place.category_slug}</option>)}
          </select>
          <small className="ad-stage2-place-id">{qrPlaceId || "QR буде прив'язаний тільки до регіону"}</small>
          <input value={qrParam} onChange={(e)=>setQrParam(e.target.value)} placeholder="start_param (необов'язково)" />
          <PrimaryButton onClick={() => void createQr()}><Plus size={16}/> Створити QR-контекст</PrimaryButton>
        </div>
        <div className="ad-stage2-card">
          <h2>Категорії / підкатегорії</h2><p>Редагуйте основні розділи й їх фільтри без змін коду. Партнер побачить ці підкатегорії у формі.</p>
          <select value={categorySlug} onChange={(e)=>{
            const slug=e.target.value; const current=stage2Categories.find((item)=>item.slug===slug);
            setCategorySlug(slug); setCategoryName(current?.name || ""); setCategorySubcategories((current?.subcategories || []).join(", "));
          }}>
            <option value="">Оберіть існуючий розділ</option>
            {stage2Categories.map((item)=><option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
          <input value={categoryName} onChange={(e)=>setCategoryName(e.target.value)} placeholder="Назва розділу" />
          <input value={categorySubcategories} onChange={(e)=>setCategorySubcategories(e.target.value)} placeholder="Підкатегорії через кому" />
          <PrimaryButton onClick={() => void adminStage2Fetch("/admin/stage2/categories", adminKey,{method:"POST",body:JSON.stringify({slug:categorySlug,name:categoryName,subcategories:categorySubcategories.split(",").map((item)=>item.trim()).filter(Boolean)})}).then(()=>{setMessage("Категорію і підкатегорії збережено");return load();})}><Plus size={16}/> Зберегти</PrimaryButton>
          <div className="ad-stage2-template-editor">
            <strong>Шаблон типу закладу</strong>
            <select value={templateCategory} onChange={(e)=>{ const value=e.target.value; setTemplateCategory(value); const first=placeTemplates.find((item)=>item.category_slug===value); if(first){setTemplateType(first.place_type);setTemplateTitle(first.default_title || "");setTemplateDescription(first.default_description || "");setTemplateAmenities((first.default_amenities || []).join(", "));setTemplateServices(first.default_services.join(", "));setTemplateFields(Object.entries(first.fields ?? {}).map(([key,label])=>`${key}=${String(label)}`).join("; "));} }}>
              {stage2Categories.filter((item)=>item.slug!=="emergency").map((item)=><option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <select value={templateType} onChange={(e)=>{ const value=e.target.value; setTemplateType(value); const current=placeTemplates.find((item)=>item.category_slug===templateCategory&&item.place_type===value); if(current){setTemplateTitle(current.default_title || "");setTemplateDescription(current.default_description || "");setTemplateAmenities((current.default_amenities || []).join(", "));setTemplateServices(current.default_services.join(", "));setTemplateFields(Object.entries(current.fields ?? {}).map(([key,label])=>`${key}=${String(label)}`).join("; "));} }}>
              <option value="">Новий тип закладу</option>
              {placeTemplates.filter((item)=>item.category_slug===templateCategory).map((item)=><option key={item.id} value={item.place_type}>{item.label}</option>)}
            </select>
            <input value={templateType} onChange={(e)=>setTemplateType(e.target.value)} placeholder="Тип / новий тип: Ресторан, Кафе, Магазин" />
            <input value={templateTitle} onChange={(e)=>setTemplateTitle(e.target.value)} placeholder="Шаблон заголовка: Новий ресторан" />
            <textarea value={templateDescription} onChange={(e)=>setTemplateDescription(e.target.value)} placeholder="Шаблон опису закладу" rows={3} />
            <input value={templateAmenities} onChange={(e)=>setTemplateAmenities(e.target.value)} placeholder="Іконки / зручності через кому: Wi‑Fi, Паркінг, Меню" />
            <input value={templateServices} onChange={(e)=>setTemplateServices(e.target.value)} placeholder="Детальні послуги через кому: Сніданок, Сауна, Трансфер" />
            <input value={templateFields} onChange={(e)=>setTemplateFields(e.target.value)} placeholder="Поля: capacity=Кількість місць; cuisine=Кухня" />
            <PrimaryButton onClick={() => void adminStage2Fetch("/admin/stage2/place-type-templates", adminKey,{method:"POST",body:JSON.stringify({category_slug:templateCategory,place_type:templateType,label:templateType,default_title:templateTitle,default_description:templateDescription,default_amenities:templateAmenities.split(",").map((item)=>item.trim()).filter(Boolean),default_services:templateServices.split(",").map((item)=>item.trim()).filter(Boolean),fields:Object.fromEntries(templateFields.split(";").map((item)=>item.trim()).filter(Boolean).map((item)=>{const [key,...rest]=item.split("=");return [key.trim(),rest.join("=").trim()]}).filter(([key,label])=>key&&label))})}).then(()=>{setMessage("Шаблон типу закладу збережено");return load();})}><Plus size={16}/> Зберегти шаблон</PrimaryButton>
          </div>
        </div>
        <div className="ad-stage2-card">
          <h2>Екстрений контакт регіону</h2><p>Після збереження він з'явиться у «Халепа?» для Татарова.</p>
          <input value={emergencyTitle} onChange={(e)=>setEmergencyTitle(e.target.value)} placeholder="Назва служби" />
          <input value={emergencyPhone} onChange={(e)=>setEmergencyPhone(e.target.value)} placeholder="Телефон" />
          <PrimaryButton onClick={() => void adminStage2Fetch("/admin/stage2/emergency", adminKey,{method:"POST",body:JSON.stringify({region_id:"region-tatariv",title:emergencyTitle,phone:emergencyPhone,type:"custom"})}).then(()=>{setMessage("Контакт збережено");setEmergencyTitle("");setEmergencyPhone("");})}><Plus size={16}/> Додати контакт</PrimaryButton>
        </div>
        <div className="ad-stage2-card">
          <h2>Telegram-спільнота</h2><p>Посилання регіону відкриватиметься туристу на екрані «Спільнота».</p>
          <input value={communityUrl} onChange={(e)=>setCommunityUrl(e.target.value)} placeholder="https://t.me/..." />
          <PrimaryButton onClick={() => void adminStage2Fetch("/admin/stage2/regions/region-tatariv", adminKey,{method:"PATCH",body:JSON.stringify({community_url:communityUrl})}).then(()=>{setMessage("Telegram-спільноту регіону збережено");})}><Send size={16}/> Зберегти спільноту</PrimaryButton>
        </div>
      </section>

      <section className="ad-stage2-section">
        <AdminPageHeader title="QR точки" subtitle="Посилання можна перетворити на друкований QR будь-яким QR-генератором; start_param зберігається у БД" />
        <AdminTable columns={[{label:"Точка",className:"1.2fr"},{label:"start_param",className:"1.25fr"},{label:"Статус",className:".55fr"},{label:"Deep link",className:"2fr"}]}>
          {qrRows.map((row)=><TableRow key={row.id} columns={["1.2fr","1.25fr",".55fr","2fr"]}><div><strong>{row.place_name || "Публічна точка"}</strong><small>{row.region_name}</small></div><code>{row.start_param}</code><Status tone={row.active?"green":"gray"}>{row.active?"Активний":"Вимкнено"}</Status><div className="ad-stage2-link"><input readOnly value={deepLink(row.start_param)}/><button onClick={() => void navigator.clipboard.writeText(deepLink(row.start_param))}>Копіювати</button><button onClick={() => setQrPreviewParam(row.start_param)}>QR</button><button onClick={() => void toggleQr(row.id,!row.active)}>{row.active?"Вимк.":"Увімк."}</button></div></TableRow>)}
        </AdminTable>
        {qrPreviewParam ? <div className="ad-stage2-qr-preview"><Stage2QrPreview value={deepLink(qrPreviewParam)} /><div><strong>QR точки входу</strong><small>{qrPreviewParam}</small><p>Сканування відкриває Telegram Mini App з цим start_param; backend визначає регіон і прив'язаний заклад.</p></div></div> : null}
      </section>
    </AdminShell>
  );
}

function SettingsScreen({ navigate }: AdminProps) {
  return <GeneralSettingsScreen navigate={navigate} />;
}

export function AdminDesktopScreen({ slug, navigate }: { slug: string; navigate: Navigate }) {
  switch (slug) {
    case "admin-stage2": return <Stage2ContentScreen navigate={navigate} />;
    case "admin-partners": return <PartnersScreen navigate={navigate} />;
    case "admin-partner-create": return <PartnerCreateScreen navigate={navigate} />;
    case "admin-partner-details": return <PartnerDetailsScreen navigate={navigate} />;
    case "admin-partner-history": return <PartnerHistoryScreen navigate={navigate} />;
    case "admin-clients": return <ClientsScreen navigate={navigate} />;
    case "admin-client-details": return <ClientDetailsScreen navigate={navigate} />;
    case "admin-client-history": return <ClientHistoryScreen navigate={navigate} />;
    case "admin-settlements": return <SettlementsScreen navigate={navigate} />;
    case "admin-bonuses": return <BonusesScreen navigate={navigate} />;
    case "admin-statistics": return <StatisticsOverview navigate={navigate} />;
    case "admin-statistics-partners": return <StatisticsSubscreen navigate={navigate} kind="partners" />;
    case "admin-statistics-clients": return <StatisticsSubscreen navigate={navigate} kind="clients" />;
    case "admin-statistics-bonuses": return <StatisticsSubscreen navigate={navigate} kind="bonuses" />;
    case "admin-statistics-settlements": return <StatisticsSubscreen navigate={navigate} kind="settlements" />;
    case "admin-settings": return <SettingsScreen navigate={navigate} />;
    case "admin-settings-general": return <GeneralSettingsScreen navigate={navigate} />;
    case "admin-settings-company": return <CompanySettingsScreen navigate={navigate} />;
    case "admin-settings-partners": return <PartnerCommissionSettingsScreen navigate={navigate} />;
    case "admin-settings-bonuses": return <BonusSettingsScreen navigate={navigate} />;
    case "admin-settings-notifications": return <NotificationSettingsScreen navigate={navigate} />;
    case "admin-settings-security": return <SecuritySettingsScreen navigate={navigate} />;
    case "admin-settings-integrations": return <IntegrationsSettingsScreen navigate={navigate} />;
    case "admin-settings-audit": return <AuditSettingsScreen navigate={navigate} />;
    default: return <PartnersScreen navigate={navigate} />;
  }
}
