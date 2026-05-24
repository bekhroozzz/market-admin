<script setup lang="ts">
import Input from '@/components/ui/Input.vue'
import SelectBase from '@/components/ui/SelectBase.vue'
import { onMounted, ref } from 'vue'
import { useApiGet } from '@/composables/useApi.ts'
import Textarea from '@/components/ui/Textarea.vue'
import Button from '@/components/ui/Button.vue'
import Dropzone from '@/components/ui/Dropzone.vue'
import type { Categories } from '@/types/categories.ts'
import * as Yup from 'yup'
import { useForm, useFieldArray } from 'vee-validate'
import { useRouter } from 'vue-router'
import { createOffer } from '@/composables/offers.ts'

const categories = ref()
const router = useRouter()
const isLoading = ref(false)

const tariffUnit = ref([
  {
    name: 'за вход',
    value: 'for_enter'
  },
  {
  name: 'в час',
  value: 'by_hour'
  },
  {
    name: 'в минуту',
    value: 'by_minute'
  },
  {
    name: 'в день',
    value: 'by_day'
  },
  {
    name: 'за партию',
    value: 'by_party'
  },
])

const schema = Yup.object().shape({
  title: Yup.string().required('Это поле обязательное'),
  branchAddress: Yup.string().required('Это поле обязательное'),
  description: Yup.string().required('Это поле обязательное').max(1000, 'Максимальное кол-во символов: 1000'),
  category: Yup.object({
    value: Yup.string(),
    name: Yup.string()
  }).required('Выберите категорию предложения'),
  priceTariffs: Yup.array()
    .of(
      Yup.object().shape({
        price: Yup.string().required('Цена обязательна'),
        tariffUnit: Yup.object({
          value: Yup.string().required(),
          name: Yup.string()
        }).required('Выберите тариф')
      })
    )
    .min(1, 'Добавьте хотя бы один тариф'),
})

const { handleSubmit, setFieldError, values } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    branchAddress: '',
    description: '',
    category: null,
    priceTariffs: [{ price: '', tariffUnit: null }],
  },
})

const { remove, push, fields } = useFieldArray('priceTariffs');

const onSubmit = handleSubmit(async (values) => {
  const offerFormatted = {
    title: values.title,
    description: values.description,
    branchAddress: values.branchAddress,
    categoryId: values.category?.id,
    prices: values.priceTariffs.map(item => ({
      price: Number(item.price.replace(/\s/g, '')),
      priceType: item.tariffUnit?.value
    })),
    images: ['https://placehold.co/600x400','https://placehold.co/600x400','https://placehold.co/600x400'],
  }

  isLoading.value = true
  try {
    const response = await createOffer(offerFormatted)
    await router.push(`/preview-offer/${response.id}`)
  }catch (error) {
    console.error(error)
  }finally {
    isLoading.value = false
  }
})

onMounted(async () =>{
  categories.value = await useApiGet<Categories[]>('/api/category/get-all')
  })
</script>

<template>
  <h1 class="text-title-sm font-semibold">
    Создать товарное предложение
  </h1>
  <form @submit="onSubmit"  class="flex flex-col gap-4 my-6">
    <Input name="title" size="lg" placeholder="Наименование предложения" />
    <div v-for="(item, index) in fields" :key="item.key" class="flex gap-1">
      <Input
        :name="`priceTariffs[${index}].price`"
        size="lg"
        placeholder="Цена (сум)"
        input-type="price"
      />
      <SelectBase
        :name="`priceTariffs[${index}].tariffUnit`"
        :items="tariffUnit"
        size="lg"
        placeholder="Единица тарификации"
      />
      <Button
        variant="error"
        type="button"
        icon-name="trash"
        size="lg"
        is-outline
        @click="  remove(index)"
      />
    </div>
    <Button
      type="button"
      icon-name="plus"
      is-outline icon-size="12"
      size="md"
      @click="push({ price: '', tariffUnit: null })"
    >
      Добавить тариф
    </Button>
    <div class="flex flex-col lg:flex-row  gap-1">
      <Input name="branchAddress" size="lg" placeholder="Адрес заведения" />
      <SelectBase name="category" :items="categories" size="lg" placeholder="Выберите категорию"/>
    </div>
    <Textarea name="description" size="lg" placeholder="Описание предложения" class="w-full"/>
    <Dropzone/>
    <Button type="submit" size="lg" class="mt-8" :is-loading="isLoading">
      Предпросмотр
    </Button>
  </form>
</template>
