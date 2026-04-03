## ADDED Requirements

### Requirement: Editor draft history supports real undo and redo
Система SHALL хранить session-scoped history для draft state редактора заметки и предоставлять реальные действия `undo` и `redo`. History MUST применяться к note-level и todo-level изменениям одного draft без записи history snapshots в persistence.

#### Scenario: Undo reverts the latest note-level change
- **WHEN** пользователь изменил заголовок заметки и затем инициировал `undo` на editor page
- **THEN** система восстанавливает предыдущее значение draft title из editor history

#### Scenario: Undo reverts the latest todo-level change
- **WHEN** пользователь добавил, удалил, отредактировал или переключил todo-элемент и затем инициировал `undo`
- **THEN** система восстанавливает предыдущее состояние todo-коллекции из editor history

#### Scenario: Redo reapplies reverted change
- **WHEN** пользователь выполнил `undo`, после чего инициировал `redo`
- **THEN** система повторно применяет последнее отменённое изменение к draft state

### Requirement: Editor history is reset on baseline-changing transitions
Система SHALL очищать `undo` и `redo` history при каждом переходе, который пересобирает baseline editor draft. К таким переходам MUST относиться загрузка заметки по route, создание нового draft, успешное сохранение и подтверждённый cancel.

#### Scenario: Save resets undo and redo stacks
- **WHEN** пользователь сохраняет заметку
- **THEN** система делает сохранённое состояние новым baseline draft и очищает оба history stack

#### Scenario: Cancel resets undo and redo stacks
- **WHEN** пользователь подтверждает cancel несохранённых изменений
- **THEN** система восстанавливает baseline draft и очищает оба history stack

#### Scenario: Switching editor target resets history
- **WHEN** редактор загружает другую заметку или открывается в create mode для нового draft
- **THEN** система начинает новую editor history session без snapshot из предыдущей заметки

### Requirement: Editor history remains transient and does not alter persisted payload
Система SHALL хранить editor history только в transient store state. Persisted note model, repository contract и browser storage MUST NOT содержать `undo`, `redo` или history snapshots.

#### Scenario: Reload restores saved note without editor history
- **WHEN** пользователь перезагружает приложение после сохранения заметки и последующих transient undo/redo действий
- **THEN** система восстанавливает только последнее сохранённое состояние заметки без history stack предыдущей editor session

#### Scenario: Repository save ignores history metadata
- **WHEN** editor store сохраняет заметку через repository
- **THEN** в persistence попадает только persistable note model без transient history state

#### Scenario: New change after undo clears redo history
- **WHEN** пользователь выполняет `undo`, а затем вносит новое note-level или todo-level изменение
- **THEN** система очищает `redo` history для предыдущей ветки изменений
- **AND** считает новое изменение актуальным продолжением draft state