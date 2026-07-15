# Завантаження на Railway

Проєкт має два незалежні Node.js сервіси в одному репозиторії.

## 1. Репозиторій

Створіть репозиторій на акаунті або в GitHub Organization замовника й
завантажте весь вміст архіву без `node_modules`, `dist` і локальних `.env`.

## 2. Railway project

1. Створіть порожній Railway project.
2. Додайте два сервіси: `Frontend` і `Backend`.
3. Підключіть обидва сервіси до одного GitHub-репозиторію.

## 3. Frontend service

- Root Directory: `/`
- Config File: `/railway.toml`
- Builder: Dockerfile
- Dockerfile: `/Dockerfile`
- Start: `node server.js` із Dockerfile
- Healthcheck: `/api/health`

Змінні:

```env
NEXT_PUBLIC_API_URL=https://BACKEND_DOMAIN/api/v1
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
```

## 4. Backend service

- Root Directory: `/backend`
- Config File: `/backend/railway.toml`
- Builder: Dockerfile
- Dockerfile: `/backend/Dockerfile`
- Start: `node dist/main.js` із Dockerfile
- Healthcheck: `/api/v1/health`

Змінні першого етапу:

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://FRONTEND_DOMAIN
```

Railway автоматично передає `PORT`; вручну фіксувати порт не потрібно.

## 5. Якщо Railway пише `npm: not found`

Це означає, що сервіс намагався виконати npm-команду до встановлення Node.js.
У поточній версії проєкту ця проблема усунена явними Dockerfile.

Після завантаження оновлених файлів перевірте в `Settings`:

1. frontend використовує Root Directory `/` і Config File `/railway.toml`;
2. backend використовує Root Directory `/backend` і Config File `/backend/railway.toml`;
3. у Build/Start Command немає старих ручних команд із попереднього деплою;
4. у новому build log є кроки `FROM node:22-alpine` та `npm ci` всередині Dockerfile.

Якщо всі файли проєкту лежать у вкладеній папці GitHub-репозиторію, Root
Directory треба вказати саме на цю папку, а не на `/`.

## 6. Домени та перевірка

1. Після першого деплою згенеруйте публічний домен для кожного сервісу.
2. Оновіть `NEXT_PUBLIC_API_URL` і `ALLOWED_ORIGINS` реальними доменами.
3. Запустіть redeploy обох сервісів.
4. Перевірте:
   - `https://FRONTEND_DOMAIN/api/health`;
   - `https://BACKEND_DOMAIN/api/v1/health`;
   - `https://BACKEND_DOMAIN/api/v1/project/stage-one`.

## 7. Наступні етапи

PostgreSQL, Redis, object storage і Telegram secrets додаються тільки тоді,
коли з’являється відповідний функціонал. Порожні значення з `.env.example` не
потрібно переносити у Railway до цього моменту.
