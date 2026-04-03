## Context

Текущий foundation уже разделяет persisted notes state и transient editor draft state: `useNotesStore` отвечает за коллекцию сохранённых заметок, а `useNoteEditorStore` держит `sourceNote`, `baselineDraft` и `draft`. UI редактора работает поверх store API, keyboard shortcuts подключены отдельным composable, confirm-flow централизован через modal store, а persistence остаётся за repository abstraction.

В этой точке два сценария остаются незавершёнными. Во-первых, `undo` и `redo` существуют только как зарезервированные entry points без реального history-механизма. Во-вторых, editor page не защищает пользователя от потери несохранённых изменений при навигации на другой route: confirm-flow есть только для явного `cancel`, но не для route leave. Дополнительно foundation уже содержит Docker setup, однако для закрытия change нужен отдельный smoke-check на машине с работающим Docker engine.

Изменение затрагивает несколько слоёв сразу: editor store, keyboard contract, editor page routing behavior, modal orchestration и verification flow. Поэтому для него нужен отдельный design, который зафиксирует границы history-state и правила leave guard без переноса логики в UI-компоненты.

## Goals / Non-Goals

**Goals:**
- Добавить реальный undo/redo history для `useNoteEditorStore`, покрывающий note-level и todo-level изменения одного draft.
- Сохранить строгую изоляцию persisted state, baseline draft и transient history snapshots.
- Подключить route leave guard для ухода с editor page при dirty state через уже существующий modal confirmation flow.
- Обеспечить, что keyboard shortcuts `Ctrl/Cmd + Z` и `Shift + Ctrl/Cmd + Z` вызывают реальную history-логику только на editor page.
- Зафиксировать smoke verification Docker-сборки и запуска на машине с рабочим Docker engine без расширения delivery scope.

**Non-Goals:**
- Добавление toast notifications, глобального notification center или новых UX-подсказок.
- Добавление новых product features заметок: tags, search, attachments, rich-text, bulk actions.
- Перенос business logic или persistence logic в page-компоненты и presentational UI.
- Расширение истории до кросс-сессионного, persisted или collaborative undo/redo.
- Создание новой e2e-инфраструктуры сверх минимальной smoke verification.

## Decisions

### 1. History живёт внутри `useNoteEditorStore`, а не в компонентах

`undo`/`redo` должны работать на уровне editor contract, а не отдельных UI-элементов. История будет храниться в store как две коллекции snapshots: `undoStack` и `redoStack`, где каждый snapshot представляет полную копию `NoteDraft`.

Почему так:
- это сохраняет единый источник истины для `draft`, `baselineDraft` и `isDirty`;
- keyboard shortcuts и кнопки редактора обращаются к одному API;
- presentational components не начинают управлять history самостоятельно.

Альтернатива:
- Хранить history локально в editor page или в отдельных composables для формы и todo-list.
- Отказано, потому что это разорвёт note-level и todo-level действия на несколько независимых состояний и усложнит leave guard.

### 2. История фиксируется на уровне editor actions, а не через deep watchers

Каждое mutating action editor store (`updateTitle`, `addTodo`, `updateTodoText`, `toggleTodo`, `removeTodo`) перед изменением сохраняет текущий snapshot в `undoStack` и очищает `redoStack`. `requestUndo` и `requestRedo` просто переставляют snapshot между стеками и восстанавливают `draft`.

Почему так:
- store уже является единственной точкой входа для note-level и todo-level мутаций;
- не требуется observer-магия, привязанная к Vue reactivity;
- поведение остаётся детерминированным и тестируемым.

Альтернатива:
- Следить за `draft` через `watch` и автоматически собирать snapshots по любому изменению.
- Отказано, потому что это делает историю зависимой от реактивных побочных эффектов и усложняет контроль за batch-операциями.

### 3. Baseline и history snapshots не попадают в persistence

Persisted notes продолжают формироваться только через `mapDraftToPersistedNote`. Ни `undoStack`, ни `redoStack`, ни метаданные history не попадают в repository contract и не читаются из `localStorage`.

Почему так:
- сохраняется текущая граница между transient editor state и persisted state;
- history остаётся implementation detail editor session;
- замена localStorage на REST API в будущем не требует изменения semantics history.

Альтернатива:
- Persist history вместе с draft-состоянием.
- Отказано, потому что это расширяет продуктовую модель без требования в scope и усложняет runtime validation persisted payload.

### 4. Save, cancel, delete и route load пересобирают history baseline

