<script setup lang="ts">
import BaseButton from '~~/components/base/BaseButton.vue'
import BaseCheckbox from '~~/components/base/BaseCheckbox.vue'
import BaseInput from '~~/components/base/BaseInput.vue'

defineProps<{
  todo: {
    id: string
    text: string
    completed: boolean
  }
}>()

const emit = defineEmits<{
  toggle: [id: string]
  'update:text': [{ id: string; text: string }]
  remove: [id: string]
}>()
</script>

<template>
  <li class="todo-item">
    <BaseCheckbox
      :model-value="todo.completed"
      label=""
      @update:model-value="emit('toggle', todo.id)"
    >
      <span class="sr-only">Отметить задачу</span>
    </BaseCheckbox>

    <BaseInput
      :model-value="todo.text"
      aria-label="Текст задачи"
      :id="`todo-${todo.id}`"
      placeholder="Что нужно сделать?"
      @update:model-value="emit('update:text', { id: todo.id, text: $event })"
    />

    <BaseButton variant="ghost" @click="emit('remove', todo.id)">
      Удалить
    </BaseButton>
  </li>
</template>
