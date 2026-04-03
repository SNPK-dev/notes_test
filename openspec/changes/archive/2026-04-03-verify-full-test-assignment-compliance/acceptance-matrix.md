## Acceptance Matrix

Ниже зафиксирована requirement-by-requirement matrix для текущего test assignment и инженерных ожиданий. Этот артефакт документирует только уже существующие доказательства и явные residual gaps. Закрытие gaps начинается только в section 2.

### Final Manual Acceptance Item Index

- `MA-01`: Открыть `/` и `/editor`, подтвердить two-page flow и навигацию через layout.
- `MA-02`: На `/` подтвердить, что список показывает только preview и не допускает inline editing.
- `MA-03`: Создать, сохранить, повторно открыть, изменить и удалить note через UI.
- `MA-04`: Добавить, изменить, переключить и удалить todo внутри editor page.
- `MA-05`: Проверить confirm flows для `cancel`, `delete` и editor leave; убедиться, что native dialogs не используются.
- `MA-06`: Проверить responsive behavior на mobile width и desktop width.
- `MA-07`: Выполнить короткий human-facing UX pass: читаемость, последовательность CTA, focus states, отсутствие визуально сломанного состояния.
- `MA-08`: Прогнать критический сценарий в дополнительном браузере для cross-browser smoke.
- `MA-09`: Выполнить `docker compose build` и `docker compose up`, убедиться, что приложение стартует.

### Functional Assignment Requirements

| Requirement / expectation | Implementation evidence | Unit test evidence | Playwright evidence | Final manual acceptance pass evidence | Current status | Residual gap |
| --- | --- | --- | --- | --- | --- | --- |
| `two-page flow` | `app/pages/index.vue`, `app/pages/editor/[[id]].vue`, `app/layouts/default.vue`, `app/app.vue` | Нет отдельного unit test на routing contract | `tests/e2e/assignment-acceptance.spec.ts` явно подтверждает две page entry points и навигацию `/ <-> /editor`; существующие `tests/e2e/editor-navigation-guard.spec.ts` и `tests/e2e/editor-history-reload.spec.ts` дополнительно проходят через editor routes | `MA-01` | `covered` | Существенных пробелов не видно |
| `notes CRUD` | `stores/note-editor.store.ts`, `stores/notes.store.ts`, `repositories/notes.repository.ts`, `repositories/local-storage-notes.repository.ts`, `app/pages/editor/[[id]].vue` | `tests/foundation-verification.test.ts` покрывает persisted note restore | `tests/e2e/assignment-acceptance.spec.ts` покрывает create, update, read-only list preview reopen и delete; `tests/e2e/editor-history-reload.spec.ts` подтверждает save/reload lifecycle | `MA-03` | `covered` | Существенных пробелов не видно |
| `todo CRUD` | `components/note/TodoEditorList.vue`, `components/note/TodoEditorItem.vue`, `stores/note-editor.store.ts` | `tests/editor-history.test.ts` теперь включает полный todo lifecycle с create/update/toggle/save/remove persistence proof | `tests/e2e/assignment-acceptance.spec.ts` покрывает browser-level create, update, toggle, save, reopen и remove | `MA-04` | `covered` | Существенных пробелов не видно |
| `read-only preview on list page` | `app/pages/index.vue`, `components/note/NotePreviewList.vue`, `components/note/NoteCard.vue` | Нет | `tests/e2e/assignment-acceptance.spec.ts` подтверждает, что list page показывает preview и не содержит editor controls или inline editing | `MA-02` | `covered` | Существенных пробелов не видно |
| `modal confirmations only` | `components/base/BaseModal.vue`, `components/base/GlobalModalHost.vue`, `stores/modal.store.ts`, `composables/useConfirmDialog.ts`, `app/pages/editor/[[id]].vue` | Нет отдельного unit test на modal-only policy | `tests/e2e/assignment-acceptance.spec.ts` покрывает delete/cancel/leave flows и проверяет отсутствие native dialogs; `tests/e2e/editor-navigation-guard.spec.ts` и `tests/e2e/editor-history-reload.spec.ts` подтверждают дополнительные confirm flows | `MA-05` | `covered` | Существенных пробелов не видно |
| `persistence after reload` | `repositories/local-storage-notes.repository.ts`, `app/plugins/notes-repository.client.ts`, `app/plugins/z-notes-hydration.client.ts`, `stores/notes.store.ts`, `stores/note-editor.store.ts` | `tests/foundation-verification.test.ts` | `tests/e2e/editor-history-reload.spec.ts` | `MA-03`, `MA-05` | `covered` | Существенных пробелов не видно; можно только усилить traceability формулировкой результата в verify |
| `undo/redo` | `stores/note-editor.store.ts`, `app/pages/editor/[[id]].vue`, `components/note/NoteForm.vue` | `tests/editor-history.test.ts` | `tests/e2e/editor-history-reload.spec.ts` | `MA-03` | `covered` | Существенных пробелов не видно |
| `route leave protection` | `app/pages/editor/[[id]].vue`, `stores/modal.store.ts`, `composables/useConfirmDialog.ts` | Нет отдельного unit test на router-level guard | `tests/e2e/editor-navigation-guard.spec.ts` | `MA-05` | `covered` | Unit-level router guard coverage отсутствует, но browser-level evidence уже достаточное |
| `Docker delivery` | `Dockerfile`, `docker-compose.yaml`, `package.json` (`build`, `test:e2e`) | Нет | Нет | `MA-09`; section 4 delivery evidence: `docker compose build` прошёл, `docker compose up` поднял контейнер, `docker compose ps` показал `Up`, `docker compose logs` содержал `Listening on http://0.0.0.0:3000`, HTTP `GET http://127.0.0.1:3000` вернул `200` | `covered` | Существенных пробелов не видно |

