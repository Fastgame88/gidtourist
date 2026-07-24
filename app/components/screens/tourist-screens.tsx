"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Bell,
  Bike,
  CalendarDays,
  Camera,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coffee,
  Compass,
  Copy,
  Cross,
  ExternalLink,
  Eye,
  EyeOff,
  Gift,
  Heart,
  HeartHandshake,
  Hospital,
  Hotel,
  Info,
  Languages,
  LifeBuoy,
  LocateFixed,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageCircle,
  MountainSnow,
  Navigation,
  PawPrint,
  Phone,
  Plus,
  QrCode,
  ReceiptText,
  RefreshCcw,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  SunMedium,
  TentTree,
  TimerReset,
  UserRound,
  UsersRound,
  Utensils,
  WalletCards,
  Waves,
  Wifi,
  Zap,
} from "lucide-react";
import type { RoleKey } from "../../lib/navigation";
import {
  Avatar,
  Card,
  IconButton,
  PrimaryButton,
  ProgressBar,
  RowLink,
  SearchField,
  SecondaryButton,
  StatusBadge,
  Tag,
  TimelineItem,
  TimeBadge,
  Toggle,
} from "../ui";

type Navigate = (role: RoleKey, slug: string) => void;

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

function MobileTopBar({
  title = "Татарів",
  subtitle = "Гід готелю «Коруна»",
  back = false,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
}) {
  return (
    <div className="mobile-topbar">
      {back ? (
        <IconButton label="Назад" onClick={() => window.history.back()}>
          <ChevronLeft size={24} />
        </IconButton>
      ) : (
        <span className="brand-mark brand-mark--small">
          <Compass size={23} />
        </span>
      )}
      <button type="button" className="location-switcher">
        <span>{subtitle}</span>
        <strong>{title}</strong>
        <ChevronDown size={17} />
      </button>
      <IconButton label="Сповіщення">
        <Bell size={23} />
        <i className="notification-dot" />
      </IconButton>
    </div>
  );
}

function MockQr() {
  return (
    <div className="mock-qr" aria-label="QR-код">
      {qrPattern.flatMap((row, rowIndex) =>
        row.split("").map((cell, cellIndex) => (
          <i
            key={`${rowIndex}-${cellIndex}`}
            className={cell === "1" ? "is-filled" : ""}
          />
        )),
      )}
      <span className="mock-qr__logo">
        <Compass size={20} />
      </span>
    </div>
  );
}

function WelcomeScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen tourist-welcome">
      <div className="welcome-visual">
        <span className="welcome-grid" />
        <div className="welcome-logo">
          <Compass size={34} />
        </div>
        <div className="welcome-route" aria-hidden="true">
          <span className="route-point route-point--one" />
          <span className="route-point route-point--two" />
          <span className="route-point route-point--three" />
          <i />
        </div>
        <StatusBadge tone="lime" dot>
          QR-контекст визначено
        </StatusBadge>
      </div>
      <div className="welcome-copy">
        <p className="eyebrow">Вітаємо в Карпатах</p>
        <h1>
          Ваш локальний гід у <em>Татарові</em>
        </h1>
        <p>
          Ви відкрили гід готелю «Коруна». Ми вже підібрали місця, маршрути та
          корисні сервіси поруч.
        </p>
      </div>
      <Card className="context-card">
        <div className="context-card__icon">
          <Hotel size={26} />
        </div>
        <div>
          <small>Точка входу</small>
          <strong>Готель «Коруна»</strong>
          <span>
            <MapPin size={16} /> вул. Пігівська, 660
          </span>
        </div>
        <BadgeCheck size={25} />
      </Card>
      <div className="welcome-actions">
        <PrimaryButton onClick={() => navigate("tourist", "home")}>
          Відкрити гід
        </PrimaryButton>
        <button className="text-button" type="button">
          Обрати інше місце
        </button>
      </div>
      <p className="privacy-note">
        <LockKeyhole size={16} /> Геолокацію запитаємо лише для функції «Поруч
        зі мною»
      </p>
    </div>
  );
}

const categories = [
  { title: "Про заклад", note: "Wi‑Fi, правила", icon: Hotel, tone: "dark", slug: "about" },
  { title: "Де поїсти", note: "42 місця", icon: Utensils, tone: "orange", slug: "catalog" },
  { title: "Де купити", note: "Магазини", icon: ShoppingBag, tone: "blue", slug: "catalog" },
  { title: "Де відпочити", note: "Чани, SPA", icon: Waves, tone: "green", slug: "available" },
  { title: "Розваги", note: "Для всіх", icon: Bike, tone: "lime", slug: "catalog" },
  { title: "Що поруч", note: "До 500 м", icon: MapPin, tone: "teal", slug: "nearby" },
  { title: "Трансфер", note: "Таксі, авто", icon: CarFront, tone: "purple", slug: "catalog" },
  { title: "Халепа?", note: "Допомога", icon: LifeBuoy, tone: "red", slug: "emergency" },
];

function HomeScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen">
      <MobileTopBar />
      <section className="mobile-hero-card">
        <div>
          <StatusBadge tone="lime">Середа · +18°C</StatusBadge>
          <h1>Доброго ранку, Андрію!</h1>
          <p>Знайдемо найкращий план на сьогодні?</p>
        </div>
        <div className="weather-orb">
          <SunMedium size={35} />
          <span>18°</span>
        </div>
      </section>
      <SearchField placeholder="Знайти місце, послугу або маршрут" />

      <section className="mobile-section">
        <div className="mobile-section__heading">
          <div>
            <p className="eyebrow">Оберіть напрям</p>
            <h2>Що вас цікавить?</h2>
          </div>
          <button type="button">Усі</button>
        </div>
        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                type="button"
                className={`category-tile category-tile--${category.tone}`}
                key={category.title}
                onClick={() => navigate("tourist", category.slug)}
              >
                <span>
                  <Icon size={26} />
                </span>
                <strong>{category.title}</strong>
                <small>{category.note}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mobile-section">
        <div className="mobile-section__heading">
          <div>
            <p className="eyebrow">Перевірено редакцією</p>
            <h2>Рекомендуємо поруч</h2>
          </div>
          <button type="button" onClick={() => navigate("tourist", "catalog")}>
            Дивитися
          </button>
        </div>
        <button
          type="button"
          className="featured-place"
          onClick={() => navigate("tourist", "place")}
        >
          <div className="featured-place__art featured-place__art--restaurant">
            <span className="place-badge">
              <BadgeCheck size={16} /> Ми рекомендуємо
            </span>
            <Heart size={22} />
          </div>
          <div className="featured-place__copy">
            <div>
              <strong>Грибова хата</strong>
              <span>
                <Star size={16} fill="currentColor" /> 4.9 · 328 відгуків
              </span>
            </div>
            <p>Українська кухня · 1,2 км</p>
            <StatusBadge tone="green" dot>
              Відкрито до 22:00
            </StatusBadge>
          </div>
        </button>
      </section>
    </div>
  );
}

function AboutScreen() {
  return (
    <div className="tourist-screen">
      <MobileTopBar title="Про заклад" subtitle="Готель «Коруна»" back />
      <section className="about-cover">
        <div className="about-cover__mountains" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <StatusBadge tone="lime">Ваше місце проживання</StatusBadge>
        <h1>Готель «Коруна»</h1>
        <p>
          <MapPin size={17} /> Татарів · 0 м від вас
        </p>
      </section>
      <div className="quick-info-grid">
        <Card>
          <Clock3 size={23} />
          <span>Check-in</span>
          <strong>з 14:00</strong>
        </Card>
        <Card>
          <Clock3 size={23} />
          <span>Check-out</span>
          <strong>до 11:00</strong>
        </Card>
        <Card>
          <Wifi size={23} />
          <span>Wi‑Fi</span>
          <strong>Koruna_Guest</strong>
        </Card>
      </div>
      <Card className="wifi-card" tone="lime">
        <span>
          <Wifi size={28} />
        </span>
        <div>
          <small>Пароль до Wi‑Fi</small>
          <strong>KORUNA2026</strong>
        </div>
        <button type="button" aria-label="Копіювати пароль">
          <Copy size={22} />
        </button>
      </Card>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Послуги та інформація</h2>
        </div>
        <div className="list-card">
          <RowLink icon={<Coffee size={22} />} title="Сніданок" subtitle="08:00–11:00 · ресторан, 1 поверх" />
          <RowLink icon={<Waves size={22} />} title="Басейн і SPA" subtitle="09:00–21:00 · за попереднім записом" />
          <RowLink icon={<BedDouble size={22} />} title="Замовити прибирання" subtitle="Заявка до адміністратора" />
          <RowLink icon={<Info size={22} />} title="Правила проживання" subtitle="Тиша, паркування, домашні тварини" />
        </div>
      </section>
      <SecondaryButton icon={<Phone size={20} />}>Зателефонувати на рецепцію</SecondaryButton>
    </div>
  );
}

function PlaceListCard({
  title,
  meta,
  distance,
  rating,
  tone,
  badge,
  onClick,
}: {
  title: string;
  meta: string;
  distance: string;
  rating: string;
  tone: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button className="place-list-card" type="button" onClick={onClick}>
      <span className={`place-list-card__visual place-list-card__visual--${tone}`}>
        {badge ? <StatusBadge tone="lime">{badge}</StatusBadge> : null}
      </span>
      <span className="place-list-card__copy">
        <span className="place-list-card__topline">
          <strong>{title}</strong>
          <Heart size={20} />
        </span>
        <small>{meta}</small>
        <span className="place-list-card__meta">
          <span>
            <Star size={16} fill="currentColor" /> {rating}
          </span>
          <span>
            <MapPin size={16} /> {distance}
          </span>
        </span>
      </span>
    </button>
  );
}

function CatalogScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen">
      <MobileTopBar title="Де поїсти" subtitle="Татарів та поруч" back />
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">42 перевірені місця</p>
          <h1>Смачно поруч</h1>
        </div>
        <IconButton label="Фільтри">
          <SlidersHorizontal size={23} />
        </IconButton>
      </div>
      <SearchField placeholder="Ресторан, кухня або страва" />
      <div className="tag-row tag-row--scroll">
        <Tag active>Усі</Tag>
        <Tag>Відкрито</Tag>
        <Tag>До 2 км</Tag>
        <Tag>З дітьми</Tag>
        <Tag>Бонуси</Tag>
      </div>
      <Card tone="lime" className="catalog-promo">
        <div>
          <Sparkles size={23} />
          <strong>+5% бонусами сьогодні</strong>
        </div>
        <p>У 8 партнерських закладах · до 23:59</p>
      </Card>
      <div className="catalog-sort">
        <span>Знайдено 42 місця</span>
        <button type="button">
          За релевантністю <ChevronDown size={17} />
        </button>
      </div>
      <div className="place-list">
        <PlaceListCard
          title="Грибова хата"
          meta="Українська · Середній чек 450 ₴"
          distance="1,2 км"
          rating="4.9"
          tone="amber"
          badge="Рекомендуємо"
          onClick={() => navigate("tourist", "place")}
        />
        <PlaceListCard
          title="Кухня гір"
          meta="Карпатська · Середній чек 380 ₴"
          distance="750 м"
          rating="4.8"
          tone="forest"
          badge="Партнер"
          onClick={() => navigate("tourist", "place")}
        />
        <PlaceListCard
          title="Варенична у Марусі"
          meta="Домашня кухня · Середній чек 290 ₴"
          distance="2,1 км"
          rating="4.7"
          tone="rose"
          onClick={() => navigate("tourist", "place")}
        />
      </div>
    </div>
  );
}

function NearbyScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen tourist-screen--map">
      <MobileTopBar title="Що поруч" subtitle="Радіус 500 м" back />
      <div className="map-search-overlay">
        <SearchField placeholder="Знайти поруч" />
        <IconButton label="Фільтри">
          <SlidersHorizontal size={22} />
        </IconButton>
      </div>
      <div className="mock-map mock-map--mobile">
        <span className="map-road map-road--one" />
        <span className="map-road map-road--two" />
        <span className="map-river" />
        <span className="map-area map-area--forest" />
        <span className="map-area map-area--village" />
        {[
          ["map-pin--hotel", Hotel, "Коруна"],
          ["map-pin--food", Utensils, "Їжа"],
          ["map-pin--shop", Store, "Крамниця"],
          ["map-pin--spa", Waves, "SPA"],
          ["map-pin--view", MountainSnow, "Огляд"],
        ].map(([className, Icon, label]) => {
          const PinIcon = Icon as typeof Hotel;
          return (
            <button className={`map-pin ${className}`} type="button" key={label as string}>
              <PinIcon size={19} />
              <span>{label as string}</span>
            </button>
          );
        })}
        <button className="map-locate" type="button" aria-label="Моє місце">
          <LocateFixed size={24} />
        </button>
      </div>
      <div className="nearby-sheet">
        <span className="sheet-handle" />
        <div className="mobile-section__heading">
          <div>
            <p className="eyebrow">У радіусі 500 м</p>
            <h2>6 корисних місць</h2>
          </div>
          <button type="button">Список</button>
        </div>
        <button className="nearby-place" type="button" onClick={() => navigate("tourist", "place")}>
          <span className="nearby-place__art" />
          <div>
            <strong>Кухня гір</strong>
            <small>Карпатська кухня · відкрито</small>
            <span>
              <MapPin size={16} /> 350 м · 5 хв пішки
            </span>
          </div>
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}

function PlaceScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen tourist-place-screen">
      <section className="place-cover">
        <div className="place-cover__top">
          <IconButton label="Назад">
            <ArrowLeft size={23} />
          </IconButton>
          <div>
            <IconButton label="Поділитися">
              <Send size={22} />
            </IconButton>
            <IconButton label="Зберегти">
              <Heart size={22} />
            </IconButton>
          </div>
        </div>
        <div className="place-cover__badges">
          <StatusBadge tone="lime">
            <BadgeCheck size={16} /> Ми рекомендуємо
          </StatusBadge>
          <StatusBadge tone="green" dot>
            Відкрито
          </StatusBadge>
        </div>
        <div className="place-cover__pager">
          <i className="is-active" />
          <i />
          <i />
          <i />
        </div>
      </section>
      <section className="place-copy">
        <p className="eyebrow">Ресторан · партнер</p>
        <h1>Грибова хата</h1>
        <div className="place-rating-row">
          <span>
            <Star size={17} fill="currentColor" /> <strong>4.9</strong> · 328
            перевірених
          </span>
          <span>
            <MapPin size={17} /> 1,2 км
          </span>
        </div>
      </section>
      <Card tone="lime" className="place-bonus-card">
        <span>
          <Gift size={26} />
        </span>
        <div>
          <strong>Отримайте 5% бонусами</strong>
          <p>Списати можна до 20% наступного чека</p>
        </div>
        <ChevronRight size={22} />
      </Card>
      <div className="place-actions-grid">
        <button type="button">
          <Navigation size={23} /> <span>Маршрут</span>
        </button>
        <button type="button">
          <Phone size={23} /> <span>Дзвінок</span>
        </button>
        <button type="button" onClick={() => navigate("tourist", "booking")}>
          <CalendarDays size={23} /> <span>Бронювати</span>
        </button>
        <button type="button">
          <MessageCircle size={23} /> <span>Написати</span>
        </button>
      </div>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Про місце</h2>
          <button type="button">Більше</button>
        </div>
        <p className="place-description">
          Автентична карпатська кухня, страви з локальних продуктів і тераса з
          видом на гори. Інформацію перевірено 12 липня 2026 року.
        </p>
        <div className="attribute-grid">
          <span>
            <UsersRound size={19} /> З дітьми
          </span>
          <span>
            <CarFront size={19} /> Паркування
          </span>
          <span>
            <PawPrint size={19} /> Pet friendly
          </span>
          <span>
            <Wifi size={19} /> Wi‑Fi
          </span>
        </div>
      </section>
      <PrimaryButton onClick={() => navigate("tourist", "booking")} icon={<CalendarDays size={20} />}>
        Забронювати столик
      </PrimaryButton>
    </div>
  );
}

