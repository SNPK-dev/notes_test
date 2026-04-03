## Why

Нужен архитектурный baseline для тестового Notes SPA на Nuxt 4, чтобы дальнейшая реализация CRUD, редактора заметок и history-based undo/redo строилась поверх устойчивой структуры, а не напрямую в UI-слое. Этот change фиксирует границы между domain, stores, repositories и UI, а также задаёт минимальный foundation для дальнейших changes.

## What Changes

- Подготовить foundation приложения на Nuxt 4 с TypeScript strict, Vue 3 Composition API, Pinia и SCSS.
- Зафиксировать app shell и routing skeleton для двух экранов: списка заметок и экрана создания/редактирования заметки.
- Ввести domain-модели Note и Todo, а также границы между persisted state и transient editor state.
- Ввести persistence-слой через repository abstraction с реализацией на localStorage без прямого доступа к storage из UI-компонентов.
- Подготовить базовую modal infrastructure для подтверждений вместо native alert/confirm.
- Подготовить набор переиспользуемых base UI components и SCSS foundation для дальнейшей реализации интерфейса.
- Зафиксировать SSR-safe ограничения на работу с browser-only API.
- Явно ограничить scope: в change не входят полный CRUD заметок, полноценный editor workflow, undo/redo реализация, backend, синхронизация между устройствами, rich-text, вложения, теги, поиск и offline-first сценарии.

## Capabilities

### New Capabilities
- `notes-app-foundation`: приложение получает каркас двухстраничного Notes SPA с базовой архитектурой, маршрутизацией и UI foundation.
- `notes-persistence`: приложение получает persistence-контракт для хранения заметок через repository abstraction с localStorage-реализацией, пригодной для дальнейшей замены на REST API.
- `notes-ui-foundation`: приложение получает modal infrastructure и переиспользуемые базовые UI-компоненты для дальнейшей реализации пользовательских сценариев.

### Modified Capabilities
- Нет.

## Impact

- Будут затронуты структура Nuxt-приложения, маршруты, Pinia stores, domain-модели, repository-слой, base UI-компоненты и SCSS-слой.
- Будут зафиксированы границы между persisted notes state и transient editor state, что нужно для последующей реализации cancel/undo/redo.
- Будет подготовлена архитектура, совместимая с SSR-safe ограничениями и дальнейшей заменой localStorage на API.