### Engineering Expectations

| Requirement / expectation | Implementation evidence | Unit test evidence | Playwright evidence | Final manual acceptance pass evidence | Current status | Residual gap |
| --- | --- | --- | --- | --- | --- | --- |
| `Nuxt 4` | `package.json` (`nuxt`), `nuxt.config.ts`, `app/app.vue`, `app/pages/*` | Нет | Косвенно: весь Playwright suite исполняется против собранного Nuxt app | `MA-01` | `covered` | Существенных пробелов не видно |
| `Composition API` | `app/pages/index.vue`, `app/pages/editor/[[id]].vue`, `app/layouts/default.vue`, `components/base/BaseInput.vue`, `components/base/BaseModal.vue`, `components/note/NoteForm.vue` используют `script setup` и Composition API primitives | Нет отдельного unit test именно на выбор API-подхода | Косвенно: browser behavior строится поверх Composition API components | `MA-07` | `covered` | Существенных пробелов не видно в рамках текущего acceptance scope |
| `TypeScript` | `package.json`, `nuxt.config.ts` (`typescript.strict`), `stores/*.ts`, `repositories/*.ts`, `domain/note/types.ts` | Косвенно: unit tests компилируют TypeScript modules | Косвенно | Нет отдельного manual item не нужен | `covered` | Существенных пробелов не видно |
| `Pinia/state manager` | `package.json` (`@pinia/nuxt`, `pinia`), `nuxt.config.ts`, `stores/notes.store.ts`, `stores/note-editor.store.ts`, `stores/modal.store.ts` | `tests/foundation-verification.test.ts`, `tests/editor-history.test.ts` | Косвенно через browser behavior поверх store-driven UI | `MA-03` | `covered` | Существенных пробелов не видно |
| `SCSS/SASS` | `package.json` (`sass`), `nuxt.config.ts` (`css`), `app/assets/styles/main.scss` | Нет | Нет | `final-acceptance-checklist.md` подтверждает итоговый human-facing presentation pass на desktop/mobile | `covered` | Автоматизация здесь intentionally не требуется сверх текущего responsive smoke |
| `reusable components` | `components/base/BaseButton.vue`, `components/base/BaseInput.vue`, `components/base/BaseCheckbox.vue`, `components/base/BaseModal.vue`, `components/note/*` | Нет отдельного unit test на component reusability | Косвенно через reusable UI in e2e flows | `final-acceptance-checklist.md` оставляет только human-facing проверку целостности presentation layer | `covered` | Существенных пробелов не видно в рамках acceptance scope |
| `adaptive behavior` | `app/assets/styles/main.scss` (`@media (max-width: 720px)`), responsive layout classes in `app/layouts/default.vue`, `components/note/NoteForm.vue` | Нет | `tests/e2e/assignment-acceptance.spec.ts` содержит minimal responsive smoke на mobile и desktop width | `MA-06` | `covered` | Существенных пробелов не видно в рамках текущего smoke scope |
| `cross-browser-safe behavior` | Семантическая HTML-структура, стандартные inputs/buttons, CSS без экзотических API в `app/assets/styles/main.scss`, `components/base/*` | Нет | `playwright.config.ts` запускает `chromium` и `firefox`; весь black-box suite, включая `tests/e2e/assignment-acceptance.spec.ts`, проходит в обоих браузерах | `MA-08` | `covered` | Полная browser matrix intentionally out of scope, но minimal cross-browser smoke закрыт |
| `SSR-safe repository separation` | `nuxt.config.ts` (`ssr: false`, но архитектура остаётся SSR-safe), `app/plugins/notes-repository.client.ts`, `app/plugins/z-notes-hydration.client.ts`, `repositories/notes.repository.ts`, `repositories/local-storage-notes.repository.ts`, `stores/notes.store.ts` (`import.meta.server`) | `tests/foundation-verification.test.ts` косвенно подтверждает repository/store boundary | Нет отдельного browser-level test на architectural separation | `MA-07` | `covered` | Существенных пробелов не видно на уровне текущего assignment scope |
| `UI/UX consistency` | `app/assets/styles/main.scss`, `app/layouts/default.vue`, `components/base/*`, `components/note/*`, `components/base/BaseModal.vue` | Нет | Косвенно: e2e flows проходят через единый UI contract | `final-acceptance-checklist.md` содержит один короткий UX pass без дублирования automated scenarios | `covered` | Существенных пробелов не видно |

