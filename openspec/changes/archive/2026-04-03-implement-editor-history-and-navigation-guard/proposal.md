## Why

Текущий foundation для Notes SPA уже готов: архитектурные границы между domain, repository, stores и UI зафиксированы, persistence работает, editor state отделён от persisted state, а modal и keyboard infrastructure подготовлены. Однако тестовое задание всё ещё не закрыто полностью, потому что два обязательных пользовательских сценария остаются незавершёнными: реальный undo/redo для редактора заметки и защита от потери несохранённых изменений при уходе со страницы редактора.

Из-за этого пользователь может потерять draft при навигации, а сочетания `Ctrl/Cmd + Z` и `Shift + Ctrl/Cmd + Z` пока существуют только как зарезервированные entry points без фактического поведения. Это нужно исправить сейчас, пока editor store и keyboard contract ещё компактны и не обросли дополнительной логикой.

## What Changes

- Реализовать реальный history-механизм для editor draft, чтобы `undo` и `redo` работали для note-level и todo-level изменений.
- Подключить `Ctrl/Cmd + Z` и `Shift + Ctrl/Cmd + Z` к реальной history-логике редактора.
- Добавить route leave guard для editor page, который перехватывает уход со страницы при наличии несохранённых изменений.
- Подключить confirm-flow при навигации away from editor с dirty state, используя уже существующий modal controller.
- Зафиксировать поведение при переходе на список и смене route внутри приложения при наличии несохранённых изменений.
- Подтвердить, что reload не восстанавливает transient history и не нарушает persisted state.
- Подтвердить Docker smoke-check на машине с работающим Docker engine.
- Явно ограничить scope: в change не входят toast-уведомления, расширенная e2e-инфраструктура, новые продуктовые фичи заметок, rich-text, search, tags, attachments и backend.

## Capabilities

### New Capabilities
- `editor-history`: пользователь может отменять и повторять изменения редактора заметки через UI и keyboard shortcuts без потери консистентности draft state.
- `editor-navigation-guard`: пользователь получает защиту от случайной потери несохранённых изменений при уходе со страницы редактора.

### Modified Capabilities
- `notes-app-foundation`: поведение editor page расширяется route leave guard и полноценным handling для dirty-state navigation.
- `notes-ui-foundation`: keyboard shortcuts редактора перестают быть зарезервированными и получают реальную поведенческую реализацию для undo/redo.
- `notes-persistence`: reload-поведение уточняется так, чтобы transient editor history не восстанавливалась после перезагрузки, а persisted note state оставался единственным источником восстановленных данных.

## Impact

- Будут затронуты `useNoteEditorStore`, keyboard shortcuts infrastructure, modal confirm-flow и editor page navigation behavior.
- Появится history state для editor draft и правила синхронизации между draft, baseline и persisted state.
- Будут изменены существующие foundation specs, связанные с editor behavior, shortcuts и navigation safety.
- В поставке появится подтверждённая Docker smoke-проверка на рабочем окружении.