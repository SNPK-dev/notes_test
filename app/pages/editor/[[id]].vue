<script setup lang="ts">
import { computed, watch } from 'vue'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from 'vue-router'

import BaseButton from '~~/components/base/BaseButton.vue'
import NoteForm from '~~/components/note/NoteForm.vue'
import TodoEditorList from '~~/components/note/TodoEditorList.vue'
import { useConfirmDialog } from '~~/composables/useConfirmDialog'
import { useEditorKeyboardShortcuts } from '~~/composables/useEditorKeyboardShortcuts'
import { useModalStore } from '~~/stores/modal.store'
import { useNoteEditorStore } from '~~/stores/note-editor.store'

const route = useRoute()
const router = useRouter()
const editorStore = useNoteEditorStore()
const modalStore = useModalStore()
const { requestConfirmation, requestNotice } = useConfirmDialog()

const noteId = computed(() => {
  const param = route.params.id

  return Array.isArray(param) ? param[0] : param
})

const editorMode = computed(() => (noteId.value ? 'edit' : 'create'))
const isMissingExistingNote = computed(
  () =>
    editorMode.value === 'edit' && !editorStore.isLoading && !editorStore.draft,
)
const shortcutsEnabled = computed(
  () => route.path.startsWith('/editor') && !modalStore.isOpen,
)
let pendingNavigationConfirmation: Promise<boolean> | null = null

watch(
  noteId,
  async (value) => {
    await editorStore.loadForRoute(value)
  },
  { immediate: true },
)

async function handleSave() {
  const savedNote = await editorStore.save()

  if (!savedNote) {
    return
  }

  if (editorMode.value === 'create') {
    await router.replace(`/editor/${savedNote.id}`)
  }

  await requestNotice({
    title: 'Сохранено',
    description:
      'Заметка успешно сохранена. Можно продолжить редактирование или вернуться к списку.',
    confirmLabel: 'Понятно',
    tone: 'danger',
  })
}

async function handleCancel() {
  if (!editorStore.isDirty) {
    editorStore.cancel()
    return
  }

  const isConfirmed = await requestConfirmation({
    title: 'Отменить несохранённые изменения?',
    description:
      'Черновик будет сброшен до последнего сохранённого состояния. Несохранённые изменения пропадут.',
    confirmLabel: 'Сбросить черновик',
    cancelLabel: 'Продолжить редактирование',
    tone: 'danger',
  })

  if (isConfirmed) {
    editorStore.cancel()
  }
}

async function handleDelete() {
  const isConfirmed = await requestConfirmation({
    title: 'Удалить заметку?',
    description:
      'Заметка будет удалена из сохранённых данных. Это действие нельзя отменить через текущий интерфейс.',
    confirmLabel: 'Удалить заметку',
    cancelLabel: 'Оставить заметку',
    tone: 'danger',
  })

  if (!isConfirmed) {
    return
  }

  const deleted = await editorStore.removeCurrent()

  if (deleted) {
    await router.push('/')
  }
}

async function confirmEditorNavigation(): Promise<boolean> {
  if (!editorStore.isDirty) {
    return true
  }

  if (pendingNavigationConfirmation) {
    return pendingNavigationConfirmation
  }

  pendingNavigationConfirmation = requestConfirmation({
    title: 'Покинуть редактор?',
    description:
      'Несохранённые изменения будут сброшены. Подтверди переход, если хочешь отказаться от текущего черновика.',
    confirmLabel: 'Покинуть редактор',
    cancelLabel: 'Остаться в редакторе',
    tone: 'danger',
  })
    .then((isConfirmed) => {
      if (isConfirmed) {
        editorStore.cancel()
      }

      return isConfirmed
    })
    .finally(() => {
      pendingNavigationConfirmation = null
    })

  return pendingNavigationConfirmation
}

onBeforeRouteLeave(async (_to, from) => {
  if (!from.path.startsWith('/editor')) {
    return true
  }

  return confirmEditorNavigation()
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.fullPath === from.fullPath) {
    return true
  }

  return confirmEditorNavigation()
})

useEditorKeyboardShortcuts({
  enabled: shortcutsEnabled,
  onSave: handleSave,
  onUndo: editorStore.requestUndo,
  onRedo: editorStore.requestRedo,
  onCancel: handleCancel,
})
</script>

<template>
  <section class="page">
    <div class="editor-card">
      <p v-if="editorStore.isLoading" class="editor-empty-state">
        Загружаем сохранённую заметку и подготавливаем черновик...
      </p>

      <p v-else-if="isMissingExistingNote" class="editor-empty-state">
        Заметка с таким идентификатором не найдена. Можно вернуться к списку или
        создать новую.
      </p>

      <template v-else-if="editorStore.draft">
        <NoteForm
          :title="editorStore.draft.title"
          :mode="editorMode"
          :is-dirty="editorStore.isDirty"
          @update:title="editorStore.updateTitle($event)"
          @add-todo="editorStore.addTodo()"
        />

        <TodoEditorList
          :todos="editorStore.draft.todos"
          @toggle="editorStore.toggleTodo($event)"
          @update:text="editorStore.updateTodoText($event.id, $event.text)"
          @remove="editorStore.removeTodo($event)"
        />

        <section class="editor-panel">
          <div class="editor-panel__actions editor-panel__actions--footer">
            <BaseButton :disabled="editorStore.isSaving" @click="handleSave()">
              {{ editorStore.isSaving ? 'Сохраняем...' : 'Сохранить заметку' }}
            </BaseButton>
            <BaseButton
              variant="secondary"
              :disabled="!editorStore.canUndo"
              @click="editorStore.requestUndo()"
            >
              Отменить изменения
            </BaseButton>
            <BaseButton
              variant="secondary"
              :disabled="!editorStore.canRedo"
              @click="editorStore.requestRedo()"
            >
              Вернуть изменения
            </BaseButton>
            <BaseButton variant="ghost" @click="handleCancel()">
              Сбросить изменения
            </BaseButton>
            <BaseButton
              v-if="editorStore.isEditingExisting"
              variant="secondary"
              @click="handleDelete()"
            >
              Удалить заметку
            </BaseButton>
          </div>
        </section>
      </template>
    </div>
  </section>
</template>
