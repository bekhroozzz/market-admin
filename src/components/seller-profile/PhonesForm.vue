<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import type { SellerProfile, UpdateSellerProfilePayload } from '@/types/seller-profile.ts'
import { updateMyProfile } from '@/composables/sellerProfile.ts'

const props = defineProps<{
  phones: string[]
  profilePayload: Pick<UpdateSellerProfilePayload, 'companyName' | 'aboutCompany' | 'branches'>
}>()
const emit = defineEmits<{ (e: 'saved', profile: SellerProfile): void }>()

const localPhones = ref<string[]>([...props.phones])
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function addPhone() {
  localPhones.value.push('')
}

function removePhone(idx: number) {
  localPhones.value.splice(idx, 1)
}

async function save() {
  const invalidPhone = localPhones.value.some(
    (p) => !/^\+?[0-9\s\-().]{7,20}$/.test(p.trim()),
  )
  if (invalidPhone) {
    errorMessage.value = 'Проверьте корректность номеров телефонов'
    return
  }

  successMessage.value = ''
  errorMessage.value = ''
  isSaving.value = true
  try {
    const updated = await updateMyProfile({
      ...props.profilePayload,
      phones: localPhones.value.map((p) => p.trim()).filter(Boolean),
    })
    successMessage.value = 'Телефоны сохранены'
    emit('saved', updated)
  } catch {
    errorMessage.value = 'Не удалось сохранить телефоны'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(phone, idx) in localPhones"
      :key="idx"
      class="flex gap-2 items-center"
    >
      <input
        v-model="localPhones[idx]"
        type="tel"
        placeholder="+7 (999) 123-45-67"
        class="input input-bordered input-sm flex-1"
      />
      <button
        type="button"
        class="btn btn-ghost btn-sm text-error"
        @click="removePhone(idx)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <button type="button" class="btn btn-outline btn-sm gap-2" @click="addPhone">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      Добавить номер
    </button>

    <div v-if="successMessage" class="alert alert-success text-sm">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-error text-sm">{{ errorMessage }}</div>

    <Button variant="primary" :is-loading="isSaving" @click="save">
      Сохранить телефоны
    </Button>
  </div>
</template>
