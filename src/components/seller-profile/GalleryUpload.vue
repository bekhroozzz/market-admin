<script setup lang="ts">
import type { GalleryImage, SellerProfile } from '@/types/seller-profile.ts'
import { ref, watch } from 'vue'
import { uploadGalleryImage, deleteGalleryImage } from '@/composables/sellerProfile.ts'

const MAX_IMAGES = 10

const props = defineProps<{ gallery: GalleryImage[] }>()
const emit = defineEmits<{ (e: 'updated', profile: SellerProfile): void }>()

const localGallery = ref<GalleryImage[]>([...props.gallery])
const isDragging = ref(false)
const isUploading = ref(false)
const deletingId = ref<string | null>(null)
const errorMessage = ref('')

watch(() => props.gallery, (val) => { localGallery.value = [...val] })

async function handleFiles(files: FileList | null) {
  if (!files?.length) return
  const remaining = MAX_IMAGES - localGallery.value.length
  if (remaining <= 0) {
    errorMessage.value = `Галерея заполнена (максимум ${MAX_IMAGES} фото)`
    return
  }

  errorMessage.value = ''
  const toUpload = Array.from(files).slice(0, remaining)

  isUploading.value = true
  try {
    let updatedProfile: SellerProfile | null = null
    for (const file of toUpload) {
      updatedProfile = await uploadGalleryImage(file)
    }
    if (updatedProfile) {
      localGallery.value = updatedProfile.gallery
      emit('updated', updatedProfile)
    }
  } catch {
    errorMessage.value = 'Ошибка при загрузке фото'
  } finally {
    isUploading.value = false
  }
}

async function deleteImage(imageId: string) {
  errorMessage.value = ''
  deletingId.value = imageId
  try {
    const updatedProfile = await deleteGalleryImage(imageId)
    localGallery.value = updatedProfile.gallery
    emit('updated', updatedProfile)
  } catch {
    errorMessage.value = 'Не удалось удалить фото'
  } finally {
    deletingId.value = null
  }
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
        localGallery.length >= MAX_IMAGES
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
          {{ localGallery.length >= MAX_IMAGES ? 'Галерея заполнена' : 'Перетащите фото или нажмите для выбора' }}
        </p>
        <p class="text-xs">JPEG, PNG, WebP, GIF · до 5 МБ · {{ localGallery.length }}/{{ MAX_IMAGES }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-error text-sm">{{ errorMessage }}</div>

    <!-- Gallery grid -->
    <div v-if="localGallery.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <div
        v-for="img in localGallery"
        :key="img.id"
        class="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        <img
          :src="img.url"
          alt="gallery"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          :disabled="deletingId === img.id"
          @click.stop="deleteImage(img.id)"
        >
          <span v-if="deletingId === img.id" class="loading loading-spinner loading-sm text-white"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>

    <p v-else class="text-sm text-gray-400 dark:text-gray-500">
      Галерея пуста. Загрузите первое фото компании.
    </p>
  </div>
</template>
