import { defineStore } from 'pinia'

type ConfirmationOptions = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
}

type NoticeOptions = {
  title: string
  description: string
  confirmLabel?: string
  tone?: 'default' | 'danger'
}

type ModalMode = 'confirm' | 'notice'

type ModalState = {
  isOpen: boolean
  mode: ModalMode
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  tone: 'default' | 'danger'
  resolver: ((value: boolean) => void) | null
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    isOpen: false,
    mode: 'confirm',
    title: '',
    description: '',
    confirmLabel: 'Подтвердить',
    cancelLabel: 'Отмена',
    tone: 'default',
    resolver: null,
  }),

  getters: {
    showCancelAction: (state) => state.mode === 'confirm',
  },

  actions: {
    requestConfirmation(options: ConfirmationOptions): Promise<boolean> {
      return this.openConfirmModal(options)
    },

    requestNotice(options: NoticeOptions): Promise<void> {
      return this.openNoticeModal(options)
    },

    confirm(): void {
      this.resolveAndReset(true)
    },

    cancel(): void {
      this.resolveAndReset(false)
    },

    dismiss(): void {
      this.resolveAndReset(this.mode === 'notice')
    },

    openConfirmModal(options: ConfirmationOptions): Promise<boolean> {
      this.resetExistingResolver(false)
      this.mode = 'confirm'
      this.isOpen = true
      this.title = options.title
      this.description = options.description
      this.confirmLabel = options.confirmLabel ?? 'Подтвердить'
      this.cancelLabel = options.cancelLabel ?? 'Отмена'
      this.tone = options.tone ?? 'default'

      return new Promise<boolean>((resolve) => {
        this.resolver = resolve
      })
    },

    openNoticeModal(options: NoticeOptions): Promise<void> {
      this.resetExistingResolver(true)
      this.mode = 'notice'
      this.isOpen = true
      this.title = options.title
      this.description = options.description
      this.confirmLabel = options.confirmLabel ?? 'Закрыть'
      this.cancelLabel = 'Закрыть'
      this.tone = options.tone ?? 'default'

      return new Promise<void>((resolve) => {
        this.resolver = (value) => {
          if (value) {
            resolve()
          }
        }
      })
    },

    resetExistingResolver(value: boolean): void {
      if (this.resolver) {
        this.resolver(value)
      }
    },

    resolveAndReset(result: boolean): void {
      this.resolver?.(result)
      this.isOpen = false
      this.mode = 'confirm'
      this.title = ''
      this.description = ''
      this.confirmLabel = 'Подтвердить'
      this.cancelLabel = 'Отмена'
      this.tone = 'default'
      this.resolver = null
    },
  },
})