## Summary of Current Traceability

- `covered`: `two-page flow`, `notes CRUD`, `todo CRUD`, `read-only preview on list page`, `modal confirmations only`, `persistence after reload`, `undo/redo`, `route leave protection`, `Docker delivery`, `Nuxt 4`, `Composition API`, `TypeScript`, `Pinia/state manager`, `SCSS/SASS`, `reusable components`, `adaptive behavior`, `cross-browser-safe behavior`, `SSR-safe repository separation`, `UI/UX consistency`
- `partial`: нет
- `gap-documented`: нет

## Notes for Section 2

- Section 3 закрыл все automation gaps из классификации section 2 без добавления новых product features или архитектурных изменений.
- После расширения `playwright.config.ts` и black-box e2e suite minimal cross-browser smoke теперь подтверждён в `chromium` и `firefox`.

## Gap Classification

| Requirement / expectation | Classified gap | Classification | Why this is a real visible gap |
| --- | --- | --- | --- |
| `two-page flow` | Нет отдельного browser-level доказательства, что acceptance ограничен ровно двумя основными page entry points | `missing Playwright coverage` | В матрице есть только косвенное e2e evidence через другие editor flows |
| `notes CRUD` | Нет automated proof для note delete как части полного CRUD | `missing Playwright coverage` | Текущий e2e покрывает create/save/update, но не delete |
| `todo CRUD` | Нет browser-level покрытия полного todo CRUD | `missing Playwright coverage` | В матрице прямо зафиксировано отсутствие отдельного e2e на todo CRUD |
| `todo CRUD` | Unit evidence не подтверждает полный lifecycle, включая remove/save | `missing unit test` | Существующий `editor-history.test.ts` покрывает history-oriented add/update/toggle, но не полный CRUD proof |
| `read-only preview on list page` | Нет automated подтверждения read-only contract списка | `missing Playwright coverage` | В матрице нет unit/e2e evidence для запрета inline editing на `/` |
| `modal confirmations only` | Нет automated proof для delete confirmation и общего policy "только modal, без native dialogs" | `missing Playwright coverage` | Текущие e2e подтверждают только часть confirm flows |
| `Docker delivery` | Нет отдельного зафиксированного delivery artifact, связанного с acceptance matrix | `missing delivery proof` | В матрице есть code/manual evidence, но нет текущего acceptance-level proof entry |
| `adaptive behavior` | Нет automated responsive smoke для критических flows | `missing responsive/cross-browser smoke` | В матрице зафиксирован только код и manual item `MA-06` |
| `cross-browser-safe behavior` | Нет evidence за пределами Chromium | `missing responsive/cross-browser smoke` | `playwright.config.ts` сейчас запускает только `chromium` |

