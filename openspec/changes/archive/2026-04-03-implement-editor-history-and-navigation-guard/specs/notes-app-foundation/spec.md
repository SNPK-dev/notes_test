## MODIFIED Requirements

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
