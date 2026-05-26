<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import type { Branch, UpdateSellerProfilePayload, SellerProfile } from '@/types/seller-profile.ts'
import { updateMyProfile } from '@/composables/sellerProfile.ts'

const props = defineProps<{
  branches: Branch[]
  profilePayload: Pick<UpdateSellerProfilePayload, 'companyName' | 'aboutCompany' | 'phones'>
}>()
const emit = defineEmits<{ (e: 'saved', profile: SellerProfile): void }>()

const localBranches = ref<Branch[]>(props.branches.map((b) => ({ ...b })))
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function addBranch() {
  localBranches.value.push({ id: crypto.randomUUID(), title: '', address: '' })
}

function removeBranch(id: string) {
  localBranches.value = localBranches.value.filter((b) => b.id !== id)
}

async function save() {
  const missing = localBranches.value.some((b) => !b.title.trim() || !b.address.trim())
  if (missing) {
    errorMessage.value = 'Заполните название и адрес для каждого филиала'
    return
  }

  successMessage.value = ''
  errorMessage.value = ''
  isSaving.value = true
  try {
    const updated = await updateMyProfile({
      ...props.profilePayload,
      branches: localBranches.value,
    })
    successMessage.value = 'Филиалы сохранены'
    emit('saved', updated)
  } catch {
    errorMessage.value = 'Не удалось сохранить филиалы'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="branch in localBranches"
      :key="branch.id"
      class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 relative"
    >
      <button
        type="button"
        class="absolute top-3 right-3 text-error hover:opacity-70 transition-opacity"
        @click="removeBranch(branch.id)"
        title="Удалить филиал"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Название</label>
        <input
          v-model="branch.title"
          type="text"
          placeholder="Главный офис"
          class="input input-bordered input-sm w-full"
        />
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Адрес</label>
        <input
          v-model="branch.address"
          type="text"
          placeholder="г. Москва, ул. Ленина, 1"
          class="input input-bordered input-sm w-full"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Широта (необяз.)</label>
          <input
            v-model.number="branch.latitude"
            type="number"
            step="0.000001"
            placeholder="55.7558"
            class="input input-bordered input-sm w-full"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Долгота (необяз.)</label>
          <input
            v-model.number="branch.longitude"
            type="number"
            step="0.000001"
            placeholder="37.6173"
            class="input input-bordered input-sm w-full"
          />
        </div>
      </div>
    </div>

    <button
      type="button"
      class="btn btn-outline btn-sm gap-2 w-full"
      @click="addBranch"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      Добавить филиал
    </button>

    <div v-if="successMessage" class="alert alert-success text-sm">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-error text-sm">{{ errorMessage }}</div>

    <Button variant="primary" :is-loading="isSaving" @click="save">
      Сохранить филиалы
    </Button>
  </div>
</template>
