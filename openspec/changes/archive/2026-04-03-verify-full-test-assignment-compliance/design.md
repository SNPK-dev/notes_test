## Context

Приложение уже прошло через два основных changes: foundation bootstrap и реализацию editor history/navigation guard. В результате в кодовой базе уже есть рабочий two-page flow, Pinia stores, repository-only persistence, modal confirmations, real undo/redo, route leave protection, Docker delivery, unit tests и black-box Playwright для части критических сценариев.

Проблема текущего этапа не в добавлении новой продуктовой возможности, а в формальном доказательстве соответствия тестовому заданию и инженерным ожиданиям вакансии. На данный момент доказательства распределены по коду, unit tests, e2e tests и ручным проверкам, но не сведены в одну acceptance matrix. Из-за этого финальная сдача всё ещё опирается на интерпретацию состояния проекта, а не на явную трассировку от каждого требования к конкретному виду подтверждения.

Ограничения change:
- нельзя раздувать scope новыми фичами
- нельзя переписывать архитектуру без обнаруженного gap
- automated coverage должна оставаться black-box на browser level
- manual verification должна быть сведена к одному короткому финальному pass
- любые точечные изменения в приложении допустимы только как минимальное закрытие реально найденного acceptance gap

## Goals / Non-Goals

**Goals:**
- Сформировать единую requirement-by-requirement acceptance matrix для всего ТЗ и инженерных ожиданий.
- Разделить доказательства по четырём каналам: код, unit tests, Playwright, финальный manual acceptance pass.
- Выполнить audit существующего покрытия и выявить только реальные gaps.
- Точечно усилить Playwright и, при необходимости, e2e-friendly UI hooks только там, где текущая browser-level проверка недостаточна.
- Подтвердить критические non-functional ожидания: adaptive behavior, minimal cross-browser safety и Docker delivery.
- Подготовить финальный короткий acceptance checklist, который закрывает только residual human-facing подтверждения.

**Non-Goals:**
- Добавление новых пользовательских возможностей.
- Рефакторинг архитектуры ради “красоты”, если текущая реализация уже соответствует требованиям.
- Построение полноценной CI/CD, visual regression platform или широкой browser matrix infrastructure.
- Замена unit tests на e2e или наоборот.
- Повторяющиеся крупные ручные прогоны после каждого шага проверки.

## Decisions

### 1. Acceptance matrix становится первичным артефактом верификации
Решение: в рамках change появится явная матрица, где каждая строка соответствует одному требованию задания или инженерному ожиданию, а колонки фиксируют:
- requirement / expectation
- implementation evidence
- unit test evidence
- Playwright evidence
- final manual pass evidence
- current status / residual gap

Почему так:
- это убирает двусмысленность между “фича есть” и “фича доказана”
- это позволяет не смешивать архитектурные доказательства и browser-level доказательства
- это даёт единый объект для финальной verify-проверки и архивирования

Альтернативы:
- просто перечислить проверки в README: слишком слабо для requirement-by-requirement traceability
- опереться только на автоматические тесты: часть инженерных ожиданий и human-facing UX всё равно требуют явной классификации доказательств

### 2. Browser-level acceptance остаётся black-box и строится поверх существующего Playwright suite
Решение: все browser-level подтверждения выполняются через Playwright в `tests/e2e/` без импорта stores, components, composables или других internals.

Почему так:
- это сохраняет честную проверку реального пользовательского поведения
- это не ломает ранее зафиксированную границу между unit/store tests и e2e
- это позволяет расширять покрытие минимально и адресно

Альтернативы:
- заменить Playwright store-aware integration tests: нарушает black-box contract
- перенести всё в manual acceptance: повышает риск и снижает воспроизводимость

### 3. Gap fixing допускается только после audit и только минимальным способом
Решение: сначала составляется acceptance matrix и определяется статус покрытия, затем изменяется код или тесты только для тех требований, где найден реальный gap.

Почему так:
- change должен проверять соответствие, а не заново проектировать приложение
- это снижает риск scope creep
- это делает любые правки обоснованными и проверяемыми

Альтернативы:
- заранее усиливать всё подряд: приведёт к расползанию change и дублированию уже достаточного покрытия

### 4. Финальный manual acceptance pass остаётся ровно одним и закрывает только residual human-facing наблюдения
Решение: manual verification не размазывается по всем секциям. Вместо этого формируется один короткий checklist для финального прогона перед сдачей.

Почему так:
- уже есть unit tests, Playwright и Docker smoke
- повторяющиеся manual passes не добавляют новой ценности и раздувают процесс
- требования пользователя прямо задают минимизацию ручной проверки

Альтернативы:
- ручной прогон после каждого подшага: слишком дорогой и шумный
- полный отказ от ручной приёмки: не покрывает часть human-facing качественных ожиданий

### 5. Engineering expectations подтверждаются отдельным слоем, а не растворяются внутри feature checks
Решение: в acceptance matrix будут отдельные строки для `Nuxt 4`, `TypeScript`, `Pinia/state manager`, `SCSS/SASS`, reusable components, adaptive behavior, cross-browser-safe behavior, Docker delivery, SSR-safe repository separation и UI/UX consistency.

