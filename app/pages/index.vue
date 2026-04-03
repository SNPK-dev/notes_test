<script setup lang="ts">
import { computed } from 'vue'

import NotePreviewList from '~~/components/note/NotePreviewList.vue'
import { useConfirmDialog } from '~~/composables/useConfirmDialog'
import { useNotesStore } from '~~/stores/notes.store'

const notesStore = useNotesStore()
const { requestConfirmation } = useConfirmDialog()

const previewNotes = computed(() => {
  if (!notesStore.notesSortedByUpdatedAt.length) {
    return [
      {
        id: 'foundation',
        title: 'Пока нет сохранённых заметок',
        summary:
          'Создай первую заметку на странице редактора, и после сохранения она появится здесь.',
        updatedAtLabel: '',
        to: '/editor',
        canDelete: false,
      },
    ]
  }

  return notesStore.notesSortedByUpdatedAt.map((note) => ({
    id: note.id,
    title: note.title || 'Без названия',
    todoPreviewItems: note.todos
      .slice(0, 2)
      .map((todo) => todo.text.trim() || 'Без текста'),
    summary: note.todos.length > 0 ? undefined : 'У заметки пока нет задач.',
    updatedAtLabel: new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(note.updatedAt)),
    to: `/editor/${note.id}`,
    canDelete: true,
  }))
})

async function handleRemoveNote(noteId: string) {
  const note = notesStore.getNoteById(noteId)

  if (!note) {
    return
  }

  const confirmed = await requestConfirmation({
    title: 'Удалить заметку?',
    description: `Заметка "${note.title || 'Без названия'}" будет удалена без возможности восстановления.`,
    confirmLabel: 'Удалить заметку',
    cancelLabel: 'Оставить заметку',
    tone: 'danger',
  })

  if (!confirmed) {
    return
  }

  await notesStore.removeNote(noteId)
}
</script>

<template>
  <section class="page">
    <NotePreviewList :notes="previewNotes" @remove="handleRemoveNote" />
  </section>
</template>
