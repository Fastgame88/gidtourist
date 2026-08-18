"use client";

import type { ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
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
  Eye,
  FileText,
  Filter,
  Gift,
  ImagePlus,
  Info,
  MapPin,
  Menu,
  MoreVertical,
  Percent,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { RoleKey } from "../../lib/navigation";

type Navigate = (role: RoleKey, slug: string) => void;
type AdminProps = { navigate: Navigate };

type NavKey = "partners" | "clients" | "settlements" | "bonuses" | "statistics" | "settings";

type TableColumn = {
  label: string;
  className?: string;
};

const adminNav: Array<{ key: NavKey; label: string; slug: string; icon: typeof UserRound }> = [
  { key: "partners", label: "Партнери", slug: "admin-partners", icon: UserRound },
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

function AdminShell({ active, navigate, children }: AdminProps & { active: NavKey; children: ReactNode }) {
  return (
    <div className="ad-shell">
      <AdminSidebar active={active} navigate={navigate} />
      <main className="ad-main">{children}</main>
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
    <AdminShell active="partners" navigate={navigate}>
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
            <div className="ad-entity-cell"><span>{row[0]}</span><div><strong>{row[1]}</strong><small>{row[2]}</small></div></div>
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
    <AdminShell active="clients" navigate={navigate}>
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
    <AdminShell active="partners" navigate={navigate}>
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
        ].map(([num, label, control]) => <div className="ad-create-row" key={num as string}><div className="ad-create-row__label"><span>{num as string}</span><strong>{label as string}</strong></div><div className="ad-create-row__control">{control as ReactNode}</div></div>)}
      </section>
    </AdminShell>
  );
}

function ClientHeader({ navigate }: AdminProps) {
  return (
    <div className="ad-detail-header">
      <div className="ad-detail-person"><span>ІК</span><div><h1>Ірина Коваль</h1><small>ID клієнта: 00187 · Зареєстровано: 03.02.2024 · Оновлено: 20.05.2024</small></div><Status>Активний</Status></div>
      <div className="ad-page-actions"><OutlineButton><Edit3 size={16}/> Редагувати</OutlineButton><OutlineButton><ShieldCheck size={16}/> Заблокувати</OutlineButton><PrimaryButton onClick={() => navigate("admin", "admin-client-history")}>Інші дії <ChevronDown size={15}/></PrimaryButton></div>
    </div>
  );
}

function ClientDetailsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="clients" navigate={navigate}>
      <ClientHeader navigate={navigate}/>
      <section className="ad-detail-card ad-client-detail-card">
        <div className="ad-detail-card__title"><h2>Дані клієнта</h2><Status>Після погодження даних ви зможете редагувати клієнта</Status></div>
        <div className="ad-client-info-grid">
          <div><small>Тип клієнта</small><strong>Активний користувач</strong></div><div><small>Статус</small><strong>Підтверджений</strong></div><div className="is-wide"><small>Короткий профіль</small><strong>Любить сімейний відпочинок у Карпатах, активні маршрути та локальну кухню.</strong></div>
          <div><small>Телефон</small><strong>+380 (98) 555-12-34</strong></div><div><small>Telegram ID</small><strong>@iryna_koval</strong></div><div className="is-wide"><small>Інтереси</small><span className="ad-tags"><i>Сімейний відпочинок</i><i>Релакс</i><i>Локальна кухня</i><i>Екскурсії</i></span></div>
          <div><small>Місто / локація</small><strong>Івано-Франківськ</strong></div><div><small>Остання активність</small><strong>Сканування QR · 18.05.2024</strong></div>
        </div>
      </section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Бонуси</h2><Info size={16}/></div><div className="ad-summary-grid ad-summary-grid--four"><SummaryCard label="Поточний бонусний баланс" value="1 280 балів" note="Доступно для використання"/><SummaryCard label="Нараховано" value="3 640 балів" note="За весь період" tone="neutral"/><SummaryCard label="Використано" value="2 360 балів" note="За весь період" tone="neutral"/><SummaryCard label="Запрошені друзі" value="7" note="Успішні реєстрації" tone="neutral"/></div></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Статистика</h2><DateRange /></div><div className="ad-mini-stats">{[["Відкрито карток","86"],["QR-сканувань","24"],["Бронювань","5"],["Відвідано локацій","18"],["Відгуки","9"],["Використані пропозиції","12"]].map(([l,v])=><div key={l}><small>{l}</small><strong>{v}</strong><span>↗ 11%</span><div className="ad-spark"/></div>)}</div></section>
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
    <AdminShell active="clients" navigate={navigate}>
      <ClientHeader navigate={navigate}/>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Історія бонусів</h2><DateRange/></div><AdminTable columns={[{label:"Дата / час",className:"1fr"},{label:"Тип операції",className:"1fr"},{label:"Опис",className:"2.2fr"},{label:"Бонуси",className:".7fr"},{label:"Партнер",className:"1.2fr"},{label:"Статус",className:".8fr"}]}>{bonusHistory.map((r)=><TableRow key={r[0]} columns={["1fr","1fr","2.2fr",".7fr","1.2fr",".8fr"]}><span>{r[0]}</span><Status tone={r[1]==="Списання"?"red":"green"}>{r[1]}</Status><span className="ad-preline">{r[2]}</span><strong className={r[3].startsWith("-")?"ad-red-number":"ad-green-number"}>{r[3]}</strong><span>Гірський Затишок</span><Status>{r[4]}</Status></TableRow>)}</AdminTable></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Історія активності</h2><DateRange/></div><AdminTable columns={[{label:"Дата / час",className:"1fr"},{label:"Тип активності",className:"1fr"},{label:"Деталі",className:"2fr"},{label:"Партнер / Локація",className:"1.4fr"},{label:"Пристрій",className:"1.2fr"}]}>{[["28.05.2024 14:32","Бронювання","Бронювання №B-4821\n2 дорослих, 2 ночі","Гірський Затишок\nЯремче","Веб\nChrome / Windows"],["24.05.2024 10:15","QR-сканування","Водоспад Пробій\nОтримано 15 бонусів","Гірський Затишок\nЯремче","Мобільний додаток\niOS 17.4"],["20.05.2024 16:40","Відгук","Оцінка 5 ⭐\nЧудове місце для відпочинку!","Гірський Затишок\nЯремче","Мобільний додаток\niOS 17.4"]].map((r)=><TableRow key={r[0]} columns={["1fr","1fr","2fr","1.4fr","1.2fr"]}><span>{r[0]}</span><strong>{r[1]}</strong><span className="ad-preline">{r[2]}</span><span className="ad-preline">{r[3]}</span><span className="ad-preline">{r[4]}</span></TableRow>)}</AdminTable></section>
    </AdminShell>
  );
}

