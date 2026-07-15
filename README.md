# Гід туриста — етап 1

Клікабельний дизайн-прототип Telegram Mini App, партнерського кабінету,
кабінету амбасадора, регіональної та головної адмінок. Репозиторій також
містить окремий стартовий backend і конфігурацію двох Railway-сервісів.

## Що реалізовано

- 36 продуктових екранів із перемиканням ролей;
- 16 екранів туриста у mobile-first форматі Telegram Mini App;
- 8 екранів партнера: dashboard, QR, операція, календар, редактор і фінанси;
- 2 екрани амбасадора;
- 3 екрани регіонального адміністратора;
- 7 екранів головної адмінки;
- окремі екрани структури: карта екранів, ролі та ключові сценарії;
- біло-зелена адаптивна дизайн-система;
- NestJS backend із healthcheck та описом структури етапу;
- Railway Config as Code для frontend і backend;
- демонстраційні дані без бойових транзакцій.

## Структура

```text
.
├── app/                    # frontend і клікабельний прототип
│   ├── api/health/         # healthcheck frontend-сервісу
│   ├── components/         # оболонка, UI та екрани ролей
│   └── lib/                # карта ролей і екранів
├── backend/                # окремий NestJS сервіс
│   ├── src/modules/health/ # healthcheck
│   └── src/modules/project/# структура етапу, ролі й модулі
├── docs/                   # архітектура, приймання та Railway
├── Dockerfile              # production-образ frontend
├── railway.toml            # frontend service config
├── backend/Dockerfile      # production-образ backend
└── backend/railway.toml    # backend service config
```

## Локальний запуск

Потрібен Node.js `>=22.13.0`.

Frontend:

```bash
npm install
npm run dev
```

Локальна production-збірка:

```bash
npm run build:railway
npm run start:railway
```

Backend в іншому терміналі:

```bash
cd backend
npm install
npm run start:dev
```

За замовчуванням frontend відкривається на `http://localhost:3000`, а backend —
на `http://localhost:3000`, тому для одночасного локального запуску задайте
backend інший порт, наприклад `PORT=3001 npm run start:dev`.

Перевірки:

```bash
npm run lint
npm run build
npm run build:railway
npm --prefix backend run build
npm --prefix backend test
```

## Railway

У Railway створіть два сервіси з одного GitHub-репозиторію:

1. `Frontend`: Root Directory `/`, Config File `/railway.toml`, Dockerfile `/Dockerfile`.
2. `Backend`: Root Directory `/backend`, Config File `/backend/railway.toml`.

Обидва сервіси збираються через явні Dockerfile з Node.js 22, тому Railway не
залежить від автоматичного визначення Node/npm у Railpack.

Після першого деплою згенеруйте публічні домени й додайте:

- у frontend: `NEXT_PUBLIC_API_URL=https://<backend-domain>/api/v1`;
- у backend: `ALLOWED_ORIGINS=https://<frontend-domain>`.

Повна інструкція: [docs/RAILWAY_DEPLOY.md](docs/RAILWAY_DEPLOY.md).

## Межі етапу 1

Екрани клікабельні, але дані демонстраційні. Реальна Telegram-авторизація,
карти, бронювання, QR-транзакції, бонуси, PostgreSQL, Redis і файлове сховище
підключаються в наступних етапах згідно з погодженим чеклістом.

## Документи

- [Карта екранів](docs/SCREEN_MAP.md)
- [Архітектура й ключові рішення](docs/ARCHITECTURE.md)
- [Критерії приймання етапу 1](docs/STAGE_1_ACCEPTANCE.md)
- [Відкриті рішення перед наступними етапами](docs/OPEN_DECISIONS.md)
- [Інструкція Railway](docs/RAILWAY_DEPLOY.md)
