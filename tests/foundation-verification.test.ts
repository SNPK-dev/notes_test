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

describe('foundation verification', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('restores persisted notes after reload', async () => {
    const storage = new MemoryStorage()
    const note = createPersistedNote({
      id: 'note-1',
      title: 'Reload verification',
    })

    const firstRepository = new LocalStorageNotesRepository(storage)
    await firstRepository.save(note)

    const reloadedRepository = new LocalStorageNotesRepository(storage)
    activeRepository = reloadedRepository

    const notesStore = useNotesStore()
    await notesStore.hydrate()

    expect(await reloadedRepository.getAll()).toEqual([note])
    expect(notesStore.noteCount).toBe(1)
    expect(notesStore.getNoteById('note-1')).toEqual(note)
  })

  it('does not restore discarded draft after reload', async () => {
    const storage = new MemoryStorage()
    const note = createPersistedNote({
      id: 'note-2',
      title: 'Persisted source note',
      todos: [
        {
          id: 'todo-1',
          text: 'Persisted todo',
          completed: false,
        },
      ],
    })

    activeRepository = new LocalStorageNotesRepository(storage)
    await activeRepository.save(note)

    const notesStore = useNotesStore()
    await notesStore.hydrate()

    const editorStore = useNoteEditorStore()
    await editorStore.loadForRoute(note.id)

    editorStore.updateTitle('Unsaved draft title')
    editorStore.addTodo('Unsaved draft todo')

    expect(editorStore.isDirty).toBe(true)
    expect(editorStore.todoCount).toBe(2)

    editorStore.cancel()

    expect(editorStore.isDirty).toBe(false)
    expect(editorStore.draft?.title).toBe(note.title)
    expect(editorStore.todoCount).toBe(1)

    setActivePinia(createPinia())
    activeRepository = new LocalStorageNotesRepository(storage)

    const reloadedNotesStore = useNotesStore()
    await reloadedNotesStore.hydrate()

    const reloadedEditorStore = useNoteEditorStore()
    await reloadedEditorStore.loadForRoute(note.id)

    expect(reloadedEditorStore.draft?.title).toBe(note.title)
    expect(reloadedEditorStore.todoCount).toBe(1)
    expect(reloadedEditorStore.draft?.todos[0]?.text).toBe('Persisted todo')
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