function PartnerDetailHeader({ navigate }: AdminProps) {
  return <div className="ad-detail-header"><div className="ad-detail-person"><span>🍴</span><div><h1>Ресторан «Гуцульщина»</h1><small>ID партнера: 00057 · Створено: 15.03.2024 · Оновлено: 20.05.2024</small></div><Status>Активний</Status></div><div className="ad-page-actions"><OutlineButton><Edit3 size={16}/> Редагувати</OutlineButton><OutlineButton>Призупинити</OutlineButton><PrimaryButton onClick={() => navigate("admin", "admin-partner-history")}>Інші дії <ChevronDown size={15}/></PrimaryButton></div></div>;
}

function PartnerDetailsScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="partners" navigate={navigate}>
      <PartnerDetailHeader navigate={navigate}/>
      <section className="ad-detail-card"><div className="ad-detail-card__title"><h2>Дані партнера</h2><Status>Після погодження даних ви зможете редагувати партнера</Status></div><div className="ad-partner-info-grid">
        <div><small>Категорія</small><strong>Харчування</strong></div><div><small>Графік роботи</small><strong>Щоденно 11:00 – 22:00</strong></div><div><small>Telegram ID</small><strong>@Hutsulshchyna_rest</strong></div>
        <div><small>Тип розміщення</small><strong>Преміум партнер 🏅 (монетизований)</strong></div><div className="is-wide"><small>Короткий опис</small><strong>Ресторан гуцульської кухні з автентичними стравами, затишною атмосферою та видом на Карпати.</strong></div><div className="is-wide"><small>Структура кабінету партнера</small><span className="ad-tags">{["Меню","Резерв столика","Графік роботи","Контакти","Галерея","Акції та новини","Відгуки","Wi‑Fi","Парковка","Локація"].map(t=><i key={t}>✓ {t}</i>)}</span></div>
        <div><small>Ставка, %</small><strong>12%</strong></div><div><small>Фото</small><div className="ad-photo-strip"><span>🏠</span><span>🍽</span><span>🥘</span><span>+3</span></div></div>
        <div><small>Адреса / геолокація</small><strong>м. Яремче, вул. Свободи, 247</strong></div><div><small>Телефон</small><strong>+380 (98) 765-43-21</strong></div>
      </div></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Взаєморозрахунки</h2><Info size={16}/></div><div className="ad-settlement-equation"><SummaryCard label="Загальна сума продажів через додаток" value="247 360 ₴" note="За весь період"/><span>−</span><SummaryCard label="Нараховано комісії (платформою)" value="29 683 ₴" note="Комісія 12%" tone="neutral"/><span>−</span><SummaryCard label="Списано балів у партнера (клієнтами)" value="18 450 ₴" note="За весь період" tone="neutral"/><span>=</span><SummaryCard label="До сплати платформі" value="−59 087 ₴" note="Кредитний баланс" tone="green"/></div><button type="button" className="ad-link-button" onClick={() => navigate("admin", "admin-partner-history")}>Перейти до взаєморозрахунків →</button></section>
      <section className="ad-detail-card"><div className="ad-section-title"><h2>Статистика</h2><DateRange/></div><div className="ad-mini-stats">{[["Перегляди","4 125"],["QR-сканування","1 872"],["Бронювання столів","326"],["Кількість клієнтів","589"],["Відгуки","72"],["Продажі / операції","247 360 ₴"]].map(([l,v])=><div key={l}><small>{l}</small><strong>{v}</strong><span>↗ 13%</span><div className="ad-spark"/></div>)}</div></section>
    </AdminShell>
  );
}

