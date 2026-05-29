<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ProfileForm from '@/components/seller-profile/ProfileForm.vue'
import BranchesForm from '@/components/seller-profile/BranchesForm.vue'
import PhonesForm from '@/components/seller-profile/PhonesForm.vue'
import GalleryUpload from '@/components/seller-profile/GalleryUpload.vue'
import type { SellerProfile } from '@/types/seller-profile.ts'
import { getMyProfile } from '@/composables/sellerProfile.ts'

type Tab = 'info' | 'phones' | 'branches' | 'gallery'

const profile = ref<SellerProfile | null>(null)
const isLoading = ref(true)
const loadError = ref('')
const activeTab = ref<Tab>('info')

const tabs: { key: Tab; label: string }[] = [
  { key: 'info', label: 'Основная информация' },
  { key: 'phones', label: 'Телефоны' },
  { key: 'branches', label: 'Филиалы' },
  { key: 'gallery', label: 'Галерея' },
]

onMounted(async () => {
  try {
    profile.value = await getMyProfile()
  } catch {
    loadError.value = 'Не удалось загрузить профиль'
  } finally {
    isLoading.value = false
  }
})

function onProfileSaved(updated: SellerProfile) {
  profile.value = updated
}

const profilePayload = computed(() => ({
  companyName: profile.value?.companyName ?? undefined,
  aboutCompany: profile.value?.aboutCompany ?? undefined,
  phones: profile.value?.phones ?? [],
  branches: profile.value?.branches ?? [],
}))
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Профиль компании</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Информация о вашей компании видна всем пользователям платформы
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-10 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
      <div class="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="alert alert-error">{{ loadError }}</div>

    <template v-else-if="profile">
      <!-- Tabs -->
      <div class="tabs tabs-bordered">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ 'tab-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <!-- Info tab -->
        <template v-if="activeTab === 'info'">
          <ProfileForm :profile="profile" @saved="onProfileSaved" />
        </template>

        <!-- Phones tab -->
        <template v-else-if="activeTab === 'phones'">
          <PhonesForm
            :phones="profile.phones"
            :profile-payload="{ companyName: profilePayload.companyName, aboutCompany: profilePayload.aboutCompany, branches: profile.branches }"
            @saved="onProfileSaved"
          />
        </template>

        <!-- Branches tab -->
        <template v-else-if="activeTab === 'branches'">
          <BranchesForm
            :branches="profile.branches"
            :profile-payload="{ companyName: profilePayload.companyName, aboutCompany: profilePayload.aboutCompany, phones: profile.phones }"
            @saved="onProfileSaved"
          />
        </template>

        <!-- Gallery tab -->
        <template v-else-if="activeTab === 'gallery'">
          <GalleryUpload :gallery="profile.gallery" @updated="onProfileSaved" />
        </template>
      </div>
    </template>
  </div>
</template>