После `loadForRoute`, `startCreateDraft`, успешного `save` и `cancel` store должен:
- обновить `baselineDraft`,
- заменить текущий `draft`,
- очистить `undoStack` и `redoStack`.

Это гарантирует, что history относится только к текущей editing session относительно актуального baseline. После переключения на другую заметку, возврата к persisted версии или сохранения нельзя откатываться в старые snapshots предыдущего состояния.

Альтернатива:
- Сохранять историю между `save` и дальнейшим редактированием.
- Отказано, потому что тогда `redo`/`undo` начинают пересекать границу между persisted baseline и уже подтверждёнными изменениями.

### 5. Route leave guard оркестрируется editor page, но решение принимает store-driven dirty state

Сам guard должен жить рядом с router integration на editor page, потому что только page знает о route leave lifecycle. Но критерий блокировки остаётся store-driven: guard смотрит на `editorStore.isDirty` и при необходимости открывает уже существующий confirm modal.

Почему так:
- router hooks нельзя надёжно инкапсулировать в repository/store слой;
- confirm orchestration уже централизована через modal store;
- UI не принимает бизнес-решение о том, что считается dirty состоянием.

Альтернатива:
- Встраивать route guard в глобальный router plugin.
- Отказано, потому что shortcut и modal logic должны оставаться scoped к editor page, а не глобально влиять на все маршруты.

### 6. Guard защищает internal navigation и route-param changes внутри editor

Guard должен срабатывать не только при переходе с `/editor/:id` на список, но и при смене editor route, например при переходе от одной заметки к другой. Для router navigation используется asynchronous confirmation через modal. Для hard reload / tab close change не добавляет новый custom browser prompt; эта зона остаётся за пределами текущего scope, чтобы не расширять change в сторону global unload handling.

Альтернатива:
- Сразу добавить `beforeunload` и browser-native confirm.
- Отказано, потому что это отдельный UX/compatibility scope и не требуется для текущего change.

### 7. Docker verification остаётся минимальной и environment-dependent

Change не меняет Dockerfile или compose-поток радикально. В рамках verification достаточно зафиксировать обязательный smoke-check на рабочем Docker engine: `docker compose build` и `docker compose up` должны проходить для текущего foundation-приложения.

Почему так:
- это закрывает оставшийся delivery gap без новой инфраструктуры;
- не появляются лишние environment matrix, CI pipelines или orchestration-слои.

## Risks / Trade-offs

- [История на полном snapshot draft] → Увеличивает объём памяти по сравнению с operation log. Митигация: scope ограничен одной заметкой и небольшим todo-списком, поэтому snapshot-подход остаётся проще и достаточен.
- [Слишком частые snapshots при каждом вводе текста] → Может создать длинный undoStack. Митигация: в foundation допускается action-per-change модель; при необходимости лимит стека можно добавить как внутреннюю константу store без изменения публичного API.
- [Асинхронный modal внутри route guard] → Требует аккуратного обращения с повторной навигацией и re-entry. Митигация: guard должен сериализовать один pending confirm и повторно использовать результат, пока пользователь не завершил решение.
- [Смешение route lifecycle и store reset] → Неправильный порядок может сбросить draft до завершения confirm. Митигация: reset/cancel выполняются только после подтверждения пользователя или успешной целевой навигации.
- [Docker smoke verification зависит от окружения] → Проверка может не пройти на машине без запущенного engine. Митигация: в tasks и verification явно указать, что smoke-check должен запускаться на рабочем Docker Desktop / engine.

## Migration Plan

1. Расширить `useNoteEditorStore` history state и action API без изменения repository contract.
2. Подключить реальные `undo`/`redo` в editor shortcuts и editor page.
3. Добавить editor-scoped route leave guard с confirm modal.
4. Обновить verification tests для history, navigation safety и Docker smoke-check.
5. Провести ручную и terminal-based verification на машине с рабочим Docker engine.

Rollback strategy:
- при проблемах можно временно отключить route leave guard и вернуть `undo`/`redo` в no-op, не затрагивая persisted data format и repository boundary;
- миграции данных не требуются, потому что persisted payload не меняется.

## Open Questions

- Нужен ли лимит размера `undoStack` уже в этом change, или текущего session-scoped snapshot history достаточно. По текущему scope принимаем второй вариант.
- Нужен ли отдельный `beforeunload` сценарий для hard refresh/browser close. По текущему scope нет: ограничиваемся router-based navigation guard.
