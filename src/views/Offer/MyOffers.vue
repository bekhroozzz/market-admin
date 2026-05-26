<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SellerOffer } from '@/types/seller-profile.ts'
import { getMyOffers } from '@/composables/sellerProfile.ts'

const router = useRouter()

const offers = ref<SellerOffer[]>([])
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')

const LIMIT = 12

async function loadOffers(page = 1) {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await getMyOffers(page, LIMIT)
    offers.value = data.offers
    total.value = data.total
    totalPages.value = data.pages
    currentPage.value = data.page
  } catch {
    errorMessage.value = 'Не удалось загрузить предложения'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadOffers())

async function goToPage(page: number) {
  currentPage.value = page
  await loadOffers(page)
}
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Мои предложения</h1>
        <p v-if="!isLoading" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Всего: {{ total }}
        </p>
      </div>
      <router-link to="/create-offer" class="btn btn-primary btn-sm gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Создать предложение
      </router-link>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

    <!-- Skeleton -->
    <template v-if="isLoading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="n in 8"
          :key="n"
          class="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse overflow-hidden"
        >
          <div class="h-40 bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!offers.length">
      <div class="text-center py-20 text-gray-400 dark:text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <p class="text-lg font-semibold">Нет предложений</p>
        <p class="text-sm mt-1 mb-6">Создайте первое предложение для привлечения клиентов</p>
        <router-link to="/create-offer" class="btn btn-primary">
          Создать предложение
        </router-link>
      </div>
    </template>

    <!-- Offers grid -->
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
          @click="router.push(`/preview-offer/${offer.id}`)"
        >
          <div class="h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <img
              v-if="offer.images?.length"
              :src="offer.images[0]"
              :alt="offer.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-medium text-gray-800 dark:text-white line-clamp-2 text-sm mb-1">
              {{ offer.title }}
            </h3>
            <div class="flex items-center justify-between mt-2">
              <span v-if="offer.price" class="text-primary font-semibold text-sm">
                {{ offer.price.toLocaleString('ru-RU') }} ₽
              </span>
              <span
                class="badge badge-sm"
                :class="offer.inStock ? 'badge-success' : 'badge-error'"
              >
                {{ offer.inStock ? 'В наличии' : 'Нет' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-1 pt-4">
        <button
          v-for="p in totalPages"
          :key="p"
          class="btn btn-sm"
          :class="p === currentPage ? 'btn-primary' : 'btn-ghost'"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>
      </div>
    </template>
  </div>
</template>
