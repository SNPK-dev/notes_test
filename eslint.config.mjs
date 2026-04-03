import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      '.data/**',
      '.nitro/**',
      '.cache/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'openspec/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        computed: 'readonly',
        defineEmits: 'readonly',
        defineNuxtPlugin: 'readonly',
        defineProps: 'readonly',
        navigateTo: 'readonly',
        onBeforeRouteLeave: 'readonly',
        ref: 'readonly',
        storeToRefs: 'readonly',
        useConfirmDialog: 'readonly',
        useId: 'readonly',
        useModalStore: 'readonly',
        useNoteEditorStore: 'readonly',
        useNotesStore: 'readonly',
        useNotesRepository: 'readonly',
        useNuxtApp: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        withDefaults: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
)