function PartnerHistoryScreen({ navigate }: AdminProps) {
  return (
    <AdminShell active="partners" navigate={navigate}>
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
    <AdminShell active="settlements" navigate={navigate}>
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
  return <AdminShell active="statistics" navigate={navigate}><StatTop slug="admin-statistics" navigate={navigate} title="Статистика"/><div className="ad-summary-grid ad-summary-grid--four"><SummaryCard label="Загальний оборот" value="1 245 820 грн" note="+12.5% порівняно з 01.04.2024 – 30.04.2024"/><SummaryCard label="Кількість клієнтів" value="8 732" note="+8.2% порівняно з попереднім періодом" tone="violet"/><SummaryCard label="Нараховано бонусів" value="124 582 грн" note="+9.7% порівняно з попереднім періодом" tone="orange"/><SummaryCard label="Кількість партнерів" value="186" note="+6 нових партнерів" tone="blue"/></div><FilterStrip type="stats"/><div className="ad-stats-dashboard"><section className="ad-chart-card ad-chart-card--wide"><div className="ad-section-title"><h2>Оборот за період</h2><SelectBox value="По днях"/></div><LineChart variant="mixed"/></section><section className="ad-chart-card"><h2>Оборот за категоріями</h2><div className="ad-donut-layout"><Donut center="1 245 820 грн" colors="multi"/><ul>{["Де купити 32%","Де поїсти 24%","Де відпочити 18%","Розваги 12%","Трансфер 9%","Халепа? 5%"].map(x=><li key={x}>{x}</li>)}</ul></div></section><section className="ad-chart-card"><h2>Розподіл по локаціях</h2>{["Яремче 28%","Татарів 24%","Микуличин 18%","Ворохта 16%","Поляниця 9%","Інше 5%"].map((x,i)=><div className="ad-progress-line" key={x}><span>{x}</span><i><b style={{width:`${92-i*12}%`}}/></i></div>)}</section><section className="ad-chart-card"><h2>Топ партнерів за оборотом</h2><div className="ad-simple-table">{["Колиба “Біля річки”","Готель “Карпатські зорі”","Магазин “Гірські товари”","Парк розваг “Драйв”","Таксі Карпати"].map((x,i)=><div key={x}><span>{i+1}</span><strong>{x}</strong><span>{["98 450 грн","82 600 грн","75 320 грн","62 180 грн","55 310 грн"][i]}</span></div>)}</div></section><section className="ad-chart-card"><h2>Активність клієнтів</h2><div className="ad-summary-grid ad-summary-grid--four"><SummaryCard label="Нові клієнти" value="1 245"/><SummaryCard label="Активні клієнти" value="5 672"/><SummaryCard label="Повернулися" value="2 815"/><SummaryCard label="Здійснено покупок" value="18 732"/></div><div className="ad-simple-table">{["QR код","Партнер","Рекомендації","Соціальні мережі","Інше"].map((x,i)=><div key={x}><strong>{x}</strong><span>{["3 245","2 876","1 254","856","501"][i]}</span><span>{["468 250 грн","389 420 грн","182 310 грн","128 450 грн","77 390 грн"][i]}</span></div>)}</div></section><section className="ad-chart-card"><h2>Фінансова картина</h2>{[["Виставлено рахунків","128 450 грн"],["Оплачено","92 350 грн"],["Очікує оплату","28 100 грн"],["Прострочено","7 850 грн"],["Загальна заборгованість","35 950 грн"]].map(([l,v])=><div className="ad-key-value" key={l}><span>{l}</span><strong>{v}</strong></div>)}<h2>Бонусна програма</h2>{[["Нараховано бонусів","124 582 грн"],["Використано бонусів","68 420 грн"],["Кількість операцій","2 856"],["Середній чек з бонусами","132 грн"]].map(([l,v])=><div className="ad-key-value" key={l}><span>{l}</span><strong>{v}</strong></div>)}</section></div></AdminShell>;
}

function StatsMetricGrid({ kind }: { kind: "partners" | "clients" | "bonuses" | "settlements" }) {
  const data = kind === "partners" ? [["Усього партнерів","186"],["Активні партнери","148"],["Нові партнери","12"],["Неактивні партнери","38"]] : kind === "clients" ? [["Усього клієнтів","8 732"],["Нові клієнти","1 245"],["Активні клієнти","5 672"],["Повернулися клієнти","2 815"]] : kind === "bonuses" ? [["Нараховано бонусів","124 582 грн"],["Використано бонусів","68 420 грн"],["Кількість операцій з бонусами","2 856"],["Середній чек з бонусами","132 грн"]] : [["Виставлено рахунків","128 450 грн"],["Оплачено","92 350 грн"],["Очікує оплату","28 100 грн"],["Прострочено","7 850 грн"],["Заборгованість","35 950 грн"]];
  return <div className={`ad-summary-grid ${kind==="settlements"?"ad-summary-grid--five":"ad-summary-grid--four"}`}>{data.map(([l,v],i)=><SummaryCard key={l} label={l} value={v} note={i===0?"+8.2% порівняно з попер. періодом":"+6.1%"} tone={i===2?"orange":i===3?"red":"green"}/>)}</div>;
}

function StatisticsSubscreen({ navigate, kind }: AdminProps & { kind: "partners" | "clients" | "bonuses" | "settlements" }) {
  const slug = `admin-statistics-${kind}`;
  const titleMap = { partners: "Статистика — Партнери", clients: "Статистика — Клієнти", bonuses: "Статистика — Бонуси", settlements: "Статистика — Розрахунки" };
  const donutCenter = kind === "partners" ? "186" : kind === "clients" ? "8 732" : kind === "bonuses" ? "124 582 грн" : "128 450 грн";
  return <AdminShell active="statistics" navigate={navigate}><StatTop slug={slug} navigate={navigate} title={titleMap[kind]}/><StatsMetricGrid kind={kind}/><FilterStrip type="stats"/><div className="ad-stats-subgrid"><section className="ad-chart-card ad-chart-card--wide"><h2>{kind==="clients"?"Динаміка клієнтів":kind==="partners"?"Динаміка кількості партнерів":kind==="bonuses"?"Динаміка бонусів, грн":"Динаміка розрахунків, грн"}</h2><LineChart variant="mixed"/></section><section className="ad-chart-card"><h2>{kind==="clients"?"Клієнти за локаціями":kind==="partners"?"Партнери за категоріями":kind==="bonuses"?"Бонуси за категоріями (нараховано)":"Статус рахунків"}</h2><div className="ad-donut-layout"><Donut center={donutCenter} colors="multi"/><ul>{["Де купити 32%","Де поїсти 24%","Де відпочити 18%","Розваги 12%","Трансфер 9%","Інше 5%"].map(x=><li key={x}>{x}</li>)}</ul></div></section><section className="ad-chart-card"><h2>{kind==="clients"?"Клієнти за статтю":kind==="partners"?"Топ партнерів за оборотом":kind==="bonuses"?"Топ партнерів за нарахованими бонусами":"Заборгованість по локаціях"}</h2>{["Колиба “Біля річки”","Готель “Карпатські зорі”","Магазин “Гірські товари”","Парк розваг “Драйв”","Таксі Карпати"].map((x,i)=><div className="ad-progress-line" key={x}><span>{x}</span><i><b style={{width:`${92-i*13}%`}}/></i></div>)}</section><section className="ad-chart-card"><h2>{kind==="clients"?"Топ клієнтів":kind==="partners"?"Активність партнерів":kind==="bonuses"?"Топ клієнтів за використаними бонусами":"Рахунки"}</h2><div className="ad-simple-table">{["Олександр К.","Марія І.","Іван П.","Наталія Т.","Андрій С."].map((x,i)=><div key={x}><span>{i+1}</span><strong>{x}</strong><span>{["28","24","21","19","18"][i]}</span></div>)}</div></section></div></AdminShell>;
}

function SettingsScreen({ navigate }: AdminProps) {
  return <AdminShell active="settings" navigate={navigate}><AdminPageHeader title="Налаштування" subtitle="Системні параметри адміністративної панелі"/><div className="ad-settings-grid">{["Загальні налаштування","Ролі та доступи","Сповіщення","Інтеграції","Безпека","Довідники"].map((x,i)=><section className="ad-detail-card" key={x}><span className="ad-settings-icon"><Settings size={22}/></span><h2>{x}</h2><p>Налаштування розділу в єдиному стилі нової ПК-адмінки.</p><OutlineButton>Відкрити</OutlineButton></section>)}</div></AdminShell>;
}

export function AdminDesktopScreen({ slug, navigate }: { slug: string; navigate: Navigate }) {
  switch (slug) {
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
    default: return <PartnersScreen navigate={navigate} />;
  }
}
