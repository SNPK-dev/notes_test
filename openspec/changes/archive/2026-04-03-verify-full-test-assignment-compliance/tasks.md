## 1. Acceptance audit and traceability

- [x] 1.1 Создать `acceptance-matrix.md` как отдельный Markdown-артефакт и зафиксировать в нём requirement-by-requirement acceptance matrix для всех functional требований ТЗ:
`two-page flow`, `notes CRUD`, `todo CRUD`, `read-only preview on list page`, `modal confirmations only`, `persistence after reload`, `undo/redo`, `route leave protection`, `Docker delivery`
- [x] 1.2 Добавить в acceptance matrix отдельные строки для инженерных ожиданий: `Nuxt 4`, `TypeScript`, `Pinia/state manager`, `SCSS/SASS`, `reusable components`, `adaptive behavior`, `cross-browser-safe behavior`, `SSR-safe repository separation`, `UI/UX consistency`
- [x] 1.3 Для каждой строки acceptance matrix зафиксировать отдельные колонки доказательств: `code`, `unit tests`, `Playwright`, `final manual acceptance pass`, а также текущий статус и residual gap
- [x] 1.4 Привязать каждое требование к конкретным файлам кода, существующим unit tests, существующим Playwright tests или явному пункту финального manual pass

## 2. Gap analysis and minimal correction plan

- [x] 2.1 Выполнить audit существующего покрытия по acceptance matrix и пометить только реальные gaps без предположений и без scope creep
- [x] 2.2 Классифицировать каждый найденный gap как `missing evidence`, `missing unit test`, `missing Playwright coverage`, `missing responsive/cross-browser smoke`, `missing delivery proof` или `missing final manual acceptance item`
- [x] 2.3 Если для надёжных browser checks нужны e2e-friendly UI hooks, зафиксировать только минимально необходимые thin UI changes без переноса business logic в компоненты
- [x] 2.4 Если audit выявит реальное spec-level несоответствие ТЗ, подготовить только минимально необходимый delta spec вместо неограниченного расширения существующих capabilities

## 3. Automated acceptance hardening

- [x] 3.1 Добить black-box Playwright покрытие для всех критических пользовательских потоков, которые acceptance matrix пометит как неполностью подтверждённые на browser level
- [x] 3.2 Убедиться, что Playwright tests остаются black-box: живут отдельно от app code, не импортируют internals и работают через DOM, routes, roles, labels, keyboard input и visible state
- [x] 3.3 Добавить или скорректировать unit/store tests только там, где acceptance matrix покажет пробел в unit-level доказательстве поведения
- [x] 3.4 Автоматизировать minimal responsive smoke для критических сценариев в пределах текущего Playwright suite без перехода к visual regression platform
- [x] 3.5 Автоматизировать minimal cross-browser smoke в Chromium и Firefox для критических сценариев: запуск приложения, переходы по ключевым route, modal/guard flow и базовое editor interaction, без расширения scope в широкую browser matrix infrastructure

## 4. Delivery and final acceptance packaging

- [x] 4.1 Перепроверить delivery evidence: `npm test`, `npm run build`, `npm run test:e2e`, `docker compose build`, `docker compose up`, и связать результаты с acceptance matrix
- [x] 4.2 Создать `final-acceptance-checklist.md` как отдельный Markdown-артефакт и покрыть в нём только residual human-facing confirmation
- [x] 4.3 Проверить, что финальный manual checklist не дублирует уже доказанные automated scenarios и действительно оставляет только один итоговый ручной прогон
- [x] 4.4 Выполнить финальную self-verify проверку change против proposal, specs, design, acceptance matrix и checklist
- [x] 4.5 Подготовить change к архивированию только после того, как acceptance matrix покажет полную трассировку всех требований и отсутствие неучтённых blockers
