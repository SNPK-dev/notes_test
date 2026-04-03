<script setup lang="ts">
import NoteCard from '~~/components/note/NoteCard.vue'

defineProps<{
  notes: Array<{
    id: string
    title: string
    summary?: string
    todoPreviewItems?: string[]
    updatedAtLabel: string
    to: string
    canDelete?: boolean
  }>
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <div class="notes-grid" aria-label="Превью заметок">
    <NoteCard
      v-for="note in notes"
      :key="note.id"
      :id="note.id"
      :title="note.title"
      :summary="note.summary"
      :todo-preview-items="note.todoPreviewItems"
      :updated-at-label="note.updatedAtLabel"
      :to="note.to"
      :can-delete="note.canDelete"
      @remove="emit('remove', $event)"
    />
  </div>
</template>
