import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'dist/**',
      '.nuxt/**',
      '.output/**',
    ],
  },
  resolve: {
    alias: {
      '~~': rootDir,
      '@@': rootDir,
      '~': rootDir,
      '@': rootDir,
    },
  },
})
