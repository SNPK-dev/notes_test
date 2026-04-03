<script setup lang="ts">
import { computed } from 'vue'

useRoute()

const navigationItems = [
  { label: 'Список заметок', to: '/' },
  { label: 'Новая заметка', to: '/editor' },
]

const pageTitle = computed(() => 'Заметки')
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <div class="shell__brand">
        <p class="shell__eyebrow">Notes SPA Foundation</p>
        <h1>{{ pageTitle }}</h1>
      </div>

      <nav class="shell__nav" aria-label="Основная навигация">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="shell__nav-link"
          active-class="shell__nav-link--active"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="shell__content">
      <slot />
    </main>
  </div>
</template>
