## MODIFIED Requirements

### Requirement: Confirmation flows use modal dialogs instead of native dialogs
Система SHALL использовать modal dialogs для подтверждения удаления заметки, отмены несохранённых изменений, ухода со страницы редактора с dirty draft и других потенциально опасных действий. Система MUST NOT использовать native `alert`, `confirm` или `prompt` для SPA-сценариев подтверждения.

#### Scenario: Confirm note deletion through modal
- **WHEN** пользователь инициирует удаление заметки
- **THEN** система открывает modal dialog подтверждения перед фактическим удалением

#### Scenario: Confirm cancel with unsaved changes through modal
- **WHEN** пользователь инициирует cancel при наличии несохранённых изменений в редакторе
- **THEN** система запрашивает подтверждение через modal dialog перед discard transient draft

#### Scenario: Confirm editor leave with unsaved changes through modal
- **WHEN** пользователь пытается покинуть editor page при наличии dirty draft
- **THEN** система запрашивает подтверждение через modal dialog перед route navigation

### Requirement: Editor keyboard shortcuts are centralized and context-aware
Система SHALL обрабатывать keyboard shortcuts редактора централизованно и только в контексте editor page. Сочетания `Ctrl/Cmd + S`, `Ctrl/Cmd + Z` и `Shift + Ctrl/Cmd + Z` MUST быть привязаны к реальным editor-level actions, а не к отдельным визуальным компонентам или no-op заглушкам.

#### Scenario: Save shortcut triggers editor save flow
- **WHEN** пользователь нажимает `Ctrl/Cmd + S` на странице редактора
- **THEN** система инициирует editor-level save flow вместо нативного поведения браузера

#### Scenario: Undo shortcut triggers real editor undo action
- **WHEN** пользователь нажимает `Ctrl/Cmd + Z` на странице редактора после изменения draft
- **THEN** система инициирует editor-level undo action и восстанавливает предыдущее draft state

#### Scenario: Redo shortcut triggers real editor redo action
- **WHEN** пользователь нажимает `Shift + Ctrl/Cmd + Z` на странице редактора после `undo`
- **THEN** система инициирует editor-level redo action и повторно применяет отменённое draft state

#### Scenario: Shortcuts do not leak to list page
- **WHEN** пользователь нажимает editor keyboard shortcut вне страницы редактора
- **THEN** система не активирует editor-specific действие
