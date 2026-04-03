<script setup lang="ts">
import TodoEditorItem from '~~/components/note/TodoEditorItem.vue'

defineProps<{
  todos: Array<{
    id: string
    text: string
    completed: boolean
  }>
}>()

const emit = defineEmits<{
  toggle: [id: string]
  'update:text': [{ id: string; text: string }]
  remove: [id: string]
}>()
</script>

<template>
  <section class="editor-panel">
    <div class="editor-panel__header">
      <div>
        <h3>Список задач</h3>
      </div>
      <span class="editor-panel__status">
        {{ todos.length }} {{ todos.length === 1 ? 'элемент' : 'элементов' }}
      </span>
    </div>

    <ul v-if="todos.length" class="todo-list">
      <TodoEditorItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="emit('toggle', $event)"
        @update:text="emit('update:text', $event)"
        @remove="emit('remove', $event)"
      />
    </ul>

    <p v-else class="editor-empty-state">
      У этой заметки пока нет задач, добавьте первую с помощью кнопки выше.
    </p>
  </section>
</template>
