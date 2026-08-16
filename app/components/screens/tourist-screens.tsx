"use client";

import { useEffect, useState } from "react";
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
  | "jeep"
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

function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <label className="gt-search">
      <Search size={19} />
      <input aria-label={placeholder} placeholder={placeholder} />
    </label>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="gt-chips">
      {items.map((item, index) => (
        <button type="button" className={index === 0 ? "is-active" : ""} key={item}>
          {item}
        </button>
      ))}
    </div>
  );
}

function MapStrip() {
  return (
    <div className="gt-map-strip">
      <div>
        <MapPin size={21} />
        <span>
          <small>Ваше місцезнаходження</small>
          <strong>вул. Незалежності, 35, Татарів</strong>
        </span>
      </div>
      <i className="gt-map-strip__road" />
      <i className="gt-map-strip__river" />
      <i className="gt-map-strip__dot" />
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

function PlaceRow({
  photo,
  title,
  subtitle,
  rating,
  distance,
  walk,
  walking = false,
  tags = [],
  onClick,
}: {
  photo: PhotoName;
  title: string;
  subtitle: string;
  rating: string;
  distance: string;
  walk: string;
  walking?: boolean;
  tags?: string[];
  onClick?: () => void;
}) {
  return (
    <button type="button" className="gt-place-row" onClick={onClick}>
      <Thumb name={photo} />
      <span className="gt-place-row__body">
        <span className="gt-place-row__title">
          <strong>{title}</strong>
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
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone: string;
}) {
  return (
    <div className="gt-category-head">
      <span className={`gt-category-head__icon gt-tone--${tone}`}>
        <Icon size={23} />
      </span>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button type="button">
        <Map size={21} />
        <span>На мапі</span>
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
  return (
    <div className="tourist-screen gt-screen gt-home-screen">
      <section className="gt-home-hero">
        <div className="gt-home-hero__copy">
          <span className="gt-hero-pin" aria-hidden="true"><MapPin size={42} fill="currentColor" /></span>
          <p>Вітаємо в</p>
          <h1>Татарові</h1>
          <span className="gt-home-welcome-note">Раді, що ви з нами!</span>
        </div>
        <div className="gt-weather">
          <SunMedium size={23} />
          <strong>24°C</strong>
          <span>Ясно</span>
          <small>Оновлено 10:30</small>
        </div>
      </section>

      <button
        type="button"
        className="gt-hotel-summary"
        onClick={() => navigate("tourist", "about")}
      >
        <Thumb name="hotel" />
        <span>
          <strong>Інфо про заклад</strong>
          <small>Готель «Гірський затишок»</small>
          <b><Star size={14} fill="currentColor" /> 4.8 · 125 відгуків</b>
        </span>
        <i>Деталі</i>
      </button>

      <div className="gt-category-grid">
        {categories.map(({ title, note, slug, tone, icon: Icon }) => (
          <button
            type="button"
            className="gt-category-card"
            key={title}
            onClick={() => navigate("tourist", slug)}
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
          onClick={() => navigate("tourist", "place")}
        >
          <span className="gt-category-card__icon"><FlameKindling size={24} /></span>
          <span>
            <strong>Гаряча пропозиція</strong>
            <small>Перевірені місця від місцевих</small>
          </span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function AboutScreen() {
  return (
    <div className="tourist-screen gt-screen gt-about-screen">
      <section className="gt-about-hero">
        <div className="gt-about-logo">
          <MountainSnow size={43} />
          <strong>Гірський<br />затишок</strong>
          <small>готель</small>
        </div>
        <div className="gt-about-hero__copy">
          <h1>Готель<br />«Гірський затишок»</h1>
          <p><MapPin size={18} /> Татарів, вул. Незалежності, 15Б</p>
        </div>
        <div className="gt-checkin-card gt-checkin-card--hero">
          <p>
            <span><Clock3 size={20} /><i>Заїзд<b>14:00</b></i></span>
            <span><Clock3 size={20} /><i>Виїзд<b>11:00</b></i></span>
          </p>
        </div>
      </section>
      <div className="gt-about-content">
        <button type="button" className="gt-service-card gt-service-card--wide">
          <span><Hotel size={25} /></span>
          <div><strong>Послуги закладу</strong><small>Доступні зручності та сервіси для гостей</small></div>
          <i>Деталі <ChevronRight size={18} /></i>
        </button>
        <div className="gt-service-grid">
          <button type="button" className="gt-service-card">
            <span><Hotel size={24} /></span>
            <div><strong>Рецепція</strong><small>Звʼяжіться з адміністратором</small></div>
            <ChevronRight size={19} />
          </button>
          <button type="button" className="gt-service-card">
            <span><Wifi size={24} /></span>
            <div><strong>Wi‑Fi</strong><small>Пароль від мережі</small></div>
            <ChevronRight size={19} />
          </button>
        </div>
        <button type="button" className="gt-service-card gt-service-card--wide">
          <span><ReceiptText size={25} /></span>
          <div><strong>Правила проживання</strong><small>Ознайомтесь з правилами перебування в нашому закладі</small></div>
          <ChevronRight size={19} />
        </button>
        <button type="button" className="gt-service-card gt-service-card--wide">
          <span><Phone size={25} /></span>
          <div><strong>Оперативні контакти</strong><small>Важливі номери телефонів для вашої зручності</small></div>
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}

function CatalogScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen gt-reference-list-screen">
      <main className="gt-content">
        <CategoryHeader icon={Utensils} title="Де поїсти" subtitle="Кафе, ресторани та заклади" tone="orange" />
        <SearchBar placeholder="Пошук закладу, кухні або страви" />
        <Chips items={["Усі", "Українська кухня", "Неукраїнська кухня", "Фаст фуд"]} />
        <MapStrip />
        <SectionTitle title="Рекомендовані заклади" action="Переглянути всі" />
        <div className="gt-place-list">
          <PlaceRow photo="restaurant" title="Ресторан «Гуцульщина»" subtitle="Українська кухня" rating="4.8 (125)" distance="120 м" walk="2 хв" walking tags={["Банош", "Бограч", "Грибна юшка"]} onClick={() => navigate("tourist", "place")} />
          <PlaceRow photo="coffee" title="Кавʼярня «Кедр»" subtitle="Кавʼярня · Десерти" rating="4.6 (89)" distance="180 м" walk="3 хв" walking tags={["Кава", "Десерти", "Сніданки", "Wi‑Fi"]} />
          <PlaceRow photo="pizza" title="Піцерія «Карпатська піца»" subtitle="Італійська кухня" rating="4.7 (63)" distance="250 м" walk="4 хв" walking tags={["Піца", "Паста", "Салати"]} />
          <PlaceRow photo="burger" title="Бургерна «Вершина»" subtitle="Фаст фуд" rating="4.5 (47)" distance="300 м" walk="5 хв" walking tags={["Бургери", "Картопля фрі", "Напої"]} />
        </div>
      </main>
    </div>
  );
}

function NearbyScreen({ navigate }: { navigate: Navigate }) {
  const categories: Array<{ label: string; icon: LucideIcon; tone: string }> = [
    { label: "Усі", icon: Grid2X2, tone: "all" },
    { label: "Де поїсти", icon: Utensils, tone: "food" },
    { label: "Де купити", icon: ShoppingBag, tone: "shop" },
    { label: "Де відпочити", icon: BedDouble, tone: "rest" },
    { label: "Розваги", icon: Bike, tone: "fun" },
    { label: "Трансфер", icon: CarFront, tone: "transfer" },
  ];

  const nearbyPlaces: Array<{
    photo: PhotoName;
    title: string;
    subtitle: string;
    distance: string;
    rating: string;
    mountain?: boolean;
    onClick?: () => void;
  }> = [
    { photo: "pizza", title: "Піцерія «Татаріно»", subtitle: "Де поїсти · Піца, італійська кухня", distance: "250 м", rating: "4.7", onClick: () => navigate("tourist", "place") },
    { photo: "store", title: "Супермаркет «Гірський»", subtitle: "Де купити · Продукти", distance: "300 м", rating: "4.5" },
    { photo: "hotel", title: "Готель «Карпатський»", subtitle: "Де відпочити · Готель", distance: "450 м", rating: "4.8" },
    { photo: "jeep", title: "Говерла", subtitle: "Гірські вершини · Природа", distance: "1,2 км", rating: "4.9", mountain: true },
  ];

  return (
    <div className="tourist-screen gt-screen gt-nearby-screen">
      <main className="gt-nearby-content">
        <header className="gt-nearby-toolbar">
          <button type="button" aria-label="Назад" onClick={() => navigate("tourist", "home")}><ArrowLeft size={25} /></button>
          <h1>Що поруч</h1>
          <span>
            <button type="button" aria-label="Фільтри"><SlidersHorizontal size={21} /></button>
            <button type="button" aria-label="Карта"><Map size={22} /></button>
          </span>
        </header>

        <div className="gt-nearby-search"><SearchBar placeholder="Пошук поруч..." /></div>

        <div className="gt-nearby-categories" aria-label="Категорії місць">
          {categories.map(({ label, icon: Icon, tone }, index) => (
            <button type="button" className={index === 0 ? "is-active" : ""} key={label}>
              <span className={`gt-nearby-category-icon gt-nearby-category-icon--${tone}`}><Icon size={23} /></span>
              <strong>{label}</strong>
            </button>
          ))}
        </div>

        <div className="gt-nearby-map">
          <span className="gt-nearby-map-pin gt-nearby-map-pin--food"><b>12</b></span>
          <span className="gt-nearby-map-pin gt-nearby-map-pin--shop"><ShoppingBag size={17} /></span>
          <span className="gt-nearby-map-pin gt-nearby-map-pin--hotel"><BedDouble size={17} /></span>
          <span className="gt-nearby-map-pin gt-nearby-map-pin--fun"><Bike size={17} /></span>
          <span className="gt-nearby-map-pin gt-nearby-map-pin--partner"><b>15</b></span>
          <span className="gt-nearby-map-pin gt-nearby-map-pin--service"><UsersRound size={17} /></span>
          <i className="gt-nearby-map-user" />
          <button type="button" className="gt-nearby-locate" aria-label="Моє місцезнаходження"><LocateFixed size={23} /></button>
        </div>

        <section className="gt-nearby-results">
          <div className="gt-nearby-radius">
            <strong>Радіус пошуку</strong>
            <div>
              {["300 м", "500 м", "1 км", "2 км", "5 км"].map((radius, index) => (
                <button type="button" className={index === 0 ? "is-active" : ""} key={radius}>{radius}</button>
              ))}
            </div>
          </div>

          <div className="gt-map-partner-legend">
            <span><MapPin size={14} /></span>
            <strong>Помаранчеві мітки — заклади-партнери</strong>
          </div>

          <div className="gt-nearby-list-head">
            <h2>Найближчі місця</h2>
            <button type="button">Сортувати: <strong>Відстань</strong></button>
          </div>

          <div className="gt-nearby-list">
            {nearbyPlaces.map((place) => (
              <button type="button" className="gt-nearby-place" key={place.title} onClick={place.onClick}>
                <Thumb name={place.photo} className={place.mountain ? "gt-nearby-place__mountain" : ""} />
                <span>
                  <strong>{place.title}</strong>
                  <small>{place.subtitle}</small>
                </span>
                <span>
                  <b>{place.distance}</b>
                  <small><Star size={13} fill="currentColor" /> {place.rating}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function PlaceScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen">
      <section className="gt-place-hero">
        <span className="gt-pill gt-pill--glass"><BadgeCheck size={16} /> Перевірено</span>
        <div>
          <h1>Ресторан «Гуцульщина»</h1>
          <p><MapPin size={17} /> Татарів · 120 м від вас</p>
        </div>
      </section>
      <main className="gt-content gt-content--overlap">
        <div className="gt-place-summary">
          <span><Star size={19} fill="currentColor" /><strong>4.8</strong><small>125 відгуків</small></span>
          <span><Clock3 size={19} /><strong>Відкрито</strong><small>до 22:00</small></span>
          <span><WalletCards size={19} /><strong>5%</strong><small>бонусами</small></span>
        </div>
        <div className="gt-action-grid">
          <button type="button"><Navigation size={22} /><span>Маршрут</span></button>
          <button type="button"><Phone size={22} /><span>Дзвінок</span></button>
          <button type="button" onClick={() => navigate("tourist", "booking")}><CalendarDays size={22} /><span>Бронювати</span></button>
          <button type="button"><Heart size={22} /><span>Зберегти</span></button>
        </div>
        <SectionTitle title="Про заклад" />
        <p className="gt-body-copy">Автентична карпатська кухня, локальні продукти та затишна атмосфера з видом на гори.</p>
        <div className="gt-detail-card">
          <span><Clock3 size={22} /></span><div><strong>Графік роботи</strong><small>Щодня · 10:00–22:00</small></div><ChevronRight size={19} />
        </div>
        <div className="gt-detail-card">
          <span><MapPin size={22} /></span><div><strong>Адреса</strong><small>вул. Незалежності, 42, Татарів</small></div><ChevronRight size={19} />
        </div>
        <button type="button" className="gt-primary-button" onClick={() => navigate("tourist", "booking")}>Забронювати столик <ChevronRight size={20} /></button>
      </main>
    </div>
  );
}

function AvailableScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen gt-reference-list-screen">
      <main className="gt-content">
        <CategoryHeader icon={BedDouble} title="Де відпочити" subtitle="Місця для релаксу та відпочинку" tone="purple" />
        <SearchBar placeholder="Пошук відпочинку та розваг" />
        <Chips items={["Усі", "Чани", "Сауни", "Басейни", "Масаж", "Походи"]} />
        <MapStrip />
        <SectionTitle title="Доступно зараз" action="Переглянути всі" />
        <div className="gt-place-list">
          <PlaceRow photo="tub" title="Чан «Гірське відновлення»" subtitle="Комплекс відпочинку" rating="4.8 (128)" distance="250 м" walk="3 хв" walking tags={["Чани", "Вид на гори", "Парковка"]} onClick={() => navigate("tourist", "booking")} />
          <PlaceRow photo="sauna" title="Сауна в «Карпатському затишку»" subtitle="Сауна" rating="4.7 (86)" distance="350 м" walk="4 хв" walking tags={["Сауна", "Віники", "Душ"]} />
          <PlaceRow photo="pool" title="Басейн «Aqua Relax»" subtitle="Басейн" rating="4.6 (93)" distance="450 м" walk="6 хв" walking tags={["Басейн", "Шезлонги", "Бар"]} />
          <PlaceRow photo="jeep" title="Екскурсія «Озеро Несамовите»" subtitle="Екскурсія по горах" rating="4.8 (74)" distance="1,2 км" walk="15 хв" walking tags={["Екскурсії", "Похід", "Гід"]} />
        </div>
      </main>
    </div>
  );
}

function ShopScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen gt-reference-list-screen gt-shop-screen">
      <main className="gt-content">
        <CategoryHeader icon={ShoppingBag} title="Де купити" subtitle="Магазини та корисні покупки" tone="blue" />
        <SearchBar placeholder="Пошук магазину або товарів" />
        <Chips items={["Усі", "Продовольчі", "Промтовари", "Сувеніри"]} />
        <MapStrip />
        <SectionTitle title="Магазини поруч" action="Переглянути всі" />
        <div className="gt-place-list">
          <PlaceRow photo="store" title="Магазин продуктів «Смак»" subtitle="Продукти харчування" rating="4.8 (126)" distance="120 м" walk="2 хв" walking tags={["Продукти", "Хліб", "Молочні вироби"]} />
          <PlaceRow photo="hotel" title="Сувеніри «Карпати»" subtitle="Сувеніри та подарунки" rating="4.7 (89)" distance="180 м" walk="3 хв" walking tags={["Сувеніри", "Подарунки", "Кераміка"]} />
          <PlaceRow photo="pharmacy" title="Аптека «Здоровʼя»" subtitle="Ліки та товари для здоровʼя" rating="4.6 (72)" distance="220 м" walk="4 хв" walking tags={["Ліки", "Вітаміни", "Косметика"]} />
          <PlaceRow photo="store" title="Госптовари «Все для дому»" subtitle="Господарські товари" rating="4.5 (51)" distance="260 м" walk="4 хв" walking tags={["Побутова хімія", "Інструменти", "Посуд"]} onClick={() => navigate("tourist", "place")} />
        </div>
      </main>
    </div>
  );
}

function EntertainmentScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen gt-entertainment-screen gt-reference-list-screen">
      <main className="gt-content">
        <CategoryHeader icon={Bike} title="Розваги" subtitle="Активності та яскраві враження" tone="red" />
        <SearchBar placeholder="Пошук розваг" />
        <Chips items={["Усі", "Джипи", "Квадроцикли", "Рафтинг", "Зіплайн", "Для дітей", "Коні"]} />
        <MapStrip />
        <SectionTitle title="Активні розваги поруч" action="Переглянути всі" />
        <div className="gt-place-list">
          <PlaceRow photo="jeep" title="Джип-тур Гірськими стежками" subtitle="Маршрут на полонини та водоспади" rating="4.9 (128)" distance="2,3 км" walk="5 хв" walking tags={["Джипи", "Природа", "Екстрим"]} onClick={() => navigate("tourist", "booking")} />
          <PlaceRow photo="jeep" title="Квадроцикли в Карпатах" subtitle="Лісові маршрути та драйв" rating="4.8 (96)" distance="3,1 км" walk="6 хв" walking tags={["Квадроцикли", "Екстрим", "Група"]} />
          <PlaceRow photo="pool" title="Рафтинг на Пруті" subtitle="Сплави різної складності" rating="4.7 (74)" distance="4,0 км" walk="8 хв" walking tags={["Рафтинг", "Вода", "Пригоди"]} />
          <PlaceRow photo="van" title="Зіплайн над карпатським лісом" subtitle="Політ, що захоплює дух" rating="4.9 (58)" distance="4,6 км" walk="9 хв" walking tags={["Зіплайн", "Екстрим", "Панорами"]} />
        </div>
      </main>
    </div>
  );
}

const transferPartners: Array<{
  photo: PhotoName;
  title: string;
  note: string;
  rating: string;
  trips: string;
  price: string;
  action: string;
}> = [
  { photo: "van", title: "Uklon Transfer", note: "Комфортні поїздки по місту та між містами", rating: "4.8", trips: "5 хв", price: "Від 250 ₴", action: "Замовити" },
  { photo: "van", title: "Visit Carpathians", note: "Трансфери в Карпати та по Західній Україні", rating: "4.9", trips: "10 хв", price: "Від 650 ₴", action: "Замовити" },
  { photo: "van", title: "Local Taxi", note: "Таксі по місту та районах. Подача швидко", rating: "4.7", trips: "3 хв", price: "Від 120 ₴", action: "Замовити" },
  { photo: "jeep", title: "Carpathian Drive", note: "Оренда авто без застави та прихованих платежів", rating: "4.8", trips: "15 хв", price: "Від 900 ₴/доба", action: "Деталі" },
];

function TransferKindIcon({ kind }: { kind: "taxi" | "transfer" | "rental" }) {
  return <span className={`gt-transfer-kind-icon gt-transfer-kind-icon--${kind}`} aria-hidden="true" />;
}

function TransferScreen() {
  return (
    <div className="tourist-screen gt-screen gt-transfer-screen">
      <section className="gt-transfer-hero">
        <span className="gt-transfer-hero-badge"><i aria-hidden="true" /></span>
        <h1>Трансфер</h1>
        <p>Таксі, трансфери та оренда авто</p>
        <div className="gt-transfer-kinds">
          <button type="button"><TransferKindIcon kind="taxi" /><span className="gt-transfer-kind-copy"><strong>Таксі</strong><small>Швидко<br />та зручно</small></span></button>
          <button type="button"><TransferKindIcon kind="transfer" /><span className="gt-transfer-kind-copy"><strong>Трансфер</strong><small>По місту та<br />між містами</small></span></button>
          <button type="button"><TransferKindIcon kind="rental" /><span className="gt-transfer-kind-copy"><strong>Оренда авто</strong><small>Обирай авто<br />та вирушай</small></span></button>
        </div>
      </section>
      <main className="gt-content gt-transfer-content">
        <SectionTitle title="Наші партнери" />
        <div className="gt-transfer-list">
          {transferPartners.map((partner) => (
            <article key={partner.title}>
              <Thumb name={partner.photo} />
              <div>
                <strong>{partner.title}</strong>
                <p>{partner.note}</p>
                <small><Star size={14} fill="currentColor" /> {partner.rating} · {partner.trips}</small>
              </div>
              <span>
                <button type="button">{partner.action}{partner.action === "Деталі" ? <ChevronRight size={16} /> : null}</button>
                <small>{partner.price}</small>
              </span>
            </article>
          ))}
        </div>
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
  { icon: MountainSnow, title: "Гірські рятувальники", note: "Яремче, найближчий пост", phone: "+380 67 342 18 68", tone: "orange" },
];

const emergencyServiceIcons: Record<EmergencyService["icon"], LucideIcon> = {
  doctor: Stethoscope,
  pharmacy: Pill,
  repair: Wrench,
  tow: CarFront,
  vet: PawPrint,
  custom: CircleHelp,
};

function EmergencyScreen() {
  const [services, setServices] = useState(DEFAULT_EMERGENCY_SERVICES);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setServices(readEmergencyServices());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="tourist-screen gt-screen gt-emergency">
      <div className="gt-emergency-mountains" aria-hidden="true" />
      <main className="gt-content">
        <header className="gt-emergency-head">
          <span className="gt-emergency-sos">SOS</span>
          <div>
            <h1>Халепа?</h1>
            <p>Швидка допомога та корисні контакти</p>
          </div>
        </header>
        <section className="gt-help-hero">
          <LifeBuoy size={41} />
          <div><small>НЕ ХВИЛЮЙТЕСЯ</small><h2>Знайдемо допомогу</h2><p>Екстрені та перевірені контакти для вашої безпеки.</p></div>
        </section>
        <button type="button" className="gt-location-button"><LocateFixed size={27} /><span><strong>Поділитися геолокацією</strong><small>Надішлемо ваші координати вибраній службі</small></span><ChevronRight size={20} /></button>
        <SectionTitle title="Екстрені контакти" />
        <div className="gt-contact-list">
          {emergencyContacts.map(({ icon: Icon, title, note, phone, tone }) => (
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
        <SectionTitle title="Корисні сервіси" />
        <div className="gt-service-mini-grid">
          {services.filter((service) => service.active).map((service) => {
            const ServiceIcon = emergencyServiceIcons[service.icon] ?? CircleHelp;
            return (
              <button type="button" key={service.id}>
                <span className={`gt-tone--${service.tone}`}><ServiceIcon size={21} /></span>
                <strong>{service.title}</strong>
                <small>{service.note}</small>
              </button>
            );
          })}
        </div>
        <p className="gt-expiry"><Info size={16} /> Контакти перевірено регіональним адміністратором 14 липня 2026.</p>
      </main>
    </div>
  );
}

function ProfileScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen gt-profile-screen">
      <main className="gt-content gt-profile-content">
        <h1 className="gt-simple-title">Профіль</h1>
        <section className="gt-profile-card gt-profile-card--reference">
          <div className="gt-avatar gt-avatar--photo" role="img" aria-label="Олена Ковальчук" />
          <div><strong>Олена Ковальчук</strong><small><MapPin size={17} /> Львів, Україна</small></div>
        </section>
        <div className="gt-profile-list gt-profile-list--reference">
          <button type="button" className="gt-profile-row--reviews" onClick={() => navigate("tourist", "review")}><MessageSquareMore size={27} /><span>Мої відгуки</span><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--favorites"><Heart size={27} /><span>Улюблені</span><ChevronRight size={20} /></button>
        </div>
        <div className="gt-profile-list gt-profile-list--reference">
          <button type="button" className="gt-profile-row--language"><Globe size={27} /><span>Мова</span><small>Українська</small><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--notifications"><Bell size={26} /><span>Сповіщення</span><ChevronRight size={20} /></button>
          <button type="button" className="gt-profile-row--support"><Headset size={27} /><span>Підтримка</span><ChevronRight size={20} /></button>
        </div>
        <button type="button" className="gt-logout gt-profile-logout"><LogOut size={25} /> Вийти</button>
        <button type="button" className="gt-outline-button gt-profile-edit"><Pencil size={20} /> Редагувати профіль</button>
      </main>
    </div>
  );
}

function CommunityScreen() {
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <section className="gt-community-hero">
          <span><MessageCircle size={31} /></span>
          <small>Telegram-спільнота Татарова</small>
          <h1>Подорожуйте разом з місцевими</h1>
          <p>Новини, маршрути, події та перевірені рекомендації регіону.</p>
          <button type="button" className="gt-primary-button">Відкрити спільноту <ExternalLink size={19} /></button>
        </section>
        <SectionTitle title="У спільноті ви знайдете" />
        <div className="gt-community-list">
          <div><span className="gt-tone--green"><SunMedium size={22} /></span><div><strong>Погода і стан маршрутів</strong><small>Короткі локальні оновлення без спаму</small></div></div>
          <div><span className="gt-tone--purple"><TentTree size={22} /></span><div><strong>Нові місця й добірки</strong><small>Перевірені редакцією рекомендації</small></div></div>
          <div><span className="gt-tone--blue"><MessageCircle size={22} /></span><div><strong>Допомога мандрівникам</strong><small>Поради від місцевих і служби підтримки</small></div></div>
        </div>
        <div className="gt-notice"><ShieldCheck size={21} /><p>Ви самі керуєте згодою на сервісні повідомлення у профілі.</p></div>
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
      return <AboutScreen />;
    case "catalog":
      return <CatalogScreen navigate={navigate} />;
    case "shop":
      return <ShopScreen navigate={navigate} />;
    case "entertainment":
      return <EntertainmentScreen navigate={navigate} />;
    case "transfer":
      return <TransferScreen />;
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
    case "community":
      return <CommunityScreen />;
    default:
      return <HomeScreen navigate={navigate} />;
  }
}