function AvailableScreen({ navigate }: { navigate: Navigate }) {
  const resources = [
    { title: "Карпатський чан №1", type: "До 6 гостей", time: "Сьогодні · 18:00", price: "2 400 ₴", tone: "forest" },
    { title: "SPA-програма для двох", type: "120 хв", time: "Сьогодні · 19:30", price: "3 200 ₴", tone: "rose" },
    { title: "Трансфер до Буковелю", type: "До 4 пасажирів", time: "Сьогодні · 17:15", price: "750 ₴", tone: "blue" },
  ];
  return (
    <div className="tourist-screen">
      <MobileTopBar title="Доступно зараз" subtitle="Реальні вільні слоти" back />
      <section className="available-hero">
        <span>
          <Zap size={23} fill="currentColor" /> Оновлено щойно
        </span>
        <h1>Можна забронювати сьогодні</h1>
        <p>Показуємо лише ресурси з актуальним календарем партнера.</p>
      </section>
      <div className="tag-row tag-row--scroll">
        <Tag active>Усе</Tag>
        <Tag>Чани</Tag>
        <Tag>SPA</Tag>
        <Tag>Трансфер</Tag>
        <Tag>Столи</Tag>
      </div>
      <div className="available-list">
        {resources.map((resource, index) => (
          <Card className="available-card" key={resource.title}>
            <span className={`available-card__art available-card__art--${resource.tone}`}>
              {index === 0 ? <Waves size={29} /> : index === 1 ? <HeartHandshake size={29} /> : <CarFront size={29} />}
            </span>
            <div className="available-card__copy">
              <div>
                <strong>{resource.title}</strong>
                <small>{resource.type}</small>
              </div>
              <TimeBadge>{resource.time}</TimeBadge>
              <div>
                <strong>{resource.price}</strong>
                <button type="button" onClick={() => navigate("tourist", "booking")}>
                  Обрати <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card tone="soft" className="availability-note">
        <TimerReset size={24} />
        <div>
          <strong>Чим «Доступно» відрізняється від «Відкрито»?</strong>
          <p>Відкрито — працює зараз. Доступно — є конкретний вільний слот.</p>
        </div>
      </Card>
    </div>
  );
}

function BookingScreen({ navigate }: { navigate: Navigate }) {
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState("18:00");
  const dates = [
    ["Сьогодні", "15"],
    ["Чт", "16"],
    ["Пт", "17"],
    ["Сб", "18"],
    ["Нд", "19"],
  ];
  return (
    <div className="tourist-screen booking-screen">
      <MobileTopBar title="Бронювання" subtitle="Карпатські чани" back />
      <Card className="booking-place-card">
        <span className="booking-place-card__art" />
        <div>
          <small>Коруна SPA · Татарів</small>
          <strong>Карпатський чан</strong>
          <span>
            <Star size={14} fill="currentColor" /> 4.9 · 1,3 км
          </span>
        </div>
      </Card>

      <section className="booking-step">
        <div className="booking-step__heading">
          <span>1</span>
          <div>
            <small>Ресурс</small>
            <h2>Оберіть чан</h2>
          </div>
        </div>
        <div className="resource-selector">
          <button className="is-active" type="button">
            <Waves size={23} />
            <span>
              <strong>Чан №1</strong>
              <small>до 6 гостей</small>
            </span>
            <CheckCircle2 size={22} />
          </button>
          <button type="button">
            <Waves size={23} />
            <span>
              <strong>Чан №2</strong>
              <small>до 8 гостей</small>
            </span>
          </button>
        </div>
      </section>

      <section className="booking-step">
        <div className="booking-step__heading">
          <span>2</span>
          <div>
            <small>Дата</small>
            <h2>Коли плануєте?</h2>
          </div>
        </div>
        <div className="date-selector">
          {dates.map(([label, date], index) => (
            <button
              key={date}
              type="button"
              className={day === index ? "is-active" : ""}
              onClick={() => setDay(index)}
            >
              <small>{label}</small>
              <strong>{date}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="booking-step">
        <div className="booking-step__heading">
          <span>3</span>
          <div>
            <small>Вільний час</small>
            <h2>Оберіть слот</h2>
          </div>
        </div>
        <div className="slot-grid">
          {["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map((time) => (
            <button
              key={time}
              type="button"
              className={slot === time ? "is-active" : ""}
              disabled={time === "17:00" || time === "20:00"}
              onClick={() => setSlot(time)}
            >
              {time}
            </button>
          ))}
        </div>
        <p className="slot-note">
          <Clock3 size={16} /> Тривалість 2 год · buffer між бронюваннями 30 хв
        </p>
      </section>

      <Card tone="soft" className="booking-summary">
        <div>
          <span>Чан №1 · {dates[day][0]}, {dates[day][1]} липня · {slot}</span>
          <strong>2 400 ₴</strong>
        </div>
        <p>Оплата на місці · без завдатку</p>
      </Card>
      <PrimaryButton onClick={() => navigate("tourist", "plan")}>
        Підтвердити бронювання
      </PrimaryButton>
    </div>
  );
}

function PlanScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen">
      <MobileTopBar title="Мій план" subtitle="Середа, 15 липня" />
      <section className="plan-hero">
        <div>
          <p className="eyebrow">Ваш день у Карпатах</p>
          <h1>Спокійний день із краєвидами</h1>
          <p>4 місця · 28 км · приблизно 8 годин</p>
        </div>
        <div className="plan-weather">
          <SunMedium size={29} />
          <strong>18°</strong>
          <span>без опадів</span>
        </div>
      </section>
      <div className="plan-pills">
        <StatusBadge tone="green">
          <CarFront size={16} /> На авто
        </StatusBadge>
        <StatusBadge tone="lime">
          <UsersRound size={16} /> Для двох
        </StatusBadge>
        <StatusBadge tone="blue">Середній бюджет</StatusBadge>
      </div>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <div>
            <p className="eyebrow">Сьогодні</p>
            <h2>План по часу</h2>
          </div>
          <button type="button">Редагувати</button>
        </div>
        <div className="timeline">
          <TimelineItem
            time="09:00"
            title="Сніданок у готелі"
            description="Готель «Коруна» · 60 хв"
            state="done"
          />
          <TimelineItem
            time="10:30"
            title="Водоспад Женецький Гук"
            description="18 км · маршрут 2,5 години"
            state="active"
          >
            <button type="button" className="timeline-action">
              <Navigation size={17} /> Відкрити маршрут
            </button>
          </TimelineItem>
          <TimelineItem
            time="14:00"
            title="Обід у «Грибовій хаті»"
            description="Заброньовано на 2 гостей"
            state="upcoming"
          />
          <TimelineItem
            time="18:00"
            title="Карпатський чан №1"
            description="Коруна SPA · 2 години"
            state="upcoming"
          />
        </div>
      </section>
      <Card tone="lime" className="plan-suggestion">
        <span>
          <Sparkles size={24} />
        </span>
        <div>
          <strong>Маєте ще 1,5 години</strong>
          <p>Додайте оглядовий майданчик дорогою до ресторану.</p>
        </div>
        <Plus size={22} />
      </Card>
      <SecondaryButton onClick={() => navigate("tourist", "catalog")} icon={<RefreshCcw size={20} />}>
        Змінити одне місце
      </SecondaryButton>
    </div>
  );
}

function WalletScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen">
      <MobileTopBar title="Бонуси" subtitle="Ваш гаманець" />
      <section className="wallet-card">
        <div className="wallet-card__top">
          <span className="wallet-brand">
            <Compass size={22} /> Гід туриста
          </span>
          <button type="button" aria-label="Приховати баланс">
            <Eye size={22} />
          </button>
        </div>
        <div className="wallet-card__balance">
          <small>Доступний баланс</small>
          <strong>1 280</strong>
          <span>бонусів</span>
        </div>
        <div className="wallet-card__meta">
          <span>
            <small>Очікує</small>
            <strong>+120</strong>
          </span>
          <span>
            <small>Згорить 31.08</small>
            <strong>240</strong>
          </span>
        </div>
        <span className="wallet-card__orb" />
      </section>
      <div className="wallet-actions">
        <button type="button" onClick={() => navigate("tourist", "qr")}>
          <span>
            <QrCode size={24} />
          </span>
          <strong>Мій QR</strong>
          <small>Нарахувати або списати</small>
        </button>
        <button type="button">
          <span>
            <Gift size={24} />
          </span>
          <strong>Пропозиції</strong>
          <small>Де використати</small>
        </button>
      </div>
      <Card tone="lime" className="bonus-progress-card">
        <div>
          <span>
            <Coffee size={23} />
          </span>
          <div>
            <strong>Ще 2 покупки до подарунка</strong>
            <p>10-та кава в «Кухні гір» безкоштовно</p>
          </div>
        </div>
        <ProgressBar value={80} />
      </Card>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Останні операції</h2>
          <button type="button">Усі</button>
        </div>
        <div className="wallet-history">
          <RowLink
            icon={<Utensils size={22} />}
            title="Грибова хата"
            subtitle="Сьогодні, 14:28 · нарахування"
            value={<strong className="positive-value">+120</strong>}
            leadingTone="orange"
          />
          <RowLink
            icon={<Waves size={22} />}
            title="Коруна SPA"
            subtitle="14 липня · часткова оплата"
            value={<strong className="negative-value">−400</strong>}
            leadingTone="blue"
          />
          <RowLink
            icon={<CarFront size={22} />}
            title="Tatariv Transfer"
            subtitle="12 липня · нарахування"
            value={<strong className="positive-value">+75</strong>}
            leadingTone="green"
          />
        </div>
      </section>
    </div>
  );
}

function QrScreen({ navigate }: { navigate: Navigate }) {
  const [visible, setVisible] = useState(true);
  return (
    <div className="tourist-screen qr-screen">
      <MobileTopBar title="Мій QR" subtitle="Для операції у партнера" back />
      <div className="qr-intro">
        <StatusBadge tone="green" dot>
          Готовий до сканування
        </StatusBadge>
        <h1>Покажіть QR працівнику</h1>
        <p>Він діє один раз і не містить ваших персональних даних.</p>
      </div>
      <Card className="qr-card">
        <div className={`qr-card__code ${visible ? "" : "is-hidden"}`}>
          {visible ? <MockQr /> : <EyeOff size={50} />}
        </div>
        <div className="qr-countdown">
          <span>
            <i style={{ transform: "rotate(288deg)" }} />
            <strong>42</strong>
          </span>
          <div>
            <small>Код оновиться через</small>
            <strong>42 секунди</strong>
          </div>
        </div>
        <button type="button" className="qr-visibility" onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          {visible ? "Приховати QR" : "Показати QR"}
        </button>
      </Card>
      <Card tone="lime" className="qr-balance-row">
        <span>
          <WalletCards size={25} />
        </span>
        <div>
          <small>Ваш баланс</small>
          <strong>1 280 бонусів</strong>
        </div>
        <span>до 20% чека</span>
      </Card>
      <div className="safe-list">
        <div>
          <ShieldCheck size={20} />
          <span>Одноразовий токен</span>
        </div>
        <div>
          <TimerReset size={20} />
          <span>Автоматичне оновлення</span>
        </div>
        <div>
          <BadgeCheck size={20} />
          <span>Суму підтверджуєте ви</span>
        </div>
      </div>
      <SecondaryButton onClick={() => navigate("tourist", "purchase-confirmation")} icon={<ReceiptText size={20} />}>
        Перейти до підтвердження
      </SecondaryButton>
    </div>
  );
}

function PurchaseConfirmationScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen confirmation-screen">
      <MobileTopBar title="Підтвердження" subtitle="Нова операція" back />
      <div className="confirmation-status">
        <span className="pulse-ring">
          <ReceiptText size={31} />
        </span>
        <StatusBadge tone="orange" dot>
          Очікує вашої дії
        </StatusBadge>
        <h1>Підтвердити покупку?</h1>
        <p>Перевірте заклад, суму та бонуси перед проведенням операції.</p>
      </div>
      <Card className="merchant-card">
        <span className="merchant-card__logo">
          <Utensils size={25} />
        </span>
        <div>
          <small>Партнер</small>
          <strong>Грибова хата</strong>
          <span>
            <BadgeCheck size={16} /> Перевірений партнер
          </span>
        </div>
      </Card>
      <Card className="receipt-card">
        <div className="receipt-card__amount">
          <small>Сума покупки</small>
          <strong>2 400,00 ₴</strong>
        </div>
        <div className="receipt-card__row">
          <span>Нарахування</span>
          <strong className="positive-value">+120 бонусів</strong>
        </div>
        <div className="receipt-card__row">
          <span>Списати зараз</span>
          <strong>400 бонусів</strong>
        </div>
        <div className="receipt-card__row receipt-card__row--total">
          <span>До сплати грошима</span>
          <strong>2 000,00 ₴</strong>
        </div>
      </Card>
      <Card tone="soft" className="confirmation-safety">
        <ShieldCheck size={24} />
        <p>
          Операцію буде захищено від повторного проведення. Ви одразу побачите
          оновлений бонусний баланс.
        </p>
      </Card>
      <div className="confirmation-actions">
        <PrimaryButton onClick={() => navigate("tourist", "review")} icon={<Check size={22} />}>
          Підтвердити й продовжити
        </PrimaryButton>
        <button className="button button--danger-ghost" type="button">
          Відхилити
        </button>
      </div>
    </div>
  );
}

