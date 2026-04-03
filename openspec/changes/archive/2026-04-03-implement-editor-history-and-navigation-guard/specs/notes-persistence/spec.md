## MODIFIED Requirements

### Requirement: Persisted notes survive reload and are restored consistently
Система SHALL восстанавливать ранее сохранённые заметки после перезагрузки приложения. Persisted state MUST оставаться отделённым от transient editor state и editor history, чтобы reload восстанавливал только сохранённые данные, а не несохранённые snapshots текущей editing session.

#### Scenario: Reload restores saved notes
- **WHEN** пользователь перезагружает приложение после сохранения заметок
- **THEN** система повторно загружает сохранённые заметки из persistence и отображает их в списке

#### Scenario: Reload does not restore discarded transient draft
- **WHEN** пользователь отменил несохранённые изменения и затем перезагрузил приложение
- **THEN** система восстанавливает только последнее сохранённое состояние заметки без discarded draft

#### Scenario: Reload does not restore transient undo history
- **WHEN** пользователь выполнил undo или redo в редакторе без нового сохранения и затем перезагрузил приложение
- **THEN** система восстанавливает только последнее persisted состояние заметки без editor history snapshots
