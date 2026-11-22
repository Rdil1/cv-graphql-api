# Цифровая визитка — GraphQL API

Backend-приложение, которое представляет меня (Михаил Черепанов, fullstack-разработчик) через GraphQL API с Apollo Sandbox.

**Стек:** TypeScript · Node.js 20 · NestJS 11 · GraphQL (Apollo Server 5, code-first) · Prisma 6 · PostgreSQL 16 · Docker

- Apollo Sandbox: `/graphql` (корень `/` перенаправляет туда же)
- Health check: `/health`
- Демо: `<ссылка после деплоя>`

---

## Быстрый старт

```bash
docker compose up --build
```

Откройте http://localhost:3000/graphql. При старте контейнер сам применяет миграции, заполняет БД и запускает API. Никаких ручных шагов не нужно.

Пример запроса:

```graphql
query {
  profile {
    name
    headline
    description
    links { kind label url }
    skillGroups { category skills { name } }
    experience {
      company
      position
      period          # «Январь 2025 — Сентябрь 2025»
      isCurrent
      durationMonths
      achievements { text }
    }
    projects { name url repositoryUrl technologies }
  }
}
```

Фильтр навыков по категории: `profile { skills(category: BACKEND) { name } }`.

### Локальная разработка без Docker для API

```bash
cp .env.example .env              # укажите DATABASE_URL
docker compose up -d db           # или свой PostgreSQL
npm ci
npm run db:setup                  # миграции + seed
npm run start:dev
npm test                          # unit-тесты
```

Полная схема API лежит в [`schema.gql`](./schema.gql).

---

## Архитектура

```
src/
├── main.ts, app.module.ts        композиция приложения, настройка GraphQL
├── config/                       типизированная конфигурация из env (fail-fast при ошибках)
├── prisma/                       PrismaService — единственная точка доступа к БД
├── graphql/
│   ├── graphql-context.ts        тип контекста запроса
│   └── loaders/                  DataLoader'ы (батчинг вложенных связей)
├── health/                       /health и редирект на Sandbox
└── modules/
    ├── profile/   models · repository · service · resolver
    ├── skill/     models · repository · service
    ├── experience/models · repository · service · resolver
    └── project/   models · repository
prisma/
├── schema.prisma                 модель данных
├── migrations/                   версионированные SQL-миграции
├── seed-data.ts                  мои данные (источник истины)
└── seed.ts                       идемпотентное заполнение БД
```

### Разделение ответственности

| Слой | Ответственность | Чего не делает |
|---|---|---|
| **Resolver** | Связывает GraphQL-поля с сервисами и loader'ами | Не обращается к Prisma, не содержит логики |
| **Service** | Бизнес-логика: профиль по умолчанию, группировка/фильтрация навыков, форматирование периода работы и его длительность | Не знает о GraphQL и SQL |
| **Repository** | Запросы к БД через Prisma, включая сортировку | Не содержит бизнес-правил |
| **Loaders** | Батчинг и кэширование загрузки связей в рамках одного запроса | — |

Модули создаются только там, где у них есть своя ответственность. Например, у `project` нет сервиса, потому что над проектами нет бизнес-логики. Пустой сервис-прокси добавил бы код без пользы.

### Почему code-first GraphQL

Схема генерируется из TypeScript-классов, поэтому типы резолверов и схемы не расходятся. Описания полей (`description`) попадают в схему и видны в Sandbox. Это документация API «из коробки».

---

## Вложенные данные и проблема N+1

GraphQL-модели содержат только скалярные поля. Связи (`links`, `skills`, `experience`, `achievements`, `projects`) резолвятся через `@ResolveField`, а данные для них грузятся через **DataLoader**:

- все ключи одного «уровня» запроса собираются и загружаются **одним** `WHERE ... IN (...)`;
- loader'ы создаются **на каждый запрос** (в GraphQL-контексте), поэтому кэш не протекает между запросами;
- общий хелпер `createGroupedLoader` реализует связь «один ко многим» и сохраняет порядок, заданный репозиторием.

Результат для полного запроса выше — **6 SQL-запросов при любом объёме данных**:

```
profile.findUnique
link.findMany        (1 key)
skill.findMany       (1 key)   ← общий для skills и skillGroups (кэш loader'а)
experience.findMany  (1 key)
project.findMany     (1 key)
achievement.findMany (5 keys)  ← достижения всех 5 мест работы одним запросом
```

Без DataLoader достижения потребовали бы отдельный запрос на каждое место работы.

Убедиться можно самостоятельно: `PRISMA_LOG_QUERIES=true docker compose up --build`. SQL-запросы будут видны в логах.

**Почему не `include` в Prisma.** Жадная загрузка всего графа тянет из БД данные, которые клиент не запрашивал. DataLoader загружает ровно те связи, которые есть в запросе, с постоянным числом запросов. Это сохраняет главное преимущество GraphQL.

---

## База данных

- **PostgreSQL** — надёжная реляционная БД с бесплатными managed-вариантами (Render, Railway, Neon).
- Связи `Profile → Link/Skill/Experience/Project` и `Experience → Achievement`, все с `ON DELETE CASCADE`.
- Достижения вынесены в отдельную таблицу, а не в массив. Это сущности со своим порядком, и к ним можно добавлять поля (метрики, ссылки).
- `technologies` у проекта — `TEXT[]`. Это простой атрибут для отображения, и отдельная таблица там избыточна.
- Индексы `(profile_id, sort_order)` / `(experience_id, sort_order)` покрывают и фильтр loader'а, и сортировку.
- `@@unique([profileId, name])` для навыков защищает от дублей.
- Даты работы хранятся как `DATE` (точность — месяц). Человекочитаемый период вычисляется в сервисе, а не хранится, чтобы не было рассинхронизации.
- Таблицы и колонки в `snake_case` через `@@map` / `@map`, в коде — `camelCase`.
- Схема рассчитана на несколько профилей (`profile(slug: ...)`). Без аргумента возвращается владелец визитки (`DEFAULT_PROFILE_SLUG`).

## Инициализация и заполнение

`docker-entrypoint.sh` при каждом старте выполняет:

1. `prisma migrate deploy` — применяет закоммиченные миграции. Используется именно этот вариант, а не `db push`: он воспроизводим и безопасен для production.
2. `node dist/prisma/seed.js` — **идемпотентный seed**. В одной транзакции профиль удаляется по `slug` (каскадно вместе со связями) и создаётся заново одним вложенным `create`. Данные в `seed-data.ts` — источник истины. После изменения резюме достаточно перезапустить контейнер. Транзакция гарантирует, что API никогда не увидит полузаполненный профиль. `pg_advisory_xact_lock` защищает от гонки при одновременном старте нескольких инстансов.
3. `exec node dist/src/main.js` — `exec` передаёт процессу сигналы для корректного завершения (`enableShutdownHooks`).

Необязательные ссылки (GitHub, репозиторий, публичный URL проекта) задаются через переменные окружения `PROFILE_GITHUB_URL`, `PROJECT_REPOSITORY_URL`, `PROJECT_PUBLIC_URL`.

## Docker

- Multi-stage build: в runtime-образ попадают только production-зависимости, собранный код и миграции.
- Процесс работает от непривилегированного пользователя `node`.
- `HEALTHCHECK` использует `/health`, который проверяет и соединение с БД.
- В `docker-compose.yml` API стартует только после готовности PostgreSQL (`depends_on: condition: service_healthy`).

## Деплой (Render)

В репозитории есть `render.yaml` (Blueprint): **New → Blueprint →** выбрать репозиторий. Render создаст PostgreSQL и Docker-сервис и сам передаст `DATABASE_URL`. Миграции и seed выполнятся при старте.

---

## Тесты

`npm test` запускает unit-тесты:

- форматирования и длительности периода работы (включая переход через год и текущую работу);
- группировки и фильтрации навыков;
- `createGroupedLoader`: проверяется, что N ключей дают **один** вызов БД и строки корректно раскладываются по ключам.

## Что можно добавить при развитии

- e2e-тесты на Testcontainers (реальный PostgreSQL) с проверкой числа SQL-запросов;
- ограничение глубины и сложности запросов (`graphql-depth-limit`) — актуально, если появятся циклические связи;
- кэширование ответа (данные меняются только при деплое);
- мутации для редактирования профиля с аутентификацией.