function ReviewScreen() {
  const [rating, setRating] = useState(5);
  const [selected, setSelected] = useState(["Кухня", "Обслуговування"]);
  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  return (
    <div className="tourist-screen">
      <MobileTopBar title="Ваш відгук" subtitle="Грибова хата" back />
      <Card tone="lime" className="verified-event-card">
        <BadgeCheck size={26} />
        <div>
          <strong>Візит підтверджено</strong>
          <p>Покупка #TRX‑24819 · сьогодні о 14:28</p>
        </div>
      </Card>
      <section className="review-heading">
        <span className="review-place-logo">
          <Utensils size={28} />
        </span>
        <h1>Як вам «Грибова хата»?</h1>
        <p>Відгук буде позначено як перевірений.</p>
      </section>
      <div className="rating-picker">
        {[1, 2, 3, 4, 5].map((value) => (
          <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} зірок`}>
            <Star size={38} fill={value <= rating ? "currentColor" : "none"} className={value <= rating ? "is-active" : ""} />
          </button>
        ))}
        <strong>{rating === 5 ? "Чудово!" : rating >= 4 ? "Добре" : "Можна краще"}</strong>
      </div>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Що сподобалося?</h2>
        </div>
        <div className="review-tags">
          {["Кухня", "Обслуговування", "Атмосфера", "Швидкість", "Ціна", "Для дітей"].map((item) => (
            <button
              key={item}
              type="button"
              className={selected.includes(item) ? "is-active" : ""}
              onClick={() => toggle(item)}
            >
              {selected.includes(item) ? <Check size={17} /> : <Plus size={17} />}
              {item}
            </button>
          ))}
        </div>
      </section>
      <label className="textarea-field">
        <span>Розкажіть детальніше</span>
        <textarea defaultValue="Дуже смачні банош і грибна юшка. Привітний персонал та чудовий вид з тераси." />
        <small>96 / 1000</small>
      </label>
      <button className="photo-upload" type="button">
        <Camera size={24} />
        <span>
          <strong>Додати фото</strong>
          <small>До 5 зображень</small>
        </span>
        <Plus size={22} />
      </button>
      <PrimaryButton icon={<Send size={20} />}>Опублікувати відгук</PrimaryButton>
    </div>
  );
}

function EmergencyScreen() {
  const contacts = [
    { title: "Єдиний номер допомоги", subtitle: "Поліція · швидка · рятувальники", value: "112", icon: Cross, tone: "red" as const },
    { title: "Швидка допомога", subtitle: "Цілодобово", value: "103", icon: Hospital, tone: "red" as const },
    { title: "Гірські рятувальники", subtitle: "Яремче, найближчий пост", value: "+380 67 342 18 68", icon: MountainSnow, tone: "orange" as const },
    { title: "Приватний лікар", subtitle: "До 20 хв · партнер", value: "Подзвонити", icon: UserRound, tone: "blue" as const },
    { title: "Евакуатор / СТО", subtitle: "Татарів · 24/7", value: "Подзвонити", icon: CarFront, tone: "neutral" as const },
  ];
  return (
    <div className="tourist-screen emergency-screen">
      <MobileTopBar title="Халепа?" subtitle="Допомога поруч" back />
      <section className="emergency-hero">
        <span>
          <LifeBuoy size={32} />
        </span>
        <div>
          <p className="eyebrow">Не хвилюйтеся</p>
          <h1>Знайдемо допомогу</h1>
          <p>Екстрені й перевірені локальні контакти для вашої точки.</p>
        </div>
      </section>
      <button className="location-share" type="button">
        <span>
          <LocateFixed size={25} />
        </span>
        <div>
          <strong>Поділитися геолокацією</strong>
          <small>Надішлемо координати обраній службі</small>
        </div>
        <Send size={22} />
      </button>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Екстрені контакти</h2>
        </div>
        <div className="emergency-list">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <button type="button" key={contact.title}>
                <span className={`emergency-icon emergency-icon--${contact.tone}`}>
                  <Icon size={23} />
                </span>
                <div>
                  <strong>{contact.title}</strong>
                  <small>{contact.subtitle}</small>
                </div>
                <span className="emergency-value">{contact.value}</span>
              </button>
            );
          })}
        </div>
      </section>
      <Card tone="soft" className="emergency-note">
        <Info size={22} />
        <p>Контакти перевірено регіональним адміністратором 14 липня 2026.</p>
      </Card>
    </div>
  );
}

function ProfileScreen({ navigate }: { navigate: Navigate }) {
  return (
    <div className="tourist-screen">
      <MobileTopBar title="Профіль" subtitle="Налаштування" />
      <section className="profile-card">
        <Avatar initials="АМ" tone="green" size="large" />
        <div>
          <h1>Андрій Мазка</h1>
          <p>@andrii_travel · Telegram</p>
          <StatusBadge tone="green">
            <BadgeCheck size={16} /> Профіль підтверджено
          </StatusBadge>
        </div>
        <IconButton label="Редагувати">
          <Settings2 size={22} />
        </IconButton>
      </section>
      <div className="profile-stats">
        <Card>
          <strong>12</strong>
          <span>місць</span>
        </Card>
        <Card>
          <strong>4</strong>
          <span>бронювання</span>
        </Card>
        <Card>
          <strong>1 280</strong>
          <span>бонусів</span>
        </Card>
      </div>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Мій профіль</h2>
        </div>
        <div className="list-card">
          <RowLink icon={<Heart size={22} />} title="Обране" subtitle="12 збережених місць" leadingTone="red" />
          <RowLink icon={<CalendarDays size={22} />} title="Мої бронювання" subtitle="1 майбутнє · 3 завершені" leadingTone="blue" />
          <RowLink icon={<ReceiptText size={22} />} title="Історія активності" subtitle="Покупки та бонуси" leadingTone="green" />
          <RowLink icon={<MessageCircle size={22} />} title="Мої відгуки" subtitle="Оцінки та відповіді закладів" leadingTone="lime" onClick={() => navigate("tourist", "review")} />
        </div>
      </section>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Налаштування</h2>
        </div>
        <div className="list-card">
          <RowLink icon={<Languages size={22} />} title="Мова" value="Українська" leadingTone="blue" />
          <RowLink icon={<Bell size={22} />} title="Сповіщення" subtitle="Сервісні увімкнено" leadingTone="orange" />
          <RowLink icon={<UsersRound size={22} />} title="Спільнота мандрівників" subtitle="Події, маршрути та локальні новини" leadingTone="lime" onClick={() => navigate("tourist", "community")} />
          <RowLink icon={<ShieldCheck size={22} />} title="Приватність і дані" subtitle="Consent, експорт, видалення" leadingTone="green" />
        </div>
      </section>
      <button className="logout-button" type="button">
        <LogOut size={20} /> Вийти з профілю
      </button>
    </div>
  );
}

function CommunityScreen() {
  return (
    <div className="tourist-screen community-screen">
      <MobileTopBar title="Спільнота" subtitle="Татарів · Яремче" back />
      <section className="community-hero">
        <div className="community-hero__avatars">
          <Avatar initials="О" tone="green" />
          <Avatar initials="М" tone="lime" />
          <Avatar initials="І" tone="orange" />
          <Avatar initials="+" tone="blue" />
        </div>
        <StatusBadge tone="lime">2 840 мандрівників</StatusBadge>
        <h1>Карпати без зайвого шуму</h1>
        <p>
          Актуальні маршрути, погода, події та нові місця від локальної
          редакції.
        </p>
        <PrimaryButton icon={<ExternalLink size={20} />}>
          Відкрити Telegram-канал
        </PrimaryButton>
      </section>
      <section className="mobile-section">
        <div className="mobile-section__heading">
          <h2>Що ви отримаєте</h2>
        </div>
        <div className="community-benefits">
          <div>
            <span>
              <SunMedium size={23} />
            </span>
            <div>
              <strong>Погода і стан маршрутів</strong>
              <p>Короткі локальні оновлення без спаму.</p>
            </div>
          </div>
          <div>
            <span>
              <TentTree size={23} />
            </span>
            <div>
              <strong>Нові місця й добірки</strong>
              <p>Тільки перевірені редакцією рекомендації.</p>
            </div>
          </div>
          <div>
            <span>
              <CircleHelp size={23} />
            </span>
            <div>
              <strong>Підтримка в Telegram</strong>
              <p>Сервісні питання окремо від маркетингу.</p>
            </div>
          </div>
        </div>
      </section>
      <Card tone="soft" className="consent-card">
        <div>
          <ShieldCheck size={24} />
          <strong>Керування згодами</strong>
        </div>
        <Toggle checked label="Сервісні повідомлення" />
        <Toggle checked={false} label="Добірки та пропозиції" />
        <p>Відписатися можна в будь-який момент у профілі.</p>
      </Card>
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
      return <WelcomeScreen navigate={navigate} />;
    case "home":
      return <HomeScreen navigate={navigate} />;
    case "about":
      return <AboutScreen />;
    case "catalog":
      return <CatalogScreen navigate={navigate} />;
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
