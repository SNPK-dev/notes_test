## ADDED Requirements

### Requirement: Acceptance matrix traces every assignment requirement to explicit evidence
Система SHALL иметь явную requirement-by-requirement acceptance matrix для всего тестового задания и инженерных ожиданий из вакансии. Для каждого пункта матрица MUST фиксировать, чем именно подтверждается соответствие: кодом, unit tests, Playwright и/или одним финальным manual acceptance pass.

#### Scenario: Matrix covers functional assignment requirements
- **WHEN** команда формирует acceptance matrix для текущего test assignment
- **THEN** матрица содержит отдельные строки для `two-page flow`, `notes CRUD`, `todo CRUD`, `read-only preview on list page`, `modal confirmations only`, `persistence after reload`, `undo/redo`, `route leave protection` и `Docker delivery`
- **AND** каждая строка явно указывает, какие виды доказательства уже существуют или должны быть добавлены в рамках этого change

#### Scenario: Matrix covers engineering expectations from the vacancy
- **WHEN** команда формирует acceptance matrix для инженерных ожиданий
- **THEN** матрица содержит отдельные строки для `Nuxt 4`, `TypeScript`, `Pinia/state manager`, `SCSS/SASS`, `reusable components`, `adaptive behavior`, `cross-browser-safe behavior`, `SSR-safe architecture / repository separation` и `UI/UX consistency`
- **AND** каждая строка указывает, подтверждается ли ожидание кодом, automated tests или финальным manual acceptance pass


### Requirement: Acceptance verification distinguishes evidence types instead of mixing them
Система SHALL разделять acceptance evidence по типам подтверждения. Acceptance verification MUST явно показывать, что подтверждается кодом, что подтверждается unit tests, что подтверждается Playwright и что остаётся только в одном финальном manual acceptance pass.

#### Scenario: Code evidence is recorded separately
- **WHEN** acceptance matrix ссылается на реализацию функциональности
- **THEN** она помечает такие пункты как подтверждённые кодом и архитектурными границами без подмены этого статуса тестовым покрытием

#### Scenario: Unit-level evidence is recorded separately
- **WHEN** acceptance matrix ссылается на store-level или unit-level поведение
- **THEN** она помечает такие пункты как подтверждённые unit tests и не считает это эквивалентом browser-level проверки

#### Scenario: Browser-level evidence is recorded separately
- **WHEN** acceptance matrix ссылается на критические пользовательские сценарии
- **THEN** она помечает такие пункты как подтверждённые black-box Playwright tests
- **AND** не использует импорты application internals как источник browser-level доказательства

#### Scenario: Final manual evidence is recorded separately
- **WHEN** acceptance matrix содержит пункт, который нерационально или избыточно автоматизировать в рамках текущего scope
- **THEN** она помечает этот пункт как подтверждаемый одним финальным manual acceptance pass
- **AND** не дублирует для него повторяющиеся промежуточные manual rituals по каждому section

### Requirement: Functional assignment scenarios are fully traced through acceptance coverage
Система SHALL иметь acceptance coverage для всех обязательных пользовательских сценариев test assignment. Если аудит находит gap, change MUST добавлять только минимально необходимое усиление покрытия без расширения продукта новыми возможностями.

#### Scenario: Two-page flow and read-only list are explicitly verified
- **WHEN** acceptance audit проверяет navigation model приложения
- **THEN** acceptance coverage явно подтверждает наличие ровно двух page entry points
- **AND** подтверждает, что notes list остаётся read-only preview page без inline editing

#### Scenario: Notes and todos CRUD are explicitly verified
- **WHEN** acceptance audit проверяет editing flows
- **THEN** acceptance coverage явно подтверждает create, read, update и delete для notes
- **AND** отдельно подтверждает create, read, update и delete для todo-элементов без смешивания note-level и todo-level поведения

#### Scenario: Confirmation, history and route protection are explicitly verified
- **WHEN** acceptance audit проверяет защитные и editor-specific сценарии
- **THEN** acceptance coverage явно подтверждает использование только modal confirmations
- **AND** подтверждает рабочие `undo/redo`
- **AND** подтверждает route leave protection при dirty editor state

#### Scenario: Reload persistence is explicitly verified
- **WHEN** acceptance audit проверяет сценарии reload
- **THEN** acceptance coverage явно подтверждает сохранение persisted notes после reload
- **AND** подтверждает, что discarded draft и transient history не возвращаются после reload

### Requirement: Engineering expectations are verified without expanding the product scope
Система SHALL подтверждать инженерные ожидания задания и вакансии без добавления новых продуктовых фич. Acceptance-hardening change MUST оставаться в пределах audit, verification, minimal gap fixing и delivery proof.

#### Scenario: Architecture expectations remain traceable
- **WHEN** acceptance audit проверяет техническую основу проекта
- **THEN** acceptance coverage явно подтверждает использование `Nuxt 4`, `TypeScript`, `Pinia/state manager`, `SCSS/SASS` и reusable components
- **AND** не требует перепроектирования приложения, если текущее решение уже соответствует этим ожиданиям

#### Scenario: Adaptive and cross-browser behavior are verified minimally
- **WHEN** acceptance audit проверяет non-functional UI expectations
- **THEN** change выполняет minimal responsive smoke и minimal cross-browser smoke для критических сценариев
- **AND** не расширяет scope в полноценную CI/CD, visual regression или широкую browser matrix platform

#### Scenario: Docker delivery is verified as delivery evidence
- **WHEN** acceptance audit проверяет delivery readiness
- **THEN** acceptance coverage явно подтверждает, что `Dockerfile` и `docker-compose.yaml` позволяют собрать и запустить приложение
- **AND** фиксирует это как отдельное delivery-level доказательство соответствия

### Requirement: Final manual acceptance is reduced to one concise end-of-project pass
Система SHALL завершать acceptance verification одним коротким финальным manual acceptance pass вместо повторяющихся ручных прогонов после каждого подшага. Этот pass MUST использовать компактный checklist, привязанный к acceptance matrix.

#### Scenario: Final manual checklist only covers residual human-facing confirmation
- **WHEN** automated coverage уже подтверждает functional и regression-critical behavior
- **THEN** финальный manual acceptance checklist ограничивается краткой human-facing приёмкой
- **AND** не повторяет уже доказанные automated scenarios без новой ценности

#### Scenario: Residual gaps are called out explicitly
- **WHEN** acceptance audit не может подтвердить конкретный пункт текущим кодом или automation
- **THEN** change явно фиксирует этот gap как residual item в acceptance matrix
- **AND** требует либо минимального усиления покрытия, либо включения пункта в финальный manual acceptance pass
