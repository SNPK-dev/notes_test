import type { ComputedRef, Ref } from 'vue'

type EditorShortcutOptions = {
  enabled: Ref<boolean> | ComputedRef<boolean>
  onSave: () => void | Promise<void>
  onUndo: () => void
  onRedo: () => void
  onCancel: () => void | Promise<void>
}

export function useEditorKeyboardShortcuts(options: EditorShortcutOptions) {
  const handler = async (event: KeyboardEvent) => {
    if (!options.enabled.value) {
      return
    }

    const key = event.key.toLowerCase()
    const hasModifier = event.ctrlKey || event.metaKey

    if (hasModifier && key === 's') {
      event.preventDefault()
      await options.onSave()
      return
    }

    if (hasModifier && key === 'z' && event.shiftKey) {
      event.preventDefault()
      options.onRedo()
      return
    }

    if (hasModifier && key === 'z') {
      event.preventDefault()
      options.onUndo()
      return
    }

    if (key === 'escape') {
      event.preventDefault()
      await options.onCancel()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handler)
  })
}
