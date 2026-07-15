"use client";

import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  Check,
  CircleDollarSign,
  Compass,
  Database,
  FileCheck2,
  Fingerprint,
  Layers3,
  LockKeyhole,
  MapPinned,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import {
  Card,
  CardHeader,
  MetricCard,
  PageHeading,
  PrimaryButton,
  ProgressBar,
  StatusBadge,
} from "../prototype-ui";
import {
  roleCounts,
  roles,
  screens,
  screensForRole,
  type RoleKey,
} from "../../lib/prototype-data";

type Navigate = (role: RoleKey, slug: string) => void;

const accessRoles = [
  {
    role: "Гість",
    scope: "Публічний контент",
    rights: "Категорії, карта, пошук, екстрені контакти",
    limit: "Без бонусів, бронювань та історії",
    tone: "neutral" as const,
  },
  {
    role: "Користувач",
    scope: "Власний профіль",
    rights: "План, обране, бронювання, бонуси, QR, відгуки",
    limit: "Не підтверджує операцію самостійно",
    tone: "green" as const,
  },
  {
    role: "Власник партнера",
    scope: "Організація і заклади",
    rights: "Працівники, бронювання, транзакції, аналітика, фінанси",
    limit: "Не бачить дані інших партнерів",
    tone: "lime" as const,
  },
  {
    role: "Менеджер партнера",
    scope: "Дозволені заклади",
    rights: "Бронювання, графік, відгуки, акції",
    limit: "Без договорів і фінансових умов",
    tone: "blue" as const,
  },
  {
    role: "Працівник / касир",
    scope: "Заклад або зміна",
    rights: "Сканування QR, сума операції, дозволені операції",
    limit: "Без повного балансу та зайвих персональних даних",
    tone: "orange" as const,
  },
  {
    role: "Амбасадор",
    scope: "Власні кампанії",
    rights: "QR, посилання, залучення, статус винагород",
    limit: "Без даних конкретних покупок",
    tone: "green" as const,
  },
  {
    role: "Регіональний адмін",
    scope: "Один регіон",
    rights: "Партнери, контент, QR-точки, локальна статистика",
    limit: "Інші регіони закриті на рівні API",
    tone: "blue" as const,
  },
  {
    role: "Фінансовий оператор",
    scope: "Фінансовий модуль",
    rights: "Ledger, звіти, взаєморозрахунки, сторнування",
    limit: "Не редагує контент і рейтинги",
    tone: "lime" as const,
  },
  {
    role: "Модератор",
    scope: "Черги модерації",
    rights: "Партнери, відгуки, фото, скарги",
    limit: "Не змінює бонуси та фінанси",
    tone: "orange" as const,
  },
  {
    role: "Суперадмін",
    scope: "Уся платформа",
    rights: "Регіони, ролі, тарифи, шаблони, аудит",
    limit: "Ризикові дії — 2FA і підтвердження",
    tone: "green" as const,
  },
];

