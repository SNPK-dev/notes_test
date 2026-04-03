## ADDED Requirements

### Requirement: Confirmation flows use modal dialogs instead of native dialogs
Система SHALL использовать modal dialogs для подтверждения удаления заметки, отмены несохранённых изменений и других потенциально опасных действий. Система MUST NOT использовать native `alert`, `confirm` или `prompt`.

#### Scenario: Confirm note deletion through modal
- **WHEN** пользователь инициирует удаление заметки
- **THEN** система открывает modal dialog подтверждения перед фактическим удалением

#### Scenario: Confirm cancel with unsaved changes through modal
- **WHEN** пользователь инициирует cancel при наличии несохранённых изменений в редакторе
- **THEN** система запрашивает подтверждение через modal dialog перед discard transient draft

### Requirement: Modal interactions remain keyboard-accessible
Система SHALL обеспечивать keyboard-accessible поведение modal dialogs и базовых interactive components. Активный modal MUST поддерживать фокус, подтверждение и закрытие с клавиатуры.

#### Scenario: Escape closes active modal
- **WHEN** у пользователя открыт modal dialog и он нажимает `Esc`
- **THEN** система закрывает активный modal через централизованный modal flow

#### Scenario: Focus stays within active modal
- **WHEN** пользователь перемещается по элементам интерфейса с клавиатуры при открытом modal dialog
- **THEN** система удерживает фокус внутри активного modal до подтверждения или отмены действия

### Requirement: Editor keyboard shortcuts are centralized and context-aware
Система SHALL обрабатывать keyboard shortcuts редактора централизованно и только в контексте editor page. Сочетания `Ctrl/Cmd + S`, `Ctrl/Cmd + Z` и `Shift + Ctrl/Cmd + Z` MUST быть привязаны к editor-level actions, а не к отдельным визуальным компонентам.

#### Scenario: Save shortcut triggers editor save flow
- **WHEN** пользователь нажимает `Ctrl/Cmd + S` на странице редактора
- **THEN** система инициирует editor-level save flow вместо нативного поведения браузера

#### Scenario: Undo shortcut triggers editor undo action
- **WHEN** пользователь нажимает `Ctrl/Cmd + Z` на странице редактора
- **THEN** система инициирует editor-level undo action

#### Scenario: Redo shortcut triggers editor redo action
- **WHEN** пользователь нажимает `Shift + Ctrl/Cmd + Z` на странице редактора
- **THEN** система инициирует editor-level redo action

#### Scenario: Shortcuts do not leak to list page
- **WHEN** пользователь нажимает editor keyboard shortcut вне страницы редактора
- **THEN** система не активирует editor-specific действие

### Requirement: Base UI components are reusable and presentation-focused
Система SHALL предоставлять набор reusable base UI components для кнопок, полей ввода, чекбоксов и modal dialogs. Эти компоненты MUST оставаться presentation-focused и MUST NOT содержать прямой persistence-доступ или business orchestration.

#### Scenario: Reusable input component stays presentation-focused
- **WHEN** форма редактора использует base input component
- **THEN** компонент отображает и эмитит пользовательский ввод без доступа к repository или localStorage

#### Scenario: Reusable checkbox component serves todo editing
- **WHEN** редактор заметки отображает todo-элементы
- **THEN** система использует reusable checkbox-oriented component для todo-level взаимодействия без встраивания persistence-логики в сам компонент
