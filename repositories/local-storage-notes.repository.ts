import {
  mapNoteToPersistedNote,
  mapPersistedNoteDtoToNote,
} from '~~/domain/note/mappers'
import { persistedNotesCollectionSchema } from '~~/domain/note/schemas'
import type { PersistedNote } from '~~/domain/note/types'
import type { NotesRepository } from '~~/repositories/notes.repository'

const DEFAULT_STORAGE_KEY = 'notes-spa.notes'

export class LocalStorageNotesRepository implements NotesRepository {
  constructor(
    private readonly storage: Storage,
    private readonly storageKey = DEFAULT_STORAGE_KEY,
  ) {}

  async getAll(): Promise<PersistedNote[]> {
    return this.readCollection()
  }

  async getById(id: string): Promise<PersistedNote | null> {
    const notes = await this.getAll()

    return notes.find((note) => note.id === id) ?? null
  }

  async save(note: PersistedNote): Promise<PersistedNote> {
    const notes = await this.getAll()
    const nextNote = mapNoteToPersistedNote(note)
    const existingIndex = notes.findIndex((entry) => entry.id === nextNote.id)

    if (existingIndex >= 0) {
      notes[existingIndex] = nextNote
    } else {
      notes.push(nextNote)
    }

    this.writeCollection(notes)

    return nextNote
  }

  async remove(id: string): Promise<void> {
    const notes = await this.getAll()
    const nextNotes = notes.filter((note) => note.id !== id)

    if (nextNotes.length === notes.length) {
      return
    }

    this.writeCollection(nextNotes)
  }

  private readCollection(): PersistedNote[] {
    const rawValue = this.storage.getItem(this.storageKey)

    if (!rawValue) {
      return []
    }

    try {
      const parsedValue: unknown = JSON.parse(rawValue)
      const validated = persistedNotesCollectionSchema.safeParse(parsedValue)

      if (!validated.success) {
        console.warn(
          `[notes-repository] Invalid persisted payload for "${this.storageKey}". Falling back to empty collection.`,
          validated.error.flatten(),
        )

        return []
      }

      return validated.data.map((dto) =>
        mapNoteToPersistedNote(mapPersistedNoteDtoToNote(dto)),
      )
    } catch (error) {
      console.warn(
        `[notes-repository] Failed to parse persisted payload for "${this.storageKey}". Falling back to empty collection.`,
        error,
      )

      return []
    }
  }

  private writeCollection(notes: PersistedNote[]): void {
    this.storage.setItem(this.storageKey, JSON.stringify(notes))
  }
}

export function createLocalStorageNotesRepository(
  storage: Storage = window.localStorage,
  storageKey?: string,
): NotesRepository {
  return new LocalStorageNotesRepository(storage, storageKey)
}
