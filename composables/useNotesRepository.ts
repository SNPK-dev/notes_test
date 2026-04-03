import type { NotesRepository } from '~~/repositories/notes.repository'

export function useNotesRepository(): NotesRepository {
  return useNuxtApp().$notesRepository
}
