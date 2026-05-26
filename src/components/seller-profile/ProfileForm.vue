<script setup lang="ts">
import { useForm } from 'vee-validate'
import * as Yup from 'yup'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Button from '@/components/ui/Button.vue'
import type { SellerProfile, UpdateSellerProfilePayload } from '@/types/seller-profile.ts'
import { updateMyProfile } from '@/composables/sellerProfile.ts'
import { ref } from 'vue'

const props = defineProps<{ profile: SellerProfile }>()
const emit = defineEmits<{ (e: 'saved', profile: SellerProfile): void }>()

const schema = Yup.object({
  companyName: Yup.string().max(255, 'Максимум 255 символов').nullable(),
  aboutCompany: Yup.string().max(3000, 'Максимум 3000 символов').nullable(),
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    companyName: props.profile.companyName ?? '',
    aboutCompany: props.profile.aboutCompany ?? '',
  },
})

const successMessage = ref('')
const errorMessage = ref('')

const onSubmit = handleSubmit(async (values) => {
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const payload: UpdateSellerProfilePayload = {
      companyName: values.companyName || undefined,
      aboutCompany: values.aboutCompany || undefined,
      phones: props.profile.phones,
      branches: props.profile.branches,
    }
    const updated = await updateMyProfile(payload)
    successMessage.value = 'Профиль успешно сохранён'
    emit('saved', updated)
  } catch {
    errorMessage.value = 'Не удалось сохранить профиль. Попробуйте снова.'
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-5">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Название компании
      </label>
      <Input name="companyName" placeholder="ООО «ТехноМир»" />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        О компании
      </label>
      <Textarea
        name="aboutCompany"
        placeholder="Расскажите о своей компании..."
        :rows="5"
      />
    </div>

    <div v-if="successMessage" class="alert alert-success text-sm">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-error text-sm">{{ errorMessage }}</div>

    <Button type="submit" variant="primary" :is-loading="isSubmitting">
      Сохранить
    </Button>
  </form>
</template>
