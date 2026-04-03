## 1. Каркас приложения и маршрутизация

- [x] 1.1 Подготовить Nuxt SPA baseline с TypeScript strict, Pinia, SCSS и базовой структурой директорий `domain`, `repositories`, `stores`, `components`, `pages`, `plugins`
- [x] 1.2 Создать `pages/index.vue` как страницу списка заметок
- [x] 1.3 Создать единую editor page для режимов создания и редактирования заметки
- [x] 1.4 Подключить app shell и базовый layout, который стабильно отображает список и редактор как две основные точки входа приложения

## 2. Доменная модель и persistence-контракт

- [x] 2.1 Описать доменные типы `Note` и `Todo`
- [x] 2.2 Зафиксировать границы между persisted model и transient editor draft model
- [x] 2.3 Ввести `NotesRepository` contract с операциями загрузки, получения по `id`, сохранения и удаления заметок
- [x] 2.4 Реализовать localStorage-backed repository
- [x] 2.5 Добавить runtime validation payload и безопасный fallback для повреждённых данных
- [x] 2.6 Подключить repository через client-only Nuxt plugin или эквивалентную SSR-safe точку внедрения без прямого доступа к storage из UI

## 3. Stores и жизненный цикл данных

- [x] 3.1 Реализовать `useNotesStore` для hydration списка заметок и синхронизации persisted state с repository
- [x] 3.2 Добавить safe initial state и `isHydrated`, чтобы browser storage не читался до client hydration
- [x] 3.3 Реализовать `useNoteEditorStore` для create/edit draft и dirty-флага
- [x] 3.4 Реализовать save/cancel flow и загрузку заметки по route-параметру
- [x] 3.5 Разделить note-level и todo-level editor actions так, чтобы изменение заголовка и изменение todo-элементов не смешивались в одном обработчике
- [x] 3.6 Добавить editor-level точки входа для `undo` и `redo` как часть store API и keyboard contract без полной реализации history-стека

## 4. UI foundation списка и редактора

- [x] 4.1 Создать reusable base UI components для кнопок, полей ввода, чекбоксов и modal dialogs без business orchestration внутри компонентов
- [x] 4.2 Реализовать страницу списка с read-only preview карточками заметок и переходом в editor page по выбору заметки
- [x] 4.3 Реализовать editor UI для note-level полей на основе draft state из editor store
- [x] 4.4 Реализовать editor UI для todo-level списка на основе draft state из editor store
- [x] 4.5 Обеспечить responsive и keyboard-accessible базовое поведение интерфейса, включая видимые focus states

## 5. Confirm flow и keyboard interactions

- [x] 5.1 Реализовать централизованный modal controller вместо native `alert` и `confirm`
- [x] 5.2 Подключить global modal host
- [x] 5.3 Подключить confirm-flow для удаления заметки
- [x] 5.4 Подключить confirm-flow для отмены несохранённых изменений в редакторе
- [x] 5.5 Реализовать keyboard-accessible modal behavior: закрытие по `Esc` и удержание фокуса внутри активного dialog
- [x] 5.6 Подключить editor-scoped shortcuts `Ctrl/Cmd + S`, `Ctrl/Cmd + Z` и `Shift + Ctrl/Cmd + Z` так, чтобы они не срабатывали на странице списка

## 6. Проверка persistence и поставка

- [x] 6.1 Проверить, что сохранённые заметки корректно восстанавливаются после reload
- [x] 6.2 Проверить, что discarded transient draft не возвращается после перезагрузки
- [x] 6.3 Добавить Dockerfile для production-ready сборки и запуска Nuxt-приложения
- [x] 6.4 Добавить `docker-compose.yaml` для предсказуемого локального запуска приложения одной командой
- [x] 6.5 Проверить foundation-сценарии: две страницы, read-only preview, repository-only persistence, modal confirmations и базовые shortcuts
