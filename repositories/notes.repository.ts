import type { PersistedNote } from '~~/domain/note/types'

export interface NotesRepository {
  getAll(): Promise<PersistedNote[]>
  getById(id: string): Promise<PersistedNote | null>
  save(note: PersistedNote): Promise<PersistedNote>
  remove(id: string): Promise<void>
}
