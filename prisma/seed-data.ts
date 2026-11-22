import { LinkKind, Prisma, SkillCategory } from '@prisma/client';

const month = (year: number, monthNumber: number): Date =>
  new Date(Date.UTC(year, monthNumber - 1, 1));

const ordered = <T extends object>(items: T[]): (T & { sortOrder: number })[] =>
  items.map((item, index) => ({ ...item, sortOrder: index }));

const skills: Array<{ name: string; category: SkillCategory }> = [
  ...['TypeScript', 'JavaScript', 'Go', 'SQL', 'Python', 'C#'].map((name) => ({
    name,
    category: SkillCategory.LANGUAGE,
  })),
  ...['React', 'HTML5', 'CSS3', 'Telegram Mini Apps'].map((name) => ({
    name,
    category: SkillCategory.FRONTEND,
  })),
  ...[
    'Node.js',
    'NestJS',
    'GraphQL',
    'REST API',
    'Prisma',
    'LLM API',
    'Интеграция платёжных систем',
  ].map((name) => ({ name, category: SkillCategory.BACKEND })),
  ...['PostgreSQL', 'Проектирование БД'].map((name) => ({
    name,
    category: SkillCategory.DATABASE,
  })),
  ...['Git', 'Docker', 'VPS', 'Деплой'].map((name) => ({ name, category: SkillCategory.DEVOPS })),
  ...['Claude Code', 'Cursor'].map((name) => ({ name, category: SkillCategory.AI_TOOLS })),
  { name: 'Unity', category: SkillCategory.GAMEDEV },
];

