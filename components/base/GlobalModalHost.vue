<script setup lang="ts">
import BaseModal from '~~/components/base/BaseModal.vue'
import { useModalStore } from '~~/stores/modal.store'

const modalStore = useModalStore()
</script>

<template>
  <BaseModal
    :open="modalStore.isOpen"
    :title="modalStore.title"
    :confirm-label="modalStore.confirmLabel"
    :cancel-label="modalStore.cancelLabel"
    :tone="modalStore.tone"
    :show-cancel="modalStore.showCancelAction"
    @confirm="modalStore.confirm()"
    @close="modalStore.dismiss()"
  >
    <p>{{ modalStore.description }}</p>
  </BaseModal>
</template>