function ProjectOverview({ navigate }: { navigate: Navigate }) {
  return (
    <div className="screen-stack overview-screen">
      <section className="stage-hero">
        <div className="stage-hero__copy">
          <StatusBadge tone="lime" dot>
            Етап 1 · клікабельний прототип
          </StatusBadge>
          <h1>
            Туристичний сервіс, який починається з <em>контексту</em>
          </h1>
          <p>
            Єдина біло‑зелена дизайн-система для Telegram Mini App,
            партнерського кабінету, амбасадорів і двох рівнів адміністрування.
          </p>
          <div className="stage-hero__actions">
            <PrimaryButton onClick={() => navigate("tourist", "welcome")}>
              Переглянути шлях туриста
            </PrimaryButton>
            <button
              className="text-button text-button--light"
              type="button"
              onClick={() => navigate("overview", "screen-map")}
            >
              Відкрити карту екранів <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="stage-hero__visual" aria-hidden="true">
          <span className="orbit orbit--one" />
          <span className="orbit orbit--two" />
          <div className="hero-pin hero-pin--main">
            <Compass size={30} />
          </div>
          <div className="hero-pin hero-pin--hotel">
            <Building2 size={19} />
            <span>Готель</span>
          </div>
          <div className="hero-pin hero-pin--place">
            <MapPinned size={19} />
            <span>Поруч</span>
          </div>
          <div className="hero-pin hero-pin--bonus">
            <Sparkles size={19} />
            <span>+120</span>
          </div>
        </div>
      </section>

      <div className="metric-grid metric-grid--four">
        <MetricCard
          label="Екранів у прототипі"
          value={`${screens.length}`}
          delta="Усі основні ролі"
          icon={<Layers3 size={20} />}
        />
        <MetricCard
          label="Ролей у моделі"
          value="10"
          delta="RBAC + tenant scope"
          icon={<UsersRound size={20} />}
          tone="lime"
        />
        <MetricCard
          label="Ключових контурів"
          value="4"
          delta="QR, booking, bonus, ledger"
          icon={<Fingerprint size={20} />}
          tone="blue"
        />
        <MetricCard
          label="Готовність дизайну"
          value="100%"
          delta="Для погодження етапу"
          icon={<BadgeCheck size={20} />}
          tone="neutral"
        />
      </div>

      <div className="overview-module-grid">
        <Card className="overview-module-card">
          <span className="module-icon module-icon--green">
            <Compass size={23} />
          </span>
          <div>
            <p className="eyebrow">Telegram Mini App</p>
            <h2>Турист</h2>
            <p>
              QR-контекст, каталог, карта, місця, бронювання, план, бонуси та
              підтвердження операції.
            </p>
          </div>
          <div className="module-card__footer">
            <strong>{roleCounts.tourist} екранів</strong>
            <button type="button" onClick={() => navigate("tourist", "welcome")}>
              Переглянути <ArrowRight size={16} />
            </button>
          </div>
        </Card>
        <Card className="overview-module-card">
          <span className="module-icon module-icon--lime">
            <Building2 size={23} />
          </span>
          <div>
            <p className="eyebrow">Role-based workspace</p>
            <h2>Партнер</h2>
            <p>
              Dashboard, QR-операції, ресурси, календар, редактор закладу,
              відгуки та фінансовий statement.
            </p>
          </div>
          <div className="module-card__footer">
            <strong>{roleCounts.partner} екранів</strong>
            <button
              type="button"
              onClick={() => navigate("partner", "partner-dashboard")}
            >
              Переглянути <ArrowRight size={16} />
            </button>
          </div>
        </Card>
        <Card className="overview-module-card">
          <span className="module-icon module-icon--dark">
            <ShieldCheck size={23} />
          </span>
          <div>
            <p className="eyebrow">Контроль платформи</p>
            <h2>Адміністрування</h2>
            <p>
              Головна й регіональна адмінки, модерація, QR-аналітика,
              фінансовий ledger та audit log.
            </p>
          </div>
          <div className="module-card__footer">
            <strong>{roleCounts.admin + roleCounts.regional} екранів</strong>
            <button
              type="button"
              onClick={() => navigate("admin", "admin-dashboard")}
            >
              Переглянути <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      </div>

      <div className="two-column-grid two-column-grid--wide">
        <Card>
          <CardHeader
            title="Критерії приймання етапу"
            subtitle="Зафіксовано у структурі прототипу"
            action={<StatusBadge tone="green">7 / 7</StatusBadge>}
          />
          <div className="acceptance-list">
            {[
              "Карта екранів і переходів",
              "Структура ролей та рівнів доступу",
              "Модулі туриста, партнера, амбасадора й адміна",
              "QR-контекст і підтвердження клієнтом",
              "Бронювання кількох ресурсів без конфліктів",
              "Бонусні стани та незмінний фінансовий ledger",
              "Межі MVP і технічний старт для Railway",
            ].map((item) => (
              <div key={item}>
                <span>
                  <Check size={14} />
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card tone="soft">
          <CardHeader
            title="Межі першого етапу"
            subtitle="Дизайн і структура без бойових операцій"
          />
          <div className="scope-meter">
            <div>
              <strong>Дизайн і UX</strong>
              <ProgressBar value={100} />
            </div>
            <div>
              <strong>Структура frontend / backend</strong>
              <ProgressBar value={100} />
            </div>
            <div>
              <strong>Бойова бізнес-логіка</strong>
              <ProgressBar value={8} />
            </div>
          </div>
          <p className="scope-note">
            На цьому етапі дані демонстраційні. Реальні карти, бронювання,
            транзакції та фінансові зміни підключаються в наступних етапах.
          </p>
        </Card>
      </div>
    </div>
  );
}

function ScreenMap({ navigate }: { navigate: Navigate }) {
  const visibleRoles = roles.filter((role) => role.key !== "overview");

  return (
    <div className="screen-stack">
      <PageHeading
        eyebrow="Архітектура інтерфейсів"
        title="Карта екранів"
        description={`${screens.length - roleCounts.overview} продуктових екранів згруповано за сценаріями та рівнями доступу.`}
        action={<StatusBadge tone="green">Структуру погоджено</StatusBadge>}
      />
      <div className="screen-map-grid">
        {visibleRoles.map((role) => (
          <Card key={role.key} className="screen-map-column">
            <div className="screen-map-column__heading">
              <div>
                <p className="eyebrow">{roleCounts[role.key]} екранів</p>
                <h2>{role.label}</h2>
              </div>
              <span>{roleCounts[role.key]}</span>
            </div>
            <p className="screen-map-column__description">{role.description}</p>
            <div className="screen-map-list">
              {screensForRole(role.key).map((screen) => (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => navigate(role.key, screen.slug)}
                >
                  <span>{screen.id}</span>
                  <div>
                    <strong>{screen.shortTitle}</strong>
                    <small>{screen.description}</small>
                  </div>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RolesAccess() {
  return (
    <div className="screen-stack">
      <PageHeading
        eyebrow="RBAC + tenant scope"
        title="Ролі та права доступу"
        description="Права перевіряються не лише у меню, а й на backend-рівні: платформа → регіон → організація → заклад → ресурс."
        action={
          <div className="heading-pills">
            <StatusBadge tone="green">10 ролей</StatusBadge>
            <StatusBadge tone="blue">4 рівні scope</StatusBadge>
          </div>
        }
      />

      <Card tone="dark" className="access-principle">
        <div>
          <span>
            <LockKeyhole size={23} />
          </span>
          <div>
            <p className="eyebrow">Принцип найменших привілеїв</p>
            <h2>Користувач бачить тільки те, що потрібно для його сценарію</h2>
          </div>
        </div>
        <p>
          Будь-яка фінансова, рольова або модераційна дія фіксується в audit
          log. Для ризикових дій суперадміна передбачено 2FA і повторне
          підтвердження.
        </p>
      </Card>

      <div className="access-grid">
        {accessRoles.map((item) => (
          <Card key={item.role} className="access-card">
            <div className="access-card__top">
              <span className={`access-card__icon access-card__icon--${item.tone}`}>
                {item.role === "Суперадмін" ? (
                  <ShieldCheck size={20} />
                ) : item.role.includes("Фінансов") ? (
                  <CircleDollarSign size={20} />
                ) : item.role.includes("Амбасадор") ? (
                  <TicketCheck size={20} />
                ) : item.role.includes("Користувач") || item.role === "Гість" ? (
                  <Compass size={20} />
                ) : (
                  <UsersRound size={20} />
                )}
              </span>
              <StatusBadge tone={item.tone}>{item.scope}</StatusBadge>
            </div>
            <h2>{item.role}</h2>
            <div className="access-card__section">
              <strong>Може</strong>
              <p>{item.rights}</p>
            </div>
            <div className="access-card__section access-card__section--limit">
              <strong>Обмеження</strong>
              <p>{item.limit}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Ієрархія доступу партнера"
          subtitle="Один партнер може мати кілька закладів, працівників і ресурсів"
        />
        <div className="scope-flow">
          {[
            ["Організація", "Власник і договір", Building2],
            ["Заклад", "Менеджер і контент", MapPinned],
            ["Ресурс", "Календар і доступність", Layers3],
            ["Зміна / дія", "Касир і audit", Fingerprint],
          ].map(([title, description, Icon], index) => {
            const ScopeIcon = Icon as typeof Building2;
            return (
              <div key={title as string} className="scope-flow__item">
                <span>
                  <ScopeIcon size={21} />
                </span>
                <div>
                  <small>Рівень {index + 1}</small>
                  <strong>{title as string}</strong>
                  <p>{description as string}</p>
                </div>
                {index < 3 ? <ArrowRight size={18} /> : null}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function FlowCard({
  number,
  title,
  description,
  icon,
  tone,
  steps,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "green" | "lime" | "blue" | "orange";
  steps: Array<{ title: string; text: string }>;
}) {
  return (
    <Card className={`flow-card flow-card--${tone}`}>
      <div className="flow-card__heading">
        <span>{icon}</span>
        <div>
          <p className="eyebrow">Сценарій {number}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="flow-card__steps">
        {steps.map((step, index) => (
          <div key={step.title}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CoreFlows() {
  return (
    <div className="screen-stack">
      <PageHeading
        eyebrow="Погоджена продуктова логіка"
        title="Ключові сценарії MVP"
        description="Чотири контури спроєктовані так, щоб наступні етапи не вимагали зміни базової моделі даних."
        action={<StatusBadge tone="green">Готово до реалізації</StatusBadge>}
      />
      <div className="flow-grid">
        <FlowCard
          number="01"
          title="QR-контекст і операція"
          description="Статичний QR пояснює, звідки відкрито гід; динамічний QR клієнта підтверджує операцію."
          icon={<QrCode size={25} />}
          tone="green"
          steps={[
            { title: "Контекст", text: "QR точки визначає source, region і place." },
            { title: "Одноразовий токен", text: "Backend видає nonce на 30–60 секунд." },
            { title: "Quote", text: "Касир вводить суму, система рахує бонуси." },
            { title: "Підтвердження", text: "Клієнт бачить партнера й суму до запису." },
            { title: "Idempotency", text: "Повторне проведення тієї самої дії заблоковано." },
          ]}
        />
        <FlowCard
          number="02"
          title="Бронювання ресурсів"
          description="Кожен чан, номер, авто, стіл чи спеціаліст має власні правила й календар."
          icon={<BookOpenCheck size={25} />}
          tone="blue"
          steps={[
            { title: "Вибір послуги", text: "Клієнт обирає конкретний ресурс або тип." },
            { title: "Реальні слоти", text: "Доступність рахується з графіка, buffer і ручних записів." },
            { title: "Atomic hold", text: "Слот коротко резервується під час створення." },
            { title: "Статус", text: "new → pending_partner → confirmed / alternative." },
            { title: "Захист", text: "Унікальне обмеження блокує подвійне бронювання." },
          ]}
        />
        <FlowCard
          number="03"
          title="Бонусний гаманець"
          description="Баланс є проєкцією операцій, а не числом, яке можна вручну переписати."
          icon={<WalletCards size={25} />}
          tone="lime"
          steps={[
            { title: "Quote", text: "Правила фіксуються snapshot на момент покупки." },
            { title: "Pending", text: "Нарахування очікує виконання умов кампанії." },
            { title: "Available", text: "Бонуси стають доступними до строку expiry." },
            { title: "Reserved / spent", text: "Списання може бути частковим і лімітованим." },
            { title: "Reversed", text: "Повернення створює протилежний запис." },
          ]}
        />
        <FlowCard
          number="04"
          title="Ledger і сторнування"
          description="Фінансові записи незмінні; виправлення завжди додає нову операцію з посиланням на початкову."
          icon={<Database size={25} />}
          tone="orange"
          steps={[
            { title: "Immutable entry", text: "Дебет / кредит, партнер, працівник, час і snapshot." },
            { title: "Settlement", text: "Окремо видно борг партнера або платформи." },
            { title: "Запит сторно", text: "Причина, автор і початкова операція обов’язкові." },
            { title: "Нова проводка", text: "Сторно компенсує суму, комісію та бонуси." },
            { title: "Audit", text: "Old/new state і підтвердження зберігаються назавжди." },
          ]}
        />
      </div>

      <Card tone="soft" className="flow-guardrails">
        <CardHeader
          title="Незмінні правила, закладені в дизайн"
          subtitle="Ці принципи не залежать від фінальної юридичної моделі бонусів"
        />
        <div className="guardrail-grid">
          {[
            [Fingerprint, "initData перевіряє backend", "Клієнтським даним Telegram не довіряємо напряму."],
            [LockKeyhole, "QR не містить персональних даних", "Тільки підписаний токен, nonce та короткий expiry."],
            [Database, "Баланс не редагується вручну", "Значення завжди рахується з ledger entries."],
            [RotateCcw, "Повернення — окрема дія", "Початковий запис залишається незмінним."],
            [FileCheck2, "Відгук потребує eligibility", "Транзакція або завершене бронювання підтверджує візит."],
            [ShieldCheck, "Tenant isolation", "Регіон і партнер не отримують чужі дані через API."],
          ].map(([Icon, title, text]) => {
            const GuardIcon = Icon as typeof Fingerprint;
            return (
              <div key={title as string}>
                <span>
                  <GuardIcon size={19} />
                </span>
                <div>
                  <strong>{title as string}</strong>
                  <p>{text as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function OverviewScreen({
  slug,
  navigate,
}: {
  slug: string;
  navigate: Navigate;
}) {
  if (slug === "screen-map") return <ScreenMap navigate={navigate} />;
  if (slug === "roles-access") return <RolesAccess />;
  if (slug === "core-flows") return <CoreFlows />;
  return <ProjectOverview navigate={navigate} />;
}