## Section 3 Automation Targets

- `two-page flow`: закрыть отдельным black-box Playwright сценарием на переходы между `/` и `/editor`
- `notes CRUD`: закрыть Playwright-сценарием, который явно включает delete
- `todo CRUD`: закрыть сочетанием Playwright для browser-level CRUD и unit/store test для полного lifecycle
- `read-only preview on list page`: закрыть Playwright-проверкой read-only contract на `/`
- `modal confirmations only`: закрыть Playwright-проверками delete confirmation и отсутствия native confirm/alert в критических flows
- `adaptive behavior`: закрыть minimal responsive Playwright smoke на mobile width и desktop width
- `cross-browser-safe behavior`: закрыть minimal cross-browser smoke в Chromium и Firefox

## Items Remaining Code Or Manual Evidence Only

- `Nuxt 4`: должно остаться на уровне code/dependency evidence
- `Composition API`: должно остаться на уровне code/manual evidence
- `TypeScript`: должно остаться на уровне code/build evidence
- `Pinia/state manager`: достаточно code плюс существующих unit/store tests
- `SCSS/SASS`: достаточно code evidence и одного финального manual acceptance item `MA-06`
- `reusable components`: достаточно architectural/code evidence и финального UX pass `MA-07`
- `SSR-safe repository separation`: должно остаться на уровне code plus existing unit evidence
- `UI/UX consistency`: должно оставаться в одном финальном human-facing manual pass `MA-07`
- `Docker delivery`: не относится к section 3 automation и должен закрываться как delivery proof в section 4

## E2E-Friendly UI Hook Check

- На текущем этапе реальной необходимости в новых e2e-friendly UI hooks не найдено.
- Существующие роли, лейблы, видимый текст и маршруты выглядят достаточными для section 3 black-box automation.
- Возвращаться к thin UI hooks нужно только если при реализации section 3 окажется, что конкретный critical flow нельзя стабильно адресовать через DOM contract.

## Spec-Level Mismatch Check

- Реального spec-level mismatch между acceptance matrix и текущими main specs/archived change specs на этом этапе не найдено.
- Все выявленные проблемы относятся к неполноте доказательств, а не к обнаруженному поведенческому противоречию требованиям.
- Delta spec в section 2 не требуется.

## Delivery Evidence

- `npm test` -> `6/6 passed`
- `npm run build` -> успешно
- `npm run test:e2e` -> `28/28 passed`
- `docker compose build` -> успешно
- `docker compose up` -> контейнер стартовал успешно
- Подтверждение Docker runtime:
  - `docker compose ps` показал container status `Up`
  - `docker compose logs --tail 50` содержал `Listening on http://0.0.0.0:3000`
  - `Invoke-WebRequest http://127.0.0.1:3000` вернул `200`

## Final Manual Acceptance Scope

- `final-acceptance-checklist.md` оставляет только residual human-facing confirmation: visual integrity, readability, CTA clarity, focus states и короткий mobile/desktop UX pass.
- Checklist не повторяет note CRUD, todo CRUD, reload, history, route guard, modal regressions, responsive smoke, cross-browser smoke или delivery checks, потому что они уже доказаны automation или delivery evidence.
