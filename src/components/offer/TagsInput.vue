<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
  suggestions?: string[]
}>()
const emit = defineEmits<{ (e: 'update:modelValue', val: string[]): void }>()

const tags = ref<string[]>([...props.modelValue])
const input = ref('')

watch(() => props.modelValue, (val) => { tags.value = [...val] })

function add(value: string) {
  const trimmed = value.trim()
  if (!trimmed || tags.value.includes(trimmed)) {
    input.value = ''
    return
  }
  tags.value = [...tags.value, trimmed]
  emit('update:modelValue', tags.value)
  input.value = ''
}

function remove(index: number) {
  tags.value = tags.value.filter((_, i) => i !== index)
  emit('update:modelValue', tags.value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    add(input.value)
  } else if (e.key === 'Backspace' && !input.value && tags.value.length) {
    remove(tags.value.length - 1)
  }
}

const unusedSuggestions = computed(() =>
  (props.suggestions ?? []).filter((s) => !tags.value.includes(s)),
)
</script>

<template>
  <div class="space-y-2">
    <!-- Input area -->
    <div class="flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[44px] focus-within:border-primary">
      <span
        v-for="(tag, idx) in tags"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
      >
        {{ tag }}
        <button type="button" class="hover:text-red-500 transition-colors" @click="remove(idx)">✕</button>
      </span>
      <input
        v-model="input"
        type="text"
        class="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-gray-400"
        :placeholder="tags.length ? '' : (placeholder ?? 'Введите и нажмите Enter')"
        @keydown="onKeydown"
        @blur="input.trim() && add(input)"
      />
    </div>

    <!-- Suggestions -->
    <div v-if="unusedSuggestions.length" class="flex flex-wrap gap-1">
      <button
        v-for="s in unusedSuggestions"
        :key="s"
        type="button"
        class="badge badge-outline badge-sm cursor-pointer hover:badge-primary transition-colors"
        @click="add(s)"
      >
        + {{ s }}
      </button>
    </div>
  </div>
</template>
