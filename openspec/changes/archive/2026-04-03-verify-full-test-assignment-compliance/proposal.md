## Why

Функциональная основа приложения уже реализована: есть two-page flow, CRUD заметок и todo, persistence после reload, modal confirmations, undo/redo, route leave protection, Docker setup, unit tests и black-box Playwright. Однако пока нет отдельного завершающего change, который формально доказывает соответствие тестовому заданию по каждому пункту и закрывает финальный regression/acceptance слой.

Нужен отдельный acceptance-hardening pass, чтобы превратить состояние "приложение, вероятно, соответствует ТЗ" в состояние "соответствие каждому требованию зафиксировано, подтверждено тестами или явной приёмкой и не зависит от ручных догадок". Это нужно сейчас, потому что предыдущие changes уже архивированы, а финальная сдача требует не только работающий код, но и доказуемую полноту покрытия требований.

## What Changes

- Провести requirement-by-requirement аудит всего тестового задания и зафиксировать матрицу соответствия для каждого пункта ТЗ.
- Проверить, что каждый обязательный пользовательский сценарий либо уже покрыт кодом и тестами, либо будет точечно усилен в рамках этого change.
- Добить black-box Playwright покрытие для критических пользовательских потоков, если по матрице найдутся пробелы.
- Проверить соответствие требованиям по read-only preview, CRUD заметок, CRUD todo, modal confirmations, undo/redo, persistence after reload, route leave protection, responsive behavior и Docker delivery.
- Выполнить минимальный responsive smoke и cross-browser smoke для критических сценариев без расширения scope в полноценную CI-инфраструктуру.
- Сформировать короткий финальный acceptance checklist для одного итогового ручного прогона перед сдачей.
- Явно ограничить scope: change не добавляет новые продуктовые возможности, не меняет архитектуру без необходимости и не расширяется в отдельную CI/CD или visual regression платформу.
- Проверить соответствие нефункциональным и инженерным требованиям задания и вакансии: Nuxt 4, TypeScript, Pinia/state manager, SCSS/SASS, reusable components, UI/UX consistency, adaptive behavior и cross-browser-safe работа.

## Capabilities

### New Capabilities
- `assignment-acceptance`: приложение получает формализованную матрицу соответствия тестовому заданию и black-box regression coverage для критических пользовательских сценариев.

### Modified Capabilities

## Impact

- Будут затронуты acceptance artifacts, Playwright coverage, возможно точечные e2e-friendly UI hooks и отдельные участки приложения только там, где аудит реально обнаружит пробел.
- Появится единая трассировка от каждого пункта ТЗ к коду, тесту или финальному acceptance check.
- Финальная сдача станет опираться не на предположение, а на зафиксированное покрытие требований.