export function buildProfileSeed(env: NodeJS.ProcessEnv = process.env): Prisma.ProfileCreateInput {
  const links: Array<{ kind: LinkKind; label: string; url: string }> = [
    { kind: LinkKind.TELEGRAM, label: 'Telegram', url: 'https://t.me/glaflame' },
    { kind: LinkKind.EMAIL, label: 'Email', url: 'mailto:mikhail.cherepanov12@gmail.com' },
    { kind: LinkKind.WEBSITE, label: 'ThinkDeep', url: 'https://thinkdeep.ru' },
  ];
  if (env.PROFILE_GITHUB_URL) {
    links.unshift({ kind: LinkKind.GITHUB, label: 'GitHub', url: env.PROFILE_GITHUB_URL });
  }

  return {
    slug: 'mikhail-cherepanov',
    name: 'Михаил Черепанов',
    headline: 'Fullstack-разработчик (React, Go, Node.js)',
    description:
      'Fullstack-разработчик: React на фронтенде, Go и JavaScript/TypeScript на бэкенде. ' +
      'Разработал и вывел в продакшен 4 продукта, в том числе AI-сервис со 100+ пользователями ' +
      'и платформу в Telegram Mini App с платёжными интеграциями. Сам настраиваю VPS, хостинг ' +
      'и деплой, проектирую базы данных. Использую AI-инструменты (Claude Code, Cursor) ' +
      'и проверяю результат тестами и запуском.',
    links: { create: ordered(links) },
    skills: { create: ordered(skills) },
    experiences: {
      create: [
        {
          company: 'ThinkDeep',
          companyDescription: 'AI-сервис для генерации статей',
          position: 'Fullstack-разработчик',
          startDate: month(2025, 11),
          endDate: null,
          achievements: {
            create: ordered([
              {
                text: 'Разработал фронтенд на React по пользовательским сценариям и бэкенд на Go.',
              },
              {
                text: 'Интегрировал LLM API: логика запросов, структурирование ответов модели, учёт и списание токенов.',
              },
              {
                text: 'Сократил промпты и контекст, добавил кэширование — стоимость генерации снизилась на 50%.',
              },
              { text: 'Развернул сервис на VPS, настроил хостинг и деплой.' },
              { text: 'Сервисом пользуются 100+ пользователей.' },
            ]),
          },
        },
        {
          company: 'NDA',
          companyDescription: 'iGaming-платформа в Telegram Mini App',
          position: 'Fullstack-разработчик',
          startDate: month(2025, 1),
          endDate: month(2025, 9),
          achievements: {
            create: ordered([
              {
                text: 'Разработал iGaming-платформу в Telegram Mini App с бэкендом на JavaScript и 10 мини-играми.',
              },
              { text: 'Самостоятельно спроектировал базу данных пользователей и балансов.' },
              { text: 'Реализовал серверную логику: балансы, ставки, выплаты, начисления.' },
              { text: 'Интегрировал платёжные модули для пополнения и вывода криптовалюты.' },
              { text: 'Реализовал партнёрскую систему с начислениями.' },
              {
                text: 'Работал в команде из 3 человек через Git с разработкой в ветках, развернул платформу на VPS.',
              },
            ]),
          },
        },
        {
          company: 'Durane',
          companyDescription: 'Мобильная игра в Google Play',
          position: 'Разработчик',
          startDate: month(2024, 5),
          endDate: month(2024, 12),
          achievements: {
            create: ordered([
              {
                text: 'В одиночку разработал игру на Unity и C#: механика, уровни, прогрессия, UI. Около 100 скачиваний.',
              },
              { text: 'Подключил рекламную монетизацию и аналитику.' },
              {
                text: 'Оптимизировал производительность под разные классы Android-устройств, выпускал релизы через Google Play Console.',
              },
            ]),
          },
        },
        {
          company: 'LuxeCare',
          companyDescription: 'Интернет-магазин',
          position: 'Веб-разработчик',
          startDate: month(2023, 9),
          endDate: month(2024, 5),
          achievements: {
            create: ordered([
              {
                text: 'Разработал интернет-магазин на HTML, CSS и JavaScript: каталог, карточки товаров, оформление заказа.',
              },
              { text: 'Настроил хостинг и деплой; магазин получил первые 20 заказов.' },
            ]),
          },
        },
        {
          company: 'Aquaheads',
          companyDescription: 'NFT-проект',
          position: 'Веб-разработчик',
          startDate: month(2022, 1),
          endDate: month(2022, 5),
          achievements: {
            create: ordered([
              {
                text: 'Разработал и поддерживал сайт проекта на HTML, CSS и JavaScript; проект достигал 200+ продаж (минтов) в день.',
              },
            ]),
          },
        },
      ],
    },
    projects: {
      create: ordered([
        {
          name: 'Цифровая визитка (GraphQL API)',
          description: 'Этот сервис: NestJS, GraphQL, Prisma, PostgreSQL, Docker.',
          url: env.PROJECT_PUBLIC_URL || null,
          repositoryUrl: env.PROJECT_REPOSITORY_URL || null,
          technologies: ['TypeScript', 'NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
        },
        {
          name: 'ThinkDeep',
          description: 'AI-сервис для генерации статей, 100+ пользователей.',
          url: 'https://thinkdeep.ru',
          repositoryUrl: null,
          technologies: ['React', 'Go', 'LLM API', 'VPS'],
        },
        {
          name: 'iGaming-платформа (Telegram Mini App)',
          description:
            'Платформа с 10 мини-играми, балансами, крипто-платежами и партнёрской программой. Код под NDA.',
          url: null,
          repositoryUrl: null,
          technologies: ['JavaScript', 'Telegram Mini Apps', 'SQL', 'VPS'],
        },
        {
          name: 'Durane',
          description: 'Мобильная игра для Android, опубликована в Google Play.',
          url: 'https://play.google.com/store/apps/details?id=com.Durane.TrafficJumble',
          repositoryUrl: null,
          technologies: ['Unity', 'C#'],
        },
        {
          name: 'LuxeCare',
          description: 'Интернет-магазин: каталог, карточки товаров, оформление заказа.',
          url: null,
          repositoryUrl: null,
          technologies: ['HTML5', 'CSS3', 'JavaScript'],
        },
        {
          name: 'Aquaheads',
          description: 'Сайт NFT-проекта, до 200+ минтов в день.',
          url: null,
          repositoryUrl: null,
          technologies: ['HTML5', 'CSS3', 'JavaScript'],
        },
      ]),
    },
  };
}
