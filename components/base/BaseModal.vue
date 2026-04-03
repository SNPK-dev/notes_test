<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import BaseButton from '~~/components/base/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'default' | 'danger'
    showCancel?: boolean
  }>(),
  {
    confirmLabel: 'Подтвердить',
    cancelLabel: 'Отмена',
    tone: 'default',
    showCancel: true,
  },
)

const emit = defineEmits<{
  confirm: []
  close: []
}>()

const surfaceRef = ref<HTMLElement | null>(null)
const titleId = `modal-title-${useId()}`
let previousActiveElement: Element | null = null

function focusFirstInteractiveElement() {
  const surface = surfaceRef.value

  if (!surface) {
    return
  }

  const focusableElements = getFocusableElements(surface)

  focusableElements[0]?.focus()
}

function trapFocus(event: KeyboardEvent) {
  if (!props.open || event.key !== 'Tab') {
    return
  }

  const surface = surfaceRef.value

  if (!surface) {
    return
  }

  const focusableElements = getFocusableElements(surface)

  if (!focusableElements.length) {
    return
  }

  const first = focusableElements[0]
  const last = focusableElements[focusableElements.length - 1]
  const activeElement = document.activeElement

  if (!first || !last) {
    return
  }

  if (event.shiftKey && activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  trapFocus(event)
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previousActiveElement = document.activeElement
      await nextTick()
      focusFirstInteractiveElement()
      window.addEventListener('keydown', handleKeydown)
      return
    }

    window.removeEventListener('keydown', handleKeydown)
    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus()
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled'))
}
</script>

<template>
  <div
    v-if="open"
    class="base-modal"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <div class="base-modal__backdrop" @click="$emit('close')" />
    <div ref="surfaceRef" class="base-modal__surface">
      <header class="base-modal__header">
        <h2 :id="titleId">{{ title }}</h2>
        <BaseButton variant="ghost" @click="emit('close')">
          Закрыть
        </BaseButton>
      </header>
      <div class="base-modal__body">
        <slot />
      </div>
      <footer class="base-modal__actions">
        <BaseButton v-if="showCancel" variant="ghost" @click="emit('close')">
          {{ cancelLabel }}
        </BaseButton>
        <BaseButton
          :variant="tone === 'danger' ? 'primary' : 'secondary'"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </BaseButton>
      </footer>
    </div>
  </div>
</template>
