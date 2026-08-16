"use client";

import { useEffect, useState } from "react";
import {
  Ambulance,
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Bike,
  BookOpenCheck,
  BusFront,
  CalendarDays,
  CarFront,
  CarTaxiFront,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  Cross,
  ExternalLink,
  Flame,
  FlameKindling,
  Flower2,
  Gift,
  Grid2X2,
  Heart,
  Hotel,
  Info,
  Languages,
  LifeBuoy,
  LocateFixed,
  LogOut,
  Map,
  MapPin,
  MessageCircle,
  MountainSnow,
  Navigation,
  PawPrint,
  Pencil,
  Phone,
  Pill,
  QrCode,
  ReceiptText,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Stethoscope,
  SunMedium,
  TentTree,
  UserPlus,
  UserRound,
  UsersRound,
  Utensils,
  WalletCards,
  Waves,
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
        <div className="gt-checkin-card">
          <span><Clock3 size={26} /></span>
          <div>
            <strong>Час заїзду / виїзду</strong>
            <p><span>Заїзд з <b>14:00</b></span><span>Виїзд до <b>11:00</b></span></p>
          </div>
        </div>
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

function TransferScreen() {
  return (
    <div className="tourist-screen gt-screen gt-transfer-screen">
      <section className="gt-transfer-hero">
        <span><CarFront size={35} /></span>
        <h1>Трансфер</h1>
        <p>Таксі, трансфери та оренда авто</p>
        <div className="gt-transfer-kinds">
          <button type="button"><CarTaxiFront size={27} /><strong>Таксі</strong><small>Швидко та зручно</small></button>
          <button type="button"><BusFront size={27} /><strong>Трансфер</strong><small>По місту та між містами</small></button>
          <button type="button"><CarFront size={27} /><strong>Оренда авто</strong><small>Обирай авто та вирушай</small></button>
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

function PlanScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen">
      <main className="gt-content">
        <div className="gt-page-heading">
          <span className="gt-tone--blue"><BookOpenCheck size={23} /></span>
          <div><h1>Мій план</h1><p>Ваш відпочинок по днях</p></div>
        </div>
        <div className="gt-plan-banner">
          <div><small>Татарів · 17–20 липня</small><strong>Карпатський вікенд</strong><span>4 місця · 1 бронювання</span></div>
          <MountainSnow size={60} />
        </div>
        <SectionTitle title="Сьогодні, 18 липня" action="+ Додати" />
        <div className="gt-timeline">
          <div><time>10:00</time><span className="gt-tone--orange"><Utensils size={20} /></span><div><strong>Сніданок у «Гуцульщині»</strong><small>120 м · ресторан</small></div><ChevronRight size={18} /></div>
          <div><time>13:00</time><span className="gt-tone--purple"><MountainSnow size={20} /></span><div><strong>Маршрут до водоспаду</strong><small>3,4 км · прогулянка</small></div><ChevronRight size={18} /></div>
          <div><time>16:00</time><span className="gt-tone--green"><Waves size={20} /></span><div><strong>Чан «Гірське відновлення»</strong><small>Бронювання очікує підтвердження</small></div><ChevronRight size={18} /></div>
        </div>
        <button type="button" className="gt-outline-button" onClick={() => navigate("tourist", "catalog")}>Знайти місце для плану</button>
      </main>
    </div>
  );
}

function WalletScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen gt-screen gt-wallet-screen">
      <main className="gt-content">
        <h1 className="gt-simple-title">Бонуси</h1>
        <section className="gt-bonus-card">
          <small>Ваші бонуси</small>
          <strong>320 <Gift size={25} /></strong>
          <span>1 бал = 1 грн знижки</span>
        </section>
        <div className="gt-detail-card">
          <span><UserPlus size={22} /></span><div><strong>Запросити друга</strong><small>Запросіть друзів і отримуйте +50 бонусів</small></div><ChevronRight size={19} />
        </div>
        <div className="gt-detail-card">
          <span className="gt-tone--blue"><RefreshCcw size={22} /></span><div><strong>Історія бонусів</strong><small>Перегляньте нарахування та використання</small></div><ChevronRight size={19} />
        </div>
        <SectionTitle title="На що можна обміняти" />
        <div className="gt-reward-list">
          <div><Thumb name="hotel" /><span><strong>Знижка на проживання</strong><small>Знижка 100 грн на бронювання житла від 1000 грн</small><b><Gift size={14} /> 100 балів</b></span><button type="button">Обміняти</button></div>
          <div><Thumb name="jeep" /><span><strong>Знижка на активності</strong><small>Знижка 50 грн на будь-яку активність</small><b><Gift size={14} /> 50 балів</b></span><button type="button">Обміняти</button></div>
          <div><Thumb name="coffee" /><span><strong>Кава у подарунок</strong><small>Безкоштовна кава в партнерських закладах</small><b><Gift size={14} /> 30 балів</b></span><button type="button">Обміняти</button></div>
        </div>
        <p className="gt-expiry"><ShieldCheck size={16} /> Бонуси не згорають та діють 365 днів</p>
        <button type="button" className="gt-text-button" onClick={() => navigate("tourist", "qr")}>Показати мій QR</button>
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
      <main className="gt-content">
        <h1 className="gt-simple-title">Профіль</h1>
        <section className="gt-profile-card">
          <div className="gt-avatar"><UserRound size={36} /></div>
          <div><strong>Олена Ковальчук</strong><small><MapPin size={14} /> Львів, Україна</small><span><BadgeCheck size={14} /> Бронзовий мандрівник</span></div>
          <button type="button" aria-label="Редагувати"><Pencil size={18} /></button>
          <p><small>Ваш реферальний код</small><strong>TATAROVI-8765</strong><button type="button" aria-label="Копіювати"><Copy size={17} /></button></p>
        </section>
        <div className="gt-profile-list">
          <button type="button"><CalendarDays size={20} /><span>Мої бронювання</span><ChevronRight size={18} /></button>
          <button type="button" onClick={() => navigate("tourist", "review")}><MessageCircle size={20} /><span>Мої відгуки</span><ChevronRight size={18} /></button>
          <button type="button"><Heart size={20} /><span>Улюблені</span><ChevronRight size={18} /></button>
          <button type="button" onClick={() => navigate("tourist", "wallet")}><WalletCards size={20} /><span>Історія бонусів</span><ChevronRight size={18} /></button>
        </div>
        <div className="gt-profile-list">
          <button type="button"><Languages size={20} /><span>Мова</span><small>Українська</small><ChevronRight size={18} /></button>
          <button type="button"><Sparkles size={20} /><span>Сповіщення</span><ChevronRight size={18} /></button>
          <button type="button" onClick={() => navigate("tourist", "community")}><UsersRound size={20} /><span>Спільнота</span><ChevronRight size={18} /></button>
          <button type="button"><CircleHelp size={20} /><span>Підтримка</span><ChevronRight size={18} /></button>
        </div>
        <button type="button" className="gt-logout"><LogOut size={19} /> Вийти</button>
        <button type="button" className="gt-outline-button"><Pencil size={18} /> Редагувати профіль</button>
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
      return <WalletScreen navigate={navigate} />;
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
