# Цифровая визитка — GraphQL API

Тестовое задание: backend, который рассказывает обо мне (Михаил Черепанов, fullstack-разработчик) через GraphQL. Профиль, навыки, опыт работы и проекты можно запросить в Apollo Sandbox.

Демо: https://cv-graphql-api.onrender.com/graphql
Сервис на бесплатном тарифе Render и засыпает без запросов, поэтому первый запрос может идти около минуты.

Стек: TypeScript, Node.js 20, NestJS 11, GraphQL (Apollo Server 5, code-first), Prisma 6, PostgreSQL 16, Docker.

## Запуск

```bash
docker compose up --build
```

После старта откройте http://localhost:3000/graphql. Контейнер сам применяет миграции, заполняет базу и запускает API.

Запрос из задания работает как есть. Полный запрос со всеми полями:

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
      period
      isCurrent
      durationMonths
      achievements { text }
    }
    projects { name url repositoryUrl technologies }
  }
}
```

Навыки можно отфильтровать: `profile { skills(category: BACKEND) { name } }`.

Тесты: `npm ci && npx prisma generate && npm test`.

Без Docker для API (база всё равно нужна):

```bash
cp .env.example .env
docker compose up -d db
npm ci
npm run db:setup
npm run start:dev
```

Базовые образы берутся с `mirror.gcr.io` — это зеркало Docker Hub от Google. Я перешёл на него, когда Docker Hub у меня не отвечал при сборке. Образы те же самые официальные `node` и `postgres`.

## Структура

```
src/
  config/        переменные окружения; без DATABASE_URL приложение не стартует
  prisma/        PrismaService
  graphql/       контекст запроса и DataLoader'ы
  health/        /health и редирект с / на /graphql
  modules/
    profile/     resolver, service, repository, модели
    experience/  resolver, service, repository, модели
    skill/       service, repository, модели
    project/     repository, модели
prisma/
  schema.prisma, migrations/   схема и миграции
  seed-data.ts                 мои данные
  seed.ts                      заполнение базы
```

В каждом модуле три слоя. Резолвер только связывает поля GraphQL с сервисом или loader'ом. Сервис содержит логику: какой профиль отдать по умолчанию, как сгруппировать навыки, как посчитать и отформатировать период работы. Он не знает ни про GraphQL, ни про SQL, поэтому его легко тестировать. Репозиторий — единственное место, где есть запросы к Prisma.

У `project` нет сервиса, потому что логики над проектами нет, и сервис просто пересылал бы вызовы в репозиторий.

Схему GraphQL я описываю в коде (code-first): она генерируется из TypeScript-классов, так что типы и схема не расходятся. Сгенерированная схема лежит в `schema.gql`.

## Вложенные данные без N+1

Это главное, на что я обращал внимание. Если грузить связи в лоб, запрос `experience { achievements }` делает один запрос за местами работы и ещё по одному за достижениями каждого места.

Поэтому все связи (`links`, `skills`, `experience`, `achievements`, `projects`) резолвятся через `@ResolveField` и DataLoader. Loader собирает id со всего уровня запроса и делает один `WHERE ... IN (...)`. Общая логика «один ко многим» вынесена в `createGroupedLoader`, на него есть тест.

В итоге полный запрос выше — это 6 SQL-запросов, по одному на таблицу, сколько бы ни было мест работы. Достижения всех пяти мест работы приходят одним запросом. Проверить можно так:

```bash
PRISMA_LOG_QUERIES=true docker compose up --build
```

(в PowerShell: `$env:PRISMA_LOG_QUERIES="true"; docker compose up --build`)

Loader'ы создаются заново на каждый запрос, чтобы кэш не жил дольше одного запроса и не устаревал. Внутри запроса кэш как раз полезен: `skills` и `skillGroups` используют один loader, и навыки грузятся один раз.

`include` в Prisma я не использовал: он загружает все связи, даже если клиент попросил только имя. С DataLoader загружается ровно то, что есть в запросе.

## База данных

PostgreSQL, таблицы: `profiles`, `links`, `skills`, `experiences`, `achievements`, `projects`.

- Достижения — отдельная таблица, а не массив: у них свой порядок, и к ним можно добавить поля вроде метрики или ссылки. Технологии проекта — обычный `TEXT[]`, это просто список для отображения.
- Даты работы хранятся как `DATE` с точностью до месяца. Текст периода («Январь 2025 — Сентябрь 2025») и длительность в месяцах считаются в сервисе: длительность текущей работы растёт каждый месяц, хранить её нельзя.
- Порядок вывода задаёт `sort_order`, под запросы loader'ов есть индексы `(profile_id, sort_order)`.
- Все связи с `ON DELETE CASCADE`, на этом построен seed.
- Можно хранить несколько профилей и запрашивать их по `slug`. Без аргумента отдаётся мой.

## Подготовка базы при старте

`docker-entrypoint.sh` делает три шага:

1. `prisma migrate deploy` применяет миграции из репозитория. `db push` я не использую: у него нет истории изменений и он может удалить данные.
2. Seed в одной транзакции удаляет мой профиль (связанные записи удаляются каскадно) и создаёт его заново из `seed-data.ts`. Поэтому перезапуск не создаёт дублей, а чтобы обновить резюме, достаточно поправить файл и перезапустить контейнер. Если что-то упадёт, транзакция откатится и наполовину заполненного профиля не будет. Advisory lock не даёт двум инстансам запустить seed одновременно.
3. `exec node dist/src/main.js` — через `exec`, чтобы Node получал SIGTERM напрямую и корректно закрывал соединение с базой.

Ссылки на GitHub, репозиторий и демо задаются переменными `PROFILE_GITHUB_URL`, `PROJECT_REPOSITORY_URL`, `PROJECT_PUBLIC_URL`.

## Docker и деплой

Dockerfile двухэтапный: в итоговый образ попадают только собранный код, production-зависимости и миграции. Процесс работает не от root. API в docker-compose ждёт, пока Postgres пройдёт healthcheck. `/health` проверяет соединение с базой, его используют Docker и Render.

Для Render в репозитории есть `render.yaml`: New → Blueprint создаёт базу и сервис и сам передаёт `DATABASE_URL`.

## Что бы я добавил дальше

- e2e-тесты на реальном Postgres (Testcontainers), в том числе на число SQL-запросов;
- ограничение глубины и сложности запросов, если в схеме появятся циклические связи;
- мутации для редактирования профиля с авторизацией.
