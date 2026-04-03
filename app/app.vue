<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <GlobalModalHost />
  </NuxtLayout>
</template>

<script setup lang="ts">
import GlobalModalHost from '~~/components/base/GlobalModalHost.vue'
</script>
