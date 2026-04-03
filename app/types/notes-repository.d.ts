import type { NotesRepository } from '~~/repositories/notes.repository'

declare module '#app' {
  interface NuxtApp {
    $notesRepository: NotesRepository
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $notesRepository: NotesRepository
  }
}

export {}
