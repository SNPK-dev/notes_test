import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PersistedNote } from '../domain/note/types'
import { LocalStorageNotesRepository } from '../repositories/local-storage-notes.repository'
import type { NotesRepository } from '../repositories/notes.repository'
import { useNoteEditorStore } from '../stores/note-editor.store'
import { useNotesStore } from '../stores/notes.store'

let activeRepository: NotesRepository

vi.mock('~~/composables/useNotesRepository', () => ({
  useNotesRepository: () => activeRepository,
}))

describe('editor history', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    activeRepository = new LocalStorageNotesRepository(new MemoryStorage())
  })

  it('tracks note-level undo and redo availability and clears redo after a new change', async () => {
    const note = createPersistedNote({
      id: 'note-title-history',
      title: 'Original title',
    })

    await seedPersistedNote(note)

    const editorStore = await loadEditorStoreFor(note.id)

    expect(editorStore.canUndo).toBe(false)
    expect(editorStore.canRedo).toBe(false)

    editorStore.updateTitle('Updated title')

    expect(editorStore.draft?.title).toBe('Updated title')
    expect(editorStore.canUndo).toBe(true)
    expect(editorStore.canRedo).toBe(false)

    expect(editorStore.requestUndo()).toBe(true)
    expect(editorStore.draft?.title).toBe('Original title')
    expect(editorStore.canUndo).toBe(false)
    expect(editorStore.canRedo).toBe(true)

    editorStore.updateTitle('Second title')

    expect(editorStore.draft?.title).toBe('Second title')
    expect(editorStore.canUndo).toBe(true)
    expect(editorStore.canRedo).toBe(false)
    expect(editorStore.requestRedo()).toBe(false)
  })

  it('tracks todo-level undo and redo scenarios through store history', async () => {
    const note = createPersistedNote({
      id: 'note-todo-history',
      title: 'Todo history',
      todos: [
        {
          id: 'todo-1',
          text: 'Persisted todo',
          completed: false,
        },
      ],
    })

    await seedPersistedNote(note)

    const editorStore = await loadEditorStoreFor(note.id)

    editorStore.updateTodoText('todo-1', 'Edited todo')
    expect(editorStore.draft?.todos[0]?.text).toBe('Edited todo')
    expect(editorStore.canUndo).toBe(true)

    expect(editorStore.requestUndo()).toBe(true)
    expect(editorStore.draft?.todos[0]?.text).toBe('Persisted todo')
    expect(editorStore.canRedo).toBe(true)

    expect(editorStore.requestRedo()).toBe(true)
    expect(editorStore.draft?.todos[0]?.text).toBe('Edited todo')

    editorStore.addTodo('Second todo')
    expect(editorStore.todoCount).toBe(2)

    expect(editorStore.requestUndo()).toBe(true)
    expect(editorStore.todoCount).toBe(1)
    expect(editorStore.canRedo).toBe(true)

    expect(editorStore.requestRedo()).toBe(true)
    expect(editorStore.todoCount).toBe(2)
  })

  it('clears history availability after save and cancel session resets', async () => {
    const note = createPersistedNote({
      id: 'note-reset-history',
      title: 'Reset history',
      todos: [
        {
          id: 'todo-1',
          text: 'Baseline todo',
          completed: false,
        },
      ],
    })

    await seedPersistedNote(note)

    const editorStore = await loadEditorStoreFor(note.id)

    editorStore.updateTitle('Changed before save')
    expect(editorStore.canUndo).toBe(true)

    await editorStore.save()
    expect(editorStore.canUndo).toBe(false)
    expect(editorStore.canRedo).toBe(false)

    editorStore.toggleTodo('todo-1')
    expect(editorStore.canUndo).toBe(true)

    editorStore.cancel()
    expect(editorStore.canUndo).toBe(false)
    expect(editorStore.canRedo).toBe(false)
    expect(editorStore.draft?.todos[0]?.completed).toBe(false)
  })

  it('covers full todo CRUD lifecycle at store level including save and remove persistence', async () => {
    const editorStore = useNoteEditorStore()

    editorStore.startCreateDraft()
    expect(editorStore.todoCount).toBe(0)

    editorStore.addTodo('Первый пункт')
    expect(editorStore.todoCount).toBe(1)

    const createdTodoId = editorStore.draft?.todos[0]?.id
    expect(createdTodoId).toBeTruthy()

    if (!createdTodoId) {
      throw new Error('Expected created todo id')
    }

    editorStore.updateTodoText(createdTodoId, 'Обновлённый пункт')
    editorStore.toggleTodo(createdTodoId)

    expect(editorStore.draft?.todos[0]).toMatchObject({
      text: 'Обновлённый пункт',
      completed: true,
    })

    const savedNote = await editorStore.save()
    expect(savedNote?.todos).toHaveLength(1)
    expect(savedNote?.todos[0]).toMatchObject({
      text: 'Обновлённый пункт',
      completed: true,
    })

    if (!savedNote) {
      throw new Error('Expected saved note')
    }

    const persistedBeforeRemove = await activeRepository.getById(savedNote.id)
    expect(persistedBeforeRemove?.todos).toHaveLength(1)

    editorStore.removeTodo(createdTodoId)
    expect(editorStore.todoCount).toBe(0)

    const resavedNote = await editorStore.save()
    expect(resavedNote?.todos).toHaveLength(0)

    const persistedAfterRemove = await activeRepository.getById(savedNote.id)
    expect(persistedAfterRemove?.todos).toHaveLength(0)
  })
})

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>()

  get length(): number {
    return this.map.size
  }

  clear(): void {
    this.map.clear()
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
}

function createPersistedNote(
  overrides: Partial<PersistedNote> & Pick<PersistedNote, 'id' | 'title'>,
): PersistedNote {
  const nowIso = '2026-04-02T12:00:00.000Z'

  return {
    id: overrides.id,
    title: overrides.title,
    todos: overrides.todos ?? [],
    createdAt: overrides.createdAt ?? nowIso,
    updatedAt: overrides.updatedAt ?? nowIso,
  }
}

async function seedPersistedNote(note: PersistedNote) {
  await activeRepository.save(note)
}

async function loadEditorStoreFor(noteId: string) {
  const notesStore = useNotesStore()
  await notesStore.hydrate()

  const editorStore = useNoteEditorStore()
  await editorStore.loadForRoute(noteId)

  return editorStore
}
