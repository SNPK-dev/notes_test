import { createLocalStorageNotesRepository } from '~~/repositories/local-storage-notes.repository'

export default defineNuxtPlugin(() => {
  const notesRepository = createLocalStorageNotesRepository(window.localStorage)

  return {
    provide: {
      notesRepository,
    },
  }
})
