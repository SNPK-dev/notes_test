<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    ariaLabel?: string
    placeholder?: string
    id?: string
    readonly?: boolean
    required?: boolean
  }>(),
  {
    label: '',
    ariaLabel: '',
    placeholder: '',
    id: undefined,
    readonly: false,
    required: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.id ?? `input-${useId()}`)
</script>

<template>
  <div class="field">
    <label v-if="label" class="field__label" :for="inputId">
      {{ label }}
    </label>
    <input
      :id="inputId"
      class="field__control"
      :value="modelValue"
      :aria-label="ariaLabel || undefined"
      :placeholder="placeholder"
      :readonly="readonly"
      :required="required"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
  </div>
</template>
