import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import {
  createDraftFromPersistedNote,
  createEmptyNoteDraft,
  mapDraftToPersistedNote,
} from '~~/domain/note/mappers'
import type { NoteDraft, PersistedNote } from '~~/domain/note/types'
import { useNotesRepository } from '~~/composables/useNotesRepository'
import { useNotesStore } from '~~/stores/notes.store'

type NoteEditorState = {
  sourceNote: PersistedNote | null
  draft: NoteDraft | null
  baselineDraft: NoteDraft | null
  undoStack: NoteDraft[]
  redoStack: NoteDraft[]
  activeNoteId: string | null
  isLoading: boolean
  isSaving: boolean
  lastLoadedAt: string | null
  lastSavedAt: string | null
}

export const useNoteEditorStore = defineStore('note-editor', {
  state: (): NoteEditorState => ({
    sourceNote: null,
    draft: null,
    baselineDraft: null,
    undoStack: [],
    redoStack: [],
    activeNoteId: null,
    isLoading: false,
    isSaving: false,
    lastLoadedAt: null,
    lastSavedAt: null,
  }),

  getters: {
    isReady: (state) => state.draft !== null,
    isEditingExisting: (state) => Boolean(state.sourceNote),
    isDirty: (state) => !areDraftsEqual(state.draft, state.baselineDraft),
    canUndo: (state) => state.undoStack.length > 0,
    canRedo: (state) => state.redoStack.length > 0,
    todoCount: (state) => state.draft?.todos.length ?? 0,
  },

  actions: {
    async loadForRoute(noteId?: string | null): Promise<PersistedNote | null> {
      this.isLoading = true

      try {
        if (!noteId) {
          this.startCreateDraft()
          return null
        }

        const notesStore = useNotesStore()

        if (!notesStore.isHydrated) {
          await notesStore.hydrate()
        }

        let note = notesStore.getNoteById(noteId)

        if (!note) {
          const repository = useNotesRepository()
          note = await repository.getById(noteId)

          if (note) {
            notesStore.upsertPersistedNote(note)
          }
        }

        this.setSourceNote(note)

        return note
      } finally {
        this.isLoading = false
        this.lastLoadedAt = new Date().toISOString()
      }
    },

    startCreateDraft(): void {
      const emptyDraft = createEmptyNoteDraft(new Date().toISOString())

      this.startDraftSession(emptyDraft, null, null)
    },

    updateTitle(title: string): void {
      if (!this.draft) {
        return
      }

      if (this.draft.title === title) {
        return
      }

      this.pushUndoSnapshot()
      this.draft.title = title
    },

    addTodo(text = ''): void {
      if (!this.draft) {
        return
      }

      this.pushUndoSnapshot()
      this.draft.todos.push({
        id: uuidv4(),
        text,
        completed: false,
      })
    },

    updateTodoText(todoId: string, text: string): void {
      const todo = this.findDraftTodo(todoId)

      if (!todo) {
        return
      }

      if (todo.text === text) {
        return
      }

      this.pushUndoSnapshot()
      todo.text = text
    },

    toggleTodo(todoId: string): void {
      const todo = this.findDraftTodo(todoId)

      if (!todo) {
        return
      }

      this.pushUndoSnapshot()
      todo.completed = !todo.completed
    },

    removeTodo(todoId: string): void {
      if (!this.draft) {
        return
      }

      const hasTodo = this.draft.todos.some((todo) => todo.id === todoId)

      if (!hasTodo) {
        return
      }

      this.pushUndoSnapshot()
      this.draft.todos = this.draft.todos.filter((todo) => todo.id !== todoId)
    },

    async save(): Promise<PersistedNote | null> {
      if (!this.draft) {
        return null
      }

      this.isSaving = true

      try {
        const repository = useNotesRepository()
        const notesStore = useNotesStore()
        const nowIso = new Date().toISOString()

        const identity = this.sourceNote
          ? {
              id: this.sourceNote.id,
              createdAt: this.sourceNote.createdAt,
              updatedAt: nowIso,
            }
          : {
              id: uuidv4(),
              createdAt: nowIso,
              updatedAt: nowIso,
            }

        const persistedNote = mapDraftToPersistedNote(this.draft, identity)
        const savedNote = await repository.save(persistedNote)

        notesStore.upsertPersistedNote(savedNote)
        this.setSourceNote(savedNote)
        this.lastSavedAt = nowIso

        return savedNote
      } finally {
        this.isSaving = false
      }
    },

    cancel(): void {
      if (this.sourceNote) {
        const restoredDraft = createDraftFromPersistedNote(this.sourceNote)

        this.startDraftSession(
          restoredDraft,
          this.sourceNote,
          this.sourceNote.id,
        )
        return
      }

      this.startCreateDraft()
    },

    async removeCurrent(): Promise<boolean> {
      if (!this.sourceNote) {
        return false
      }

      const noteId = this.sourceNote.id
      const repository = useNotesRepository()
      const notesStore = useNotesStore()

      await repository.remove(noteId)
      notesStore.removePersistedNote(noteId)
      this.reset()

      return true
    },

    requestUndo(): boolean {
      if (!this.draft || this.undoStack.length === 0) {
        return false
      }

      const previousDraft = this.undoStack.at(-1)

      if (!previousDraft) {
        return false
      }

      this.undoStack = this.undoStack.slice(0, -1)
      this.redoStack = [...this.redoStack, cloneDraft(this.draft)]
      this.draft = cloneDraft(previousDraft)

      return true
    },

    requestRedo(): boolean {
      if (!this.draft || this.redoStack.length === 0) {
        return false
      }

      const nextDraft = this.redoStack.at(-1)

      if (!nextDraft) {
        return false
      }

      this.redoStack = this.redoStack.slice(0, -1)
      this.undoStack = [...this.undoStack, cloneDraft(this.draft)]
      this.draft = cloneDraft(nextDraft)

      return true
    },

    reset(): void {
      this.sourceNote = null
      this.draft = null
      this.baselineDraft = null
      this.undoStack = []
      this.redoStack = []
      this.activeNoteId = null
      this.isLoading = false
      this.isSaving = false
      this.lastLoadedAt = null
      this.lastSavedAt = null
    },

    setSourceNote(note: PersistedNote | null): void {
      if (!note) {
        this.reset()
        return
      }

      const draft = createDraftFromPersistedNote(note)

      this.startDraftSession(draft, note, note.id)
    },

    clearHistory(): void {
      this.undoStack = []
      this.redoStack = []
    },

    pushUndoSnapshot(): void {
      if (!this.draft) {
        return
      }

      const snapshot = cloneDraft(this.draft)
      const previousSnapshot = this.undoStack.at(-1)

      if (previousSnapshot && areDraftsEqual(previousSnapshot, snapshot)) {
        return
      }

      this.undoStack = [...this.undoStack, snapshot]
      this.redoStack = []
    },

    startDraftSession(
      draft: NoteDraft,
      sourceNote: PersistedNote | null,
      activeNoteId: string | null,
    ): void {
      this.sourceNote = sourceNote
      this.activeNoteId = activeNoteId
      this.baselineDraft = cloneDraft(draft)
      this.draft = cloneDraft(draft)
      this.clearHistory()
    },

    findDraftTodo(todoId: string) {
      return this.draft?.todos.find((todo) => todo.id === todoId)
    },
  },
})

function cloneDraft(draft: NoteDraft): NoteDraft {
  return {
    ...draft,
    todos: draft.todos.map((todo) => ({ ...todo })),
  }
}

function areDraftsEqual(
  left: NoteDraft | null,
  right: NoteDraft | null,
): boolean {
  if (!left && !right) {
    return true
  }

  if (!left || !right) {
    return false
  }

  return JSON.stringify(left) === JSON.stringify(right)
}