Почему так:
- эти ожидания важны для тестового задания и вакансии не меньше, чем feature behavior
- они не всегда выражаются как один пользовательский сценарий, но должны быть доказуемыми
- это предотвращает ситуацию, когда functional checks зелёные, а инженерные ожидания остаются незафиксированными

Альтернативы:
- считать инженерные ожидания “неявно выполненными”: недостаточно для финальной сдачи

### 6. Existing spec capabilities меняются только при обнаружении реального несоответствия
Решение: текущий planning вводит новую capability `assignment-acceptance` и не модифицирует existing capabilities заранее. Delta specs в существующие capabilities добавляются только если audit обнаружит реальное поведенческое расхождение с ТЗ.

Почему так:
- change должен быть audit-first
- нельзя искажать main specs предположениями о проблемах, которых может не быть
- это удерживает planning и implementation в минимальном scope

Альтернативы:
- заранее открывать delta specs в каждый capability: это создаст ложное впечатление известных product-level gaps

### 7. Acceptance matrix хранится как отдельный Markdown-артефакт внутри change

Решение: requirement-by-requirement acceptance matrix хранится как отдельный Markdown-файл внутри текущего change, а не размазывается по README, tasks или комментариям к тестам. Финальный manual acceptance checklist хранится отдельным Markdown-файлом рядом с matrix.

Почему так:
- это делает evidence traceability явной и review-friendly;
- matrix остаётся независимой от implementation checklist;
- финальная приёмка не смешивается с design и tasks.

Предпочтительное размещение:
- `openspec/changes/verify-full-test-assignment-compliance/acceptance-matrix.md`
- `openspec/changes/verify-full-test-assignment-compliance/final-acceptance-checklist.md`

### 8. Minimal cross-browser smoke ограничивается Chromium и Firefox

Решение: минимальный cross-browser smoke для acceptance change выполняется в Chromium и Firefox. WebKit считается необязательным дополнительным прогоном и не является blocking requirement для этого test assignment.

Почему так:
- это даёт разумный минимум browser diversity без расползания scope;
- соответствует задаче minimal cross-browser verification;
- не превращает acceptance change в полноценную browser matrix программу.

## Risks / Trade-offs

- [Risk] Acceptance matrix превратится в длинный текст без практической пользы.  
  → Mitigation: использовать короткие, таблично-ориентированные строки с явной привязкой к конкретному коду, тесту или manual check.

- [Risk] Аудит найдёт больше gaps, чем удобно закрывать в одном change.  
  → Mitigation: фиксировать только реальные blockers для соответствия ТЗ; всё вторичное выносить как explicit follow-up, а не скрыто расширять scope.

- [Risk] Playwright coverage будет усилена слишком глубоко и начнёт дублировать unit tests.  
  → Mitigation: использовать Playwright только для browser-visible critical flows, а store/business-level детализацию оставлять unit tests.

- [Risk] Cross-browser verification может расползтись в широкую матрицу браузеров и платформ.  
  → Mitigation: ограничиться minimal smoke на критических сценариях в разумном наборе браузеров без CI-platform expansion.

- [Risk] Manual acceptance checklist начнёт повторять уже автоматизированные шаги.  
  → Mitigation: включать туда только residual human-facing подтверждения, которых нет смысла автоматизировать.

- [Risk] Acceptance audit потребует точечных UI hooks для надёжных e2e selectors.  
  → Mitigation: добавлять такие hooks только при реальной необходимости и только как e2e-friendly thin layer без business logic.

## Migration Plan

1. Сформировать acceptance matrix по всем требованиям ТЗ и инженерным ожиданиям.
2. Привязать к каждой строке существующий код, unit tests, Playwright coverage и потенциальный финальный manual pass.
3. Отметить реальные gaps и классифицировать их по типу: missing test, missing evidence, missing minimal UI hook, missing delivery proof.
4. Закрыть gaps минимальными изменениями в тестах или приложении.
5. Выполнить финальный automated verification: unit tests, Playwright, responsive/cross-browser smoke, Docker smoke.
6. Сформировать короткий финальный manual acceptance checklist.
7. Запустить verify change и архивировать change после подтверждения complete coverage.

Rollback strategy:
- если gap-fixing приводит к нежелательному расширению продукта, откатывать именно этот локальный change-set и возвращаться к audit matrix как единственному обязательному артефакту
- если часть acceptance proof не удаётся автоматизировать без scope creep, явно переносить её в final manual pass вместо усложнения приложения

## Open Questions

- Нужна ли acceptance matrix как Markdown table в одном файле, или удобнее зафиксировать её как структурированный checklist с одинаковыми полями на каждый requirement?
- Есть ли в исходном тексте ТЗ дополнительные формулировки по UI/UX consistency, которые стоит явно отразить в matrix как отдельные строки, а не как часть общего adaptive/responsive блока?
