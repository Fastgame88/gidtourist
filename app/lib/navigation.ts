export type RoleKey =
  | "tourist"
  | "partner"
  | "ambassador"
  | "regional"
  | "admin";

export type ScreenDefinition = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  role: RoleKey;
};

export const roles: Array<{
  key: RoleKey;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    key: "tourist",
    label: "Турист",
    shortLabel: "Турист",
    description: "Telegram Mini App і ключові сценарії мандрівника",
  },
  {
    key: "partner",
    label: "Партнер",
    shortLabel: "Партнер",
    description: "Власник, менеджер і працівник / касир",
  },
  {
    key: "ambassador",
    label: "Амбасадор",
    shortLabel: "Амбасадор",
    description: "Залучення, кампанії та статус винагород",
  },
  {
    key: "regional",
    label: "Регіональний адмін",
    shortLabel: "Регіон",
    description: "Партнери, контент та статистика свого регіону",
  },
  {
    key: "admin",
    label: "Головна адмінка",
    shortLabel: "Адмін",
    description: "Модерація, QR, фінанси, аудит і керування системою",
  },
];

export const screens: ScreenDefinition[] = [
  {
    id: "C01",
    slug: "welcome",
    title: "QR welcome / контекст входу",
    shortTitle: "QR welcome",
    description: "Джерело QR, регіон, точка входу й продовження",
    role: "tourist",
  },
  {
    id: "C02",
    slug: "home",
    title: "Головний екран туриста",
    shortTitle: "Головна",
    description: "Вісім основних категорій і контекст готелю",
    role: "tourist",
  },
  {
    id: "C03",
    slug: "about",
    title: "Про заклад",
    shortTitle: "Про заклад",
    description: "Правила, Wi‑Fi, послуги, контакти й запити гостя",
    role: "tourist",
  },
  {
    id: "C04",
    slug: "catalog",
    title: "Категорія / пошук",
    shortTitle: "Каталог",
    description: "Пошук, фільтри, сортування й прозоре маркування",
    role: "tourist",
  },
  {
    id: "C05",
    slug: "nearby",
    title: "Карта / що поруч",
    shortTitle: "Що поруч",
    description: "Карта та список місць у радіусі базової точки",
    role: "tourist",
  },
  {
    id: "C06",
    slug: "place",
    title: "Картка закладу / локації",
    shortTitle: "Картка місця",
    description: "Опис, атрибути, рейтинг, маршрут і бонусні умови",
    role: "tourist",
  },
  {
    id: "C07",
    slug: "available",
    title: "Доступно зараз",
    shortTitle: "Доступно зараз",
    description: "Лише реальні вільні ресурси та актуальні слоти",
    role: "tourist",
  },
  {
    id: "C08",
    slug: "booking",
    title: "Бронювання",
    shortTitle: "Бронювання",
    description: "Дата, ресурс, вільний слот, контакт і підтвердження",
    role: "tourist",
  },
  {
    id: "C09",
    slug: "plan",
    title: "Мій план",
    shortTitle: "Мій план",
    description: "Готові сценарії відпочинку на 1–5 днів",
    role: "tourist",
  },
  {
    id: "C10",
    slug: "wallet",
    title: "Бонусний гаманець",
    shortTitle: "Бонуси",
    description: "Баланс, доступні й очікувані бонуси, історія та строк дії",
    role: "tourist",
  },
  {
    id: "C11",
    slug: "qr",
    title: "Мій QR",
    shortTitle: "Мій QR",
    description: "Одноразовий токен і таймер дії для операції",
    role: "tourist",
  },
  {
    id: "C12",
    slug: "purchase-confirmation",
    title: "Підтвердження QR-операції",
    shortTitle: "Підтвердження",
    description: "Партнер, сума, бонуси й явне підтвердження клієнтом",
    role: "tourist",
  },
  {
    id: "C13",
    slug: "review",
    title: "Перевірений відгук",
    shortTitle: "Відгук",
    description: "Оцінка після підтвердженої транзакції або бронювання",
    role: "tourist",
  },
  {
    id: "C14A",
    slug: "transfer",
    title: "Трансфер",
    shortTitle: "Трансфер",
    description: "Перевірені водії, популярні напрямки та допомога рецепції",
    role: "tourist",
  },
  {
    id: "C14",
    slug: "emergency",
    title: "Халепа?",
    shortTitle: "Халепа?",
    description: "Екстрені та локальні контакти, геолокація й допомога",
    role: "tourist",
  },
  {
    id: "C15",
    slug: "profile",
    title: "Профіль",
    shortTitle: "Профіль",
    description: "Мова, телефон за згодою, приватність і налаштування",
    role: "tourist",
  },
  {
    id: "C16",
    slug: "community",
    title: "Telegram-спільнота",
    shortTitle: "Спільнота",
    description: "Регіональний канал, підтримка та згода на повідомлення",
    role: "tourist",
  },

  {
    id: "P01",
    slug: "partner-dashboard",
    title: "Партнерський dashboard",
    shortTitle: "Dashboard",
    description: "Метрики, бронювання, баланс, рейтинг і швидкі дії",
    role: "partner",
  },
  {
    id: "P02",
    slug: "scanner",
    title: "Сканер QR клієнта",
    shortTitle: "Сканер QR",
    description: "Нативне сканування й перевірка короткоживучого токена",
    role: "partner",
  },
  {
    id: "P03",
    slug: "new-operation",
    title: "Нова операція",
    shortTitle: "Нова операція",
    description: "Сума, бонуси, комісія та запит підтвердження клієнту",
    role: "partner",
  },
  {
    id: "P04",
    slug: "calendar",
    title: "Календар бронювань",
    shortTitle: "Календар",
    description: "Ресурси, слоти, ручні записи та контроль конфліктів",
    role: "partner",
  },
  {
    id: "P05",
    slug: "booking-details",
    title: "Картка бронювання",
    shortTitle: "Картка бронювання",
    description: "Клієнт, ресурс, статус, контакт, перенесення й скасування",
    role: "partner",
  },
  {
    id: "P06",
    slug: "place-editor",
    title: "Редактор закладу",
    shortTitle: "Редактор закладу",
    description: "Шаблон, контент, фото, послуги, графік і ресурси",
    role: "partner",
  },
  {
    id: "P07",
    slug: "reviews-offers",
    title: "Відгуки й акції",
    shortTitle: "Відгуки й акції",
    description: "Відповіді, скарги, промо та вільні слоти",
    role: "partner",
  },
  {
    id: "P08",
    slug: "partner-finance",
    title: "Фінанси партнера",
    shortTitle: "Фінанси",
    description: "Statement, борг, компенсації, виплати й період звіту",
    role: "partner",
  },

  {
    id: "A01",
    slug: "ambassador-dashboard",
    title: "Кабінет амбасадора",
    shortTitle: "Dashboard",
    description: "QR, посилання, валідні залучення і винагорода",
    role: "ambassador",
  },
  {
    id: "A02",
    slug: "ambassador-campaigns",
    title: "Кампанії амбасадора",
    shortTitle: "Кампанії",
    description: "First-touch атрибуція, джерела і статуси винагород",
    role: "ambassador",
  },

  {
    id: "R01",
    slug: "regional-dashboard",
    title: "Регіональна адмінка",
    shortTitle: "Dashboard регіону",
    description: "Локальна статистика, партнери, QR і стан модерації",
    role: "regional",
  },
  {
    id: "R02",
    slug: "regional-partners",
    title: "Партнери регіону",
    shortTitle: "Партнери регіону",
    description: "Модерація й керування лише у дозволеному регіоні",
    role: "regional",
  },
  {
    id: "R03",
    slug: "regional-content",
    title: "Локальний контент",
    shortTitle: "Контент регіону",
    description: "Категорії, добірки, маршрути та актуальність даних",
    role: "regional",
  },

  {
    id: "AD01",
    slug: "admin-dashboard",
    title: "Головна адмінка",
    shortTitle: "Admin dashboard",
    description: "Воронка, регіони, ризики та стан системи",
    role: "admin",
  },
  {
    id: "AD02",
    slug: "partner-moderation",
    title: "Модерація партнерів",
    shortTitle: "Модерація партнерів",
    description: "Approve, reject, return та повна історія рішення",
    role: "admin",
  },
  {
    id: "AD03",
    slug: "location-editor",
    title: "Редактор локації",
    shortTitle: "Редактор локації",
    description: "Контент, категорії, теги, геодані та статус публікації",
    role: "admin",
  },
  {
    id: "AD04",
    slug: "qr-analytics",
    title: "QR-аналітика",
    shortTitle: "QR-аналітика",
    description: "Точки входу, кампанії, воронка, деактивація й перевипуск",
    role: "admin",
  },
  {
    id: "AD05",
    slug: "ledger",
    title: "Фінансовий ledger",
    shortTitle: "Ledger",
    description: "Незмінні записи, сторнування й взаєморозрахунки",
    role: "admin",
  },
  {
    id: "AD06",
    slug: "review-moderation",
    title: "Модерація відгуків",
    shortTitle: "Модерація відгуків",
    description: "Скарги, докази, рішення й апеляції",
    role: "admin",
  },
  {
    id: "AD07",
    slug: "audit-log",
    title: "Журнал дій",
    shortTitle: "Audit log",
    description: "Хто, що, коли, old/new values, сесія та результат",
    role: "admin",
  },
];

export const screensForRole = (role: RoleKey) =>
  screens.filter((screen) => screen.role === role);

export const defaultScreenForRole = (role: RoleKey) =>
  screensForRole(role)[0]?.slug ?? "welcome";

export const getScreen = (role: RoleKey, slug: string) =>
  screens.find((screen) => screen.role === role && screen.slug === slug) ??
  screens.find(
    (screen) =>
      screen.role === role && screen.slug === defaultScreenForRole(role),
  ) ??
  screens[0];
