import { useModalStore } from '~~/stores/modal.store'

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

export function useConfirmDialog() {
  const modalStore = useModalStore()

  return {
    requestConfirmation(options: ConfirmationOptions) {
      return modalStore.requestConfirmation(options)
    },
    requestNotice(options: NoticeOptions) {
      return modalStore.requestNotice(options)
    },
  }
}
