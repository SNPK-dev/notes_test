# Notes SPA Foundation

Тестовое SPA-приложение на Nuxt 4 с двухстраничным flow: список заметок и editor page.

## Что Реализовано

- Nuxt 4 + Vue 3 + TypeScript
- Pinia как state manager
- SCSS для стилизации
- Две основные страницы: список заметок и редактор
- CRUD для заметок
- CRUD для списка задач внутри заметки
- Read-only preview карточки на главной
- Modal-only подтверждения без native `alert/confirm`
- Undo/redo в редакторе
- Защита от ухода со страницы редактора при несохранённых изменениях
- Persistence после reload через client-only repository abstraction
- Docker-сборка и запуск production-like окружения

## Быстрый Старт Для Проверки

Локально:

```bash
npm install
npm run dev
```

Приложение откроется на `http://localhost:3000`.

Через Docker:

```bash
npm run docker:build
docker compose up
```

## Команды Проверки

Полный технический прогон:

```bash
npm run check:lockfile
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run docker:build
```

## Локальный запуск

Установить зависимости:

```bash
npm install
```

Запустить dev server:

```bash
npm run dev
```

В проекте зафиксирован package manager:

```bash
npm@11.12.1
```

Production build:

```bash
npm run build
```

Type check:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Formatting check:

```bash
npm run format:check
```

Preview production build:

```bash
npm run preview
```

## Проверка foundation

Автоматическая verification-проверка foundation-сценариев persistence:

```bash
npm run test:foundation
```

Полный набор Vitest-проверок:

```bash
npm run test
```

Black-box Playwright проверки:

```bash
npm run test:e2e
```

## Docker

Собрать и запустить production-like контейнер:

```bash
docker compose up --build
```
