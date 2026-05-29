<script setup lang="ts">
import { ref, watch } from 'vue'
import { uploadOfferImage } from '@/composables/offers.ts'

const MAX_IMAGES = 10

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{
  (e: 'update:modelValue', urls: string[]): void
}>()

const images = ref<string[]>([...props.modelValue])
const isDragging = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')

watch(() => props.modelValue, (val) => { images.value = [...val] })

async function handleFiles(files: FileList | null) {
  if (!files?.length) return
  const remaining = MAX_IMAGES - images.value.length
  if (remaining <= 0) {
    errorMessage.value = `Максимум ${MAX_IMAGES} фото`
    return
  }

  errorMessage.value = ''
  const toUpload = Array.from(files).slice(0, remaining)

  isUploading.value = true
  try {
    for (const file of toUpload) {
      const { url } = await uploadOfferImage(file)
      images.value = [...images.value, url]
      emit('update:modelValue', images.value)
    }
  } catch {
    errorMessage.value = 'Ошибка при загрузке фото'
  } finally {
    isUploading.value = false
  }
}

function removeImage(index: number) {
  images.value = images.value.filter((_, i) => i !== index)
  emit('update:modelValue', images.value)
}

function setCover(index: number) {
  if (index === 0) return
  const reordered = [images.value[index], ...images.value.filter((_, i) => i !== index)]
  images.value = reordered
  emit('update:modelValue', images.value)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  handleFiles(e.dataTransfer?.files ?? null)
}

function onFileInput(e: Event) {
  handleFiles((e.target as HTMLInputElement).files)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Drop zone -->
    <div
      class="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
      :class="[
        images.length >= MAX_IMAGES
          ? 'border-gray-200 opacity-50 pointer-events-none'
          : isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary dark:border-gray-600',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="($refs.fileInput as HTMLInputElement).click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        class="hidden"
        @change="onFileInput"
      />
      <div class="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span v-if="isUploading" class="loading loading-spinner loading-sm"></span>
        <p v-else class="text-sm font-medium">
          {{ images.length >= MAX_IMAGES ? 'Лимит достигнут' : 'Перетащите фото или нажмите для выбора' }}
        </p>
        <p class="text-xs">JPEG, PNG, WebP · до 5 МБ · {{ images.length }}/{{ MAX_IMAGES }}</p>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-error text-sm py-2">{{ errorMessage }}</div>

    <!-- Image grid -->
    <div v-if="images.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <div
        v-for="(url, idx) in images"
        :key="url"
        class="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        <img :src="url" alt="offer image" class="w-full h-full object-cover" loading="lazy" />

        <!-- Cover badge -->
        <div v-if="idx === 0" class="absolute top-1 left-1">
          <span class="badge badge-xs badge-primary">Обложка</span>
        </div>

        <!-- Actions overlay -->
        <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            v-if="idx !== 0"
            type="button"
            title="Сделать обложкой"
            class="btn btn-xs btn-success"
            @click.stop="setCover(idx)"
          >
            ★
          </button>
          <button
            type="button"
            title="Удалить"
            class="btn btn-xs btn-error"
            @click.stop="removeImage(idx)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
