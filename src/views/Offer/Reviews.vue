<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApiGet, useApiDelete } from '@/composables/useApi.ts'
import Button from '@/components/ui/Button.vue'

interface Review {
  id: string
  text: string
  rating: number
  offerId: string
  createdAt: string
}

const route = useRoute()
const offerId = String(route.params.id)

const reviews = ref<Review[]>([])
const isLoading = ref(true)
const deletingId = ref<string | null>(null)
const errorMessage = ref('')

const DAY_STARS = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

async function loadReviews() {
  isLoading.value = true
  try {
    reviews.value = await useApiGet<Review[]>(`/api/review/get-offer-reviews/${offerId}`)
  } catch {
    errorMessage.value = 'Не удалось загрузить отзывы'
  } finally {
    isLoading.value = false
  }
}

async function deleteReview(id: string) {
  if (!confirm('Удалить этот отзыв?')) return
  deletingId.value = id
  try {
    await useApiDelete(`/api/review/delete/${id}`)
    reviews.value = reviews.value.filter((r) => r.id !== id)
  } catch {
    errorMessage.value = 'Не удалось удалить отзыв'
  } finally {
    deletingId.value = null
  }
}

onMounted(loadReviews)
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-title-sm font-semibold">Отзывы предложения</h1>
      <span v-if="!isLoading" class="badge badge-outline">{{ reviews.length }}</span>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

    <template v-else-if="reviews.length">
      <div class="flex flex-col gap-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-base-200 rounded-xl p-5 flex flex-col gap-2"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-yellow-500 text-lg tracking-widest">{{ DAY_STARS(review.rating) }}</span>
              <p class="text-sm text-base-content/80">{{ review.text }}</p>
              <span class="text-xs text-gray-400">
                {{ new Date(review.createdAt).toLocaleDateString('ru-RU') }}
              </span>
            </div>
            <Button
              variant="error"
              size="sm"
              is-outline
              :is-loading="deletingId === review.id"
              @click="deleteReview(review.id)"
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-16 text-gray-400">
      <p class="text-lg font-medium">Отзывов пока нет</p>
    </div>
  </div>
</template>
