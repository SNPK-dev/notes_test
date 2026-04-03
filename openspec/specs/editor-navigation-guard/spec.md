## Purpose

Определяет требования к защите от случайного ухода со страницы редактора при dirty draft.

## Requirements

### Requirement: Editor prevents accidental navigation away when draft is dirty
Система SHALL перехватывать уход пользователя с editor page, если в редакторе есть несохранённые изменения. Перехват MUST опираться на dirty state editor store и MUST NOT переносить decision logic в presentational components.

#### Scenario: Leave editor for list page with dirty draft
- **WHEN** пользователь пытается перейти со страницы редактора на страницу списка при наличии dirty draft
- **THEN** система блокирует навигацию до завершения confirm-flow

#### Scenario: Leave editor for another editor route with dirty draft
- **WHEN** пользователь пытается открыть другую заметку или другой режим editor route при наличии dirty draft
- **THEN** система блокирует смену маршрута до завершения confirm-flow

### Requirement: Navigation away from editor requires explicit confirmation
Система SHALL запрашивать подтверждение перед discard несохранённого draft при route leave из editor page. Confirm-flow MUST использовать существующий modal controller вместо native browser dialogs внутри SPA-навигации.

#### Scenario: User confirms leaving dirty editor
- **WHEN** пользователь подтверждает уход со страницы редактора в modal dialog
- **THEN** система разрешает целевую навигацию и отбрасывает transient draft текущей editor session

#### Scenario: User declines leaving dirty editor
- **WHEN** пользователь отменяет confirm dialog ухода со страницы редактора
- **THEN** система оставляет пользователя на текущем editor route и сохраняет текущий draft без изменений

### Requirement: Clean editor navigation remains uninterrupted
Система SHALL пропускать route navigation без дополнительного confirm-flow, если editor draft не содержит несохранённых изменений.

#### Scenario: Leave editor with clean draft
- **WHEN** пользователь уходит со страницы редактора при `isDirty = false`
- **THEN** система выполняет навигацию без modal confirmation
