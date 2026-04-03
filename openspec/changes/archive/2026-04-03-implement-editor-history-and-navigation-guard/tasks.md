## 1. Editor history в store

- [x] 1.1 Расширить `useNoteEditorStore` полями `undoStack`, `redoStack`, `canUndo`, `canRedo` и внутренними snapshot helper-функциями для `NoteDraft`
- [x] 1.2 Подключить запись history к note-level и todo-level mutating actions, не затрагивая repository contract и persisted payload
- [x] 1.3 Обновить `loadForRoute`, `startCreateDraft`, `save`, `cancel` и `removeCurrent`, чтобы baseline-changing transitions очищали history и пересобирали editor session
- [x] 1.4 Реализовать реальные `requestUndo` и `requestRedo` поверх store history с восстановлением `draft` и корректным переключением stack state

## 2. Editor actions и keyboard contract

- [x] 2.1 Подключить editor UI и `useEditorKeyboardShortcuts` к реальным `undo`/`redo` действиям store без переноса history-логики в компоненты
- [x] 2.2 Обновить editor page так, чтобы действия undo/redo и их доступность отображались через store-driven contract, а не через foundation placeholder
- [x] 2.3 Добавить проверяемые store/unit сценарии для note-level undo/redo, todo-level undo/redo и очистки history после save/cancel

## 3. Navigation guard для dirty editor

- [x] 3.1 Добавить editor-scoped route leave guard, который перехватывает уход со страницы редактора и смену editor route при `isDirty = true`
- [x] 3.2 Переиспользовать существующий modal confirmation flow для подтверждения discard при navigation away from editor и сохранить uninterrupted navigation при clean draft
- [x] 3.3 Добавить проверяемые сценарии для подтверждённой и отменённой навигации, чтобы dirty draft либо discard-ился, либо сохранялся на текущем route

## 4. Verification и Docker smoke

- [x] 4.1 Расширить verification сценарии проверкой, что reload не восстанавливает transient history и не нарушает persisted note state
- [x] 4.2 Выполнить manual verification для undo/redo, route leave guard и navigation confirmation на editor page
- [x] 4.3 Выполнить Docker smoke-check (`docker compose build`, `docker compose up`) на машине с работающим Docker engine и зафиксировать результат без расширения инфраструктуры
