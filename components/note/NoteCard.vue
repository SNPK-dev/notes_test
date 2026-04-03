<script setup lang="ts">
import BaseButton from '~~/components/base/BaseButton.vue'

const props = defineProps<{
  id: string
  title: string
  summary?: string
  todoPreviewItems?: string[]
  updatedAtLabel: string
  to: string
  canDelete?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <article class="note-card">
    <div class="note-card__top">
      <h3 :title="title">{{ title }}</h3>

      <div v-if="updatedAtLabel" class="note-card__meta">
        <span>{{ updatedAtLabel }}</span>
      </div>
    </div>

    <ul
      v-if="todoPreviewItems?.length"
      class="note-card__todo-preview"
      aria-label="Список задач заметки"
    >
      <li v-for="item in todoPreviewItems" :key="item">
        {{ item }}
      </li>
    </ul>
    <p v-else-if="summary">{{ summary }}</p>

    <div class="note-card__actions">
      <NuxtLink :to="to" class="note-card__action"> Изменить </NuxtLink>

      <BaseButton
        v-if="canDelete"
        class="note-card__action"
        variant="ghost"
        type="button"
        @click="emit('remove', props.id)"
      >
        Удалить
      </BaseButton>
    </div>
  </article>
</template>
