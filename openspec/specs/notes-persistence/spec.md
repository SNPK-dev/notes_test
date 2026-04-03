## Purpose

Определяет требования к repository-only persistence и безопасному восстановлению данных заметок.

## Requirements

### Requirement: Notes persistence is accessed only through repository abstraction
Система SHALL читать и записывать заметки только через repository abstraction. UI-компоненты и page-компоненты MUST NOT обращаться к localStorage или другому browser storage напрямую.

#### Scenario: Load notes through repository
- **WHEN** приложению требуется получить коллекцию заметок
- **THEN** store запрашивает данные через repository contract, а не через прямой вызов localStorage из UI

#### Scenario: Save note through repository
- **WHEN** пользователь сохраняет новую или изменённую заметку
- **THEN** store передаёт persistable модель заметки в repository contract для записи

#### Scenario: Delete note through repository
- **WHEN** пользователь подтверждает удаление заметки
- **THEN** store удаляет заметку через repository contract, а не через прямую мутацию browser storage из компонента

### Requirement: Persistence implementation remains SSR-safe
Система SHALL изолировать browser-only persistence implementation в client-only infrastructure слое. Во время server-side исполнения или до client hydration система MUST NOT обращаться к localStorage.

#### Scenario: No storage access before client hydration
- **WHEN** приложение ещё не завершило client hydration
- **THEN** система не выполняет чтение localStorage и остаётся в безопасном начальном состоянии

#### Scenario: Client-only repository activation
- **WHEN** приложение выполняется в браузере после hydration
- **THEN** система активирует localStorage-backed repository через client-only точку внедрения

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

### Requirement: Stored payload is validated before entering domain state
Система SHALL выполнять runtime validation данных, прочитанных из localStorage, до передачи их в domain и stores. Невалидные или повреждённые записи MUST обрабатываться безопасным fallback-сценарием.

#### Scenario: Invalid stored payload is rejected safely
- **WHEN** repository читает из localStorage payload, не соответствующий ожидаемой схеме заметки
- **THEN** система не передаёт этот payload в stores как валидную заметку и применяет безопасный fallback

#### Scenario: Valid stored payload becomes domain data
- **WHEN** repository читает из localStorage payload, соответствующий ожидаемой схеме заметки
- **THEN** система преобразует payload в domain-модель и передаёт её в stores
