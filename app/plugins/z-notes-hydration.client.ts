import { useNotesStore } from '~~/stores/notes.store'

export default defineNuxtPlugin(async () => {
  const notesStore = useNotesStore()

  await notesStore.hydrate()
})
