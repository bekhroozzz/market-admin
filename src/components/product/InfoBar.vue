<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import type { WorkScheduleDay, PriceTariff } from '@/types/offer.ts'
import { computed } from 'vue'

const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

const PRICE_TYPE_LABELS: Record<string, string> = {
  for_enter: 'за вход',
  by_hour: 'в час',
  by_minute: 'в минуту',
  by_day: 'в день',
  by_party: 'за партию',
}

interface Props {
  name: string
  description: string
  reviewCount: number
  price: number
  oldPrice: number
  rating: number
  offerId?: string
  branchAddress?: string | null
  workSchedule?: WorkScheduleDay[]
  features?: string[]
  rules?: string[]
  prices?: PriceTariff[]
}

const props = withDefaults(defineProps<Props>(), {
  workSchedule: () => [],
  features: () => [],
  rules: () => [],
  prices: () => [],
})

const router = useRouter()

const sortedSchedule = computed(() =>
  [...(props.workSchedule ?? [])].sort((a, b) => a.day - b.day),
)
</script>

<template>
  <div class="w-full lg:w-1/3">
    <h1 class="text-3xl font-bold mb-2">{{ name }}</h1>

    <!-- Address -->
    <p v-if="branchAddress" class="mb-3 text-sm text-gray-500 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      {{ branchAddress }}
    </p>

    <!-- Prices -->
    <div class="mb-5">
      <template v-if="prices?.length">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tariff in prices"
            :key="tariff.priceType"
            class="badge badge-lg badge-outline font-semibold"
          >
            {{ tariff.price.toLocaleString('ru-RU') }} ₽ {{ PRICE_TYPE_LABELS[tariff.priceType] ?? tariff.priceType }}
          </span>
        </div>
      </template>
      <template v-else-if="price">
        <span class="text-2xl font-bold mr-2">{{ price.toLocaleString('ru-RU') }} ₽</span>
        <span v-if="oldPrice && oldPrice !== price" class="line-through text-gray-400 text-sm">
          {{ oldPrice.toLocaleString('ru-RU') }} ₽
        </span>
      </template>
    </div>

    <!-- Rating -->
    <div class="flex items-center gap-2 mb-6">
      <div class="flex">
        <svg
          v-for="i in 5"
          :key="i"
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          :class="i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>
      <span class="text-sm text-gray-500">
        {{ rating > 0 ? rating.toFixed(1) : '—' }} / 5 · {{ reviewCount }} отзывов
      </span>
    </div>

    <!-- Description -->
    <p class="mb-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{{ description }}</p>

    <!-- Actions -->
    <div class="flex flex-col w-full gap-3 mb-8">
      <Button
        v-if="offerId"
        is-outline
        size="lg"
        class="w-full"
        @click="router.push(`/offer-reviews/${offerId}`)"
      >
        Отзывы ({{ reviewCount }})
      </Button>
    </div>

    <!-- Features -->
    <div v-if="features?.length" class="mb-6">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Особенности</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="feature in features"
          :key="feature"
          class="badge badge-outline badge-md"
        >
          {{ feature }}
        </span>
      </div>
    </div>

    <!-- Accordions -->
    <div class="flex flex-col gap-2">
      <!-- Work schedule -->
      <div class="collapse collapse-arrow bg-base-100 border border-base-300">
        <input type="radio" name="offer-info-accordion" checked />
        <div class="collapse-title font-semibold text-sm">График работы</div>
        <div class="collapse-content text-sm">
          <template v-if="sortedSchedule.length">
            <div
              v-for="day in sortedSchedule"
              :key="day.day"
              class="flex justify-between py-1 border-b last:border-0"
            >
              <span class="font-medium">{{ DAY_NAMES[day.day] }}</span>
              <span v-if="day.isClosed" class="text-gray-400 italic">Выходной</span>
              <span v-else>{{ day.openTime }} – {{ day.closeTime }}</span>
            </div>
          </template>
          <p v-else class="text-gray-400 italic">Не указан</p>
        </div>
      </div>

      <!-- Rules -->
      <div v-if="rules?.length" class="collapse collapse-arrow bg-base-100 border border-base-300">
        <input type="radio" name="offer-info-accordion" />
        <div class="collapse-title font-semibold text-sm">Правила и ограничения</div>
        <div class="collapse-content text-sm">
          <ul class="list-disc list-inside space-y-1">
            <li v-for="rule in rules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
