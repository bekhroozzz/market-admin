<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import PhotoBlock from '@/components/product/PhotoBlock.vue'
import InfoBar from '@/components/product/InfoBar.vue'
import BreadCrumbs from '@/components/common/Breadcrumbs.vue'
import Button from '@/components/ui/Button.vue'
import { getOffer, deleteOffer } from '@/composables/offers.ts'
import type { Offer } from '@/types/offer.ts'

const route = useRoute()
const router = useRouter()

const offer = ref<Offer | null>(null)
const isLoading = ref(true)
const isDeleting = ref(false)
const errorMessage = ref('')

const photoImages = computed(() => {
  if (!offer.value) return [{ src: '/1.jpg' }]
  const imgs = (offer.value.images ?? [])
    .filter(Boolean)
    .map((src) => ({ src }))
  return imgs.length ? imgs : [{ src: '/1.jpg' }]
})

async function handleDelete() {
  if (!offer.value) return
  if (!confirm('Удалить это предложение? Это действие нельзя отменить.')) return

  isDeleting.value = true
  try {
    await deleteOffer(offer.value.id)
    await router.push('/my-offers')
  } catch {
    errorMessage.value = 'Не удалось удалить предложение'
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  try {
    offer.value = await getOffer(String(route.params.id))
  } catch {
    errorMessage.value = 'Не удалось загрузить предложение'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 pb-8">
    <BreadCrumbs class="pb-8 pt-4" />

    <div v-if="isLoading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

    <template v-else-if="offer">
      <div class="flex gap-6 lg:flex-row flex-col">
        <PhotoBlock :images="photoImages" />

        <InfoBar
          :name="offer.title"
          :description="offer.description"
          :price="offer.prices?.[0]?.price ?? offer.price ?? 0"
          :old-price="offer.oldPrice ?? offer.prices?.[0]?.price ?? 0"
          :rating="Math.max(0, Math.min(5, Number(offer.rating ?? 0)))"
          :review-count="offer.reviewCount ?? 0"
          :offer-id="offer.id"
          :branch-address="offer.branchAddress"
          :work-schedule="offer.workSchedule"
          :features="offer.features"
          :rules="offer.rules"
          :prices="offer.prices"
        />
      </div>

      <!-- Sticky actions bar -->
      <div class="divider my-6 lg:my-8" />

      <div class="flex z-10 flex-wrap glass border border-gray-400 sticky bottom-0 gap-4 shadow-2xl p-4 lg:p-6 rounded-lg">
        <Button size="lg" class="w-full lg:w-max" @click="router.push(`/edit-offer/${offer.id}`)">
          Редактировать
        </Button>
        <Button size="lg" is-outline class="w-full lg:w-max">
          Отправить на модерацию
        </Button>
        <Button
          variant="error"
          size="lg"
          is-outline
          class="w-full lg:w-max ml-auto"
          :is-loading="isDeleting"
          @click="handleDelete"
        >
          Удалить
        </Button>
      </div>
    </template>
  </div>
</template>
