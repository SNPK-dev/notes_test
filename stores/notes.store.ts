import { defineStore } from 'pinia'

import type { PersistedNote } from '~~/domain/note/types'
import { useNotesRepository } from '~~/composables/useNotesRepository'

type NotesState = {
  notes: PersistedNote[]
  isHydrated: boolean
  isHydrating: boolean
  lastLoadedAt: string | null
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: [],
    isHydrated: false,
    isHydrating: false,
    lastLoadedAt: null,
  }),

  getters: {
    noteCount: (state) => state.notes.length,
    notesSortedByUpdatedAt: (state) =>
      [...state.notes].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      ),
    getNoteById: (state) => (id: string) =>
      state.notes.find((note) => note.id === id) ?? null,
  },

  actions: {
    async hydrate(force = false): Promise<PersistedNote[]> {
      if (import.meta.server) {
        return this.notes
      }

      if (this.isHydrating) {
        return this.notes
      }

      if (this.isHydrated && !force) {
        return this.notes
      }

      this.isHydrating = true

      try {
        const repository = useNotesRepository()
        const notes = await repository.getAll()

        this.notes = notes
        this.isHydrated = true
        this.lastLoadedAt = new Date().toISOString()

        return this.notes
      } finally {
        this.isHydrating = false
      }
    },

    async refresh(): Promise<PersistedNote[]> {
      return this.hydrate(true)
    },

    upsertPersistedNote(note: PersistedNote): void {
      const existingIndex = this.notes.findIndex(
        (entry) => entry.id === note.id,
      )

      if (existingIndex >= 0) {
        this.notes.splice(existingIndex, 1, note)
      } else {
        this.notes.push(note)
      }
    },

    removePersistedNote(id: string): void {
      this.notes = this.notes.filter((note) => note.id !== id)
    },

    async removeNote(id: string): Promise<boolean> {
      const note = this.getNoteById(id)

      if (!note) {
        return false
      }

      const repository = useNotesRepository()

      await repository.remove(id)
      this.removePersistedNote(id)

      return true
    },
  },
})
