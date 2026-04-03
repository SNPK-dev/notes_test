<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    label?: string
    id?: string
    disabled?: boolean
  }>(),
  {
    label: '',
    id: undefined,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxId = computed(() => props.id ?? `checkbox-${useId()}`)
</script>

<template>
  <label class="checkbox" :for="checkboxId">
    <input
      :id="checkboxId"
      class="checkbox__control"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="
        emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
    />
    <span class="checkbox__indicator" aria-hidden="true" />
    <span class="checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
