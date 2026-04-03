<script setup lang="ts">
import BaseButton from '~~/components/base/BaseButton.vue'
import BaseInput from '~~/components/base/BaseInput.vue'

defineProps<{
  title: string
  mode: 'create' | 'edit'
  isDirty: boolean
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  addTodo: []
}>()
</script>

<template>
  <section class="editor-panel">
    <div class="editor-panel__header">
      <div>
        <h3>
          {{ mode === 'create' ? 'Новая заметка' : 'Редактирование заметки' }}
        </h3>
      </div>
      <span class="editor-panel__status">
        {{
          isDirty
            ? 'Статус: Есть несохранённые изменения'
            : 'Статус: Синхронизировано'
        }}
      </span>
    </div>

    <BaseInput
      label="Заголовок заметки"
      :model-value="title"
      placeholder="Например, План релиза"
      required
      @update:model-value="emit('update:title', $event)"
    />

    <div class="editor-panel__actions">
      <BaseButton variant="secondary" @click="emit('addTodo')">
        Добавить задачу
      </BaseButton>
    </div>
  </section>
</template>
