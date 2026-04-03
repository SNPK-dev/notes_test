## Purpose

Определяет foundation-требования к страницам и базовому workflow notes SPA.

## Requirements

### Requirement: Application provides exactly two pages for the notes workflow
Система SHALL предоставлять ровно две page-компоненты: страницу списка заметок и единую страницу редактора заметки. Создание новой заметки и редактирование существующей заметки MUST происходить на одной editor page в разных режимах, определяемых route-параметром.

#### Scenario: Open notes list page
- **WHEN** пользователь открывает корневой маршрут приложения
- **THEN** система отображает страницу списка заметок как основную точку входа в приложение

#### Scenario: Open editor in create mode
- **WHEN** пользователь переходит на editor route без идентификатора заметки
- **THEN** система открывает страницу редактора в режиме создания новой заметки

#### Scenario: Open editor in edit mode
- **WHEN** пользователь переходит на editor route с идентификатором существующей заметки
- **THEN** система открывает страницу редактора в режиме редактирования этой заметки

### Requirement: Notes list page shows read-only preview entries
Система SHALL отображать на странице списка набор read-only preview карточек заметок. Preview MUST позволять понять, какую заметку открыть, но MUST NOT допускать inline-редактирование содержимого заметки или todo-элементов на странице списка.

#### Scenario: Read-only note preview
- **WHEN** пользователь просматривает список заметок
- **THEN** каждая карточка заметки отображается как read-only preview без интерактивных контролов для прямого редактирования

#### Scenario: Open note from preview
- **WHEN** пользователь активирует preview заметки в списке
- **THEN** система переводит пользователя на страницу редактора соответствующей заметки

### Requirement: Editor flow separates note-level and todo-level behaviors
Система SHALL разделять сценарии редактирования заметки и todo-элементов внутри редактора. Note-level поведение MUST включать управление заголовком и жизненным циклом заметки, а todo-level поведение MUST включать управление списком todo без смешивания этих обязанностей в одном UI-контроле.

#### Scenario: Edit note fields independently from todos
- **WHEN** пользователь изменяет заголовок заметки на странице редактора
- **THEN** система применяет изменение к note-level draft, не требуя изменения todo-элементов

#### Scenario: Edit todo collection independently from note metadata
- **WHEN** пользователь добавляет, изменяет или переключает todo-элемент в редакторе
- **THEN** система применяет изменение к todo-level draft, не смешивая его с логикой заголовка и метаданных заметки

### Requirement: Editor supports create, edit, cancel, undo, and redo entry points
Система SHALL предоставлять на editor page архитектурно закреплённые точки входа для create, edit, cancel, undo и redo сценариев. Cancel MUST быть поддержан как пользовательский сценарий discard для transient draft, а undo/redo MUST быть реализованы как реальные editor actions поверх history store state, а не как зарезервированные заглушки.

#### Scenario: Cancel discards unsaved editor draft
- **WHEN** пользователь инициирует cancel в редакторе до сохранения изменений
- **THEN** система отбрасывает transient draft и сохраняет persisted state заметки без изменений

#### Scenario: Undo action is available through editor contract
- **WHEN** пользователь инициирует undo на странице редактора
- **THEN** система вызывает editor-level действие undo и восстанавливает предыдущее draft state без реализации отката внутри presentational component

#### Scenario: Redo action is available through editor contract
- **WHEN** пользователь инициирует redo на странице редактора
- **THEN** система вызывает editor-level действие redo и повторно применяет отменённое draft state без реализации повтора внутри presentational component

#### Scenario: Editor route leave respects dirty-state protection
- **WHEN** пользователь пытается уйти с editor page при наличии несохранённых изменений
- **THEN** система не завершает навигацию, пока confirm-flow не разрешит discard текущего draft
