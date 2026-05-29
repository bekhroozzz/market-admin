<script setup lang="ts">
import Input from '@/components/ui/Input.vue'
import SelectBase from '@/components/ui/SelectBase.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Button from '@/components/ui/Button.vue'
import ImageUpload from '@/components/offer/ImageUpload.vue'
import WorkScheduleEditor from '@/components/offer/WorkScheduleEditor.vue'
import TagsInput from '@/components/offer/TagsInput.vue'
import type { Categories } from '@/types/categories.ts'
import type { WorkScheduleDay, PriceTariff, Offer } from '@/types/offer.ts'
import * as Yup from 'yup'
import { useForm, useFieldArray } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import { getOffer, updateOffer } from '@/composables/offers.ts'
import { useApiGet } from '@/composables/useApi.ts'
import { onMounted, ref } from 'vue'

const FEATURE_SUGGESTIONS = ['Wi-Fi', 'Парковка', 'Терраса', 'Детская зона', 'Бар', 'Кальян', 'Открытый бассейн', 'Гардероб', 'Веганское меню']

const PRICE_TYPE_OPTIONS = [
  { name: 'за вход', value: 'for_enter' },
  { name: 'в час', value: 'by_hour' },
  { name: 'в минуту', value: 'by_minute' },
  { name: 'в день', value: 'by_day' },
  { name: 'за партию', value: 'by_party' },
]

const route = useRoute()
const router = useRouter()
const offerId = String(route.params.id)

const categories = ref<Categories[]>()
const isLoading = ref(false)
const isFetching = ref(true)
const errorMessage = ref('')

const images = ref<string[]>([])
const features = ref<string[]>([])
const rules = ref<string[]>([])
const workSchedule = ref<WorkScheduleDay[]>([])

const schema = Yup.object().shape({
  title: Yup.string().required('Это поле обязательное'),
  branchAddress: Yup.string().optional(),
  description: Yup.string().required('Это поле обязательное').max(1000, 'Максимум 1000 символов'),
  category: Yup.object({ value: Yup.string(), name: Yup.string() }).nullable().optional(),
  priceTariffs: Yup.array()
    .of(Yup.object().shape({
      price: Yup.string().required('Цена обязательна'),
      tariffUnit: Yup.object({ value: Yup.string().required(), name: Yup.string() }).required('Выберите тариф'),
    }))
    .min(1, 'Добавьте хотя бы один тариф'),
})

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    branchAddress: '',
    description: '',
    category: null as { id?: string; name: string; value?: string } | null,
    priceTariffs: [{ price: '', tariffUnit: null as { value: string; name: string } | null }],
  },
})

const { remove, push, fields, replace } = useFieldArray('priceTariffs')

async function loadOffer(offer: Offer, cats: Categories[]) {
  const categoryMatch = cats.find((c) => c.id === offer.category_id) ?? null

  const priceTariffs = offer.prices?.length
    ? offer.prices.map((p) => ({
        price: String(p.price),
        tariffUnit: PRICE_TYPE_OPTIONS.find((o) => o.value === p.priceType) ?? null,
      }))
    : [{ price: '', tariffUnit: null }]

  resetForm({
    values: {
      title: offer.title ?? '',
      branchAddress: offer.branchAddress ?? '',
      description: offer.description ?? '',
      category: categoryMatch ? { id: categoryMatch.id, name: categoryMatch.name, value: categoryMatch.id } : null,
      priceTariffs,
    },
  })

  replace(priceTariffs)
  images.value = [...(offer.images ?? [])]
  features.value = [...(offer.features ?? [])]
  rules.value = [...(offer.rules ?? [])]
  workSchedule.value = [...(offer.workSchedule ?? [])]
}

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const prices: PriceTariff[] = values.priceTariffs.map((item) => ({
      price: Number(String(item.price).replace(/\s/g, '')),
      priceType: item.tariffUnit?.value ?? '',
    }))

    await updateOffer(offerId, {
      title: values.title,
      description: values.description,
      branchAddress: values.branchAddress,
      categoryId: values.category?.id,
      prices,
      images: images.value,
      features: features.value,
      rules: rules.value,
      workSchedule: workSchedule.value,
    })

    await router.push(`/preview-offer/${offerId}`)
  } catch {
    errorMessage.value = 'Не удалось сохранить изменения'
  } finally {
    isLoading.value = false
  }
})

onMounted(async () => {
  try {
    const [offer, cats] = await Promise.all([
      getOffer(offerId),
      useApiGet<Categories[]>('/api/category/get-all'),
    ])
    categories.value = cats
    await loadOffer(offer, cats)
  } catch {
    errorMessage.value = 'Не удалось загрузить данные предложения'
  } finally {
    isFetching.value = false
  }
})
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-title-sm font-semibold mb-6">Редактировать предложение</h1>

    <div v-if="isFetching" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else>
      <div v-if="errorMessage" class="alert alert-error mb-4">{{ errorMessage }}</div>

      <form @submit="onSubmit" class="flex flex-col gap-6">
        <!-- Basic info -->
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-sm uppercase tracking-wide text-gray-500">Основное</h2>
          <Input name="title" size="lg" placeholder="Название заведения / предложения" />
          <div class="flex flex-col lg:flex-row gap-3">
            <Input name="branchAddress" size="lg" placeholder="Адрес заведения" class="flex-1" />
            <SelectBase name="category" :items="categories" size="lg" placeholder="Категория" class="flex-1" />
          </div>
          <Textarea name="description" size="lg" placeholder="Описание предложения" class="w-full" />
        </div>

        <!-- Pricing -->
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-sm uppercase tracking-wide text-gray-500">Тарифы</h2>
          <div v-for="(item, index) in fields" :key="item.key" class="flex gap-2">
            <Input :name="`priceTariffs[${index}].price`" size="lg" placeholder="Цена" input-type="price" class="flex-1" />
            <SelectBase :name="`priceTariffs[${index}].tariffUnit`" :items="PRICE_TYPE_OPTIONS" size="lg" placeholder="Единица" class="flex-1" />
            <Button variant="error" type="button" icon-name="trash" size="lg" is-outline @click="remove(index)" />
          </div>
          <Button type="button" icon-name="plus" is-outline icon-size="12" size="md" @click="push({ price: '', tariffUnit: null })">
            Добавить тариф
          </Button>
        </div>

        <!-- Images -->
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-sm uppercase tracking-wide text-gray-500">Фотографии</h2>
          <p class="text-xs text-gray-400">Первое фото — обложка. Нажмите ★ для смены обложки.</p>
          <ImageUpload v-model="images" />
        </div>

        <!-- Features -->
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-sm uppercase tracking-wide text-gray-500">Особенности заведения</h2>
          <TagsInput v-model="features" placeholder="Wi-Fi, Парковка..." :suggestions="FEATURE_SUGGESTIONS" />
        </div>

        <!-- Rules -->
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-sm uppercase tracking-wide text-gray-500">Правила и ограничения</h2>
          <TagsInput v-model="rules" placeholder="Добавьте правило и нажмите Enter" />
        </div>

        <!-- Work schedule -->
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-sm uppercase tracking-wide text-gray-500">График работы</h2>
          <WorkScheduleEditor v-model="workSchedule" />
        </div>

        <div class="flex gap-3 mt-4">
          <Button type="submit" size="lg" :is-loading="isLoading">Сохранить</Button>
          <Button type="button" is-outline size="lg" @click="router.push(`/preview-offer/${offerId}`)">Отмена</Button>
        </div>
      </form>
    </template>
  </div>
</template>
