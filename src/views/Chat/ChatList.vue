<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Чаты</h2>
    </div>

    <!-- Filters (admin only) -->
    <div v-if="isAdmin" class="bg-white dark:bg-gray-900 rounded-xl shadow p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-600">Покупатель (ID)</label>
          <input
            v-model="filters.buyerId"
            type="number"
            placeholder="ID покупателя"
            class="input input-bordered w-full input-sm"
            @input="debouncedLoad"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-600">Продавец (ID)</label>
          <input
            v-model="filters.sellerId"
            type="number"
            placeholder="ID продавца"
            class="input input-bordered w-full input-sm"
            @input="debouncedLoad"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-600">Оффер (UUID)</label>
          <input
            v-model="filters.offerId"
            type="text"
            placeholder="UUID оффера"
            class="input input-bordered w-full input-sm"
            @input="debouncedLoad"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-600">Дата от</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="input input-bordered w-full input-sm"
            @change="loadChats"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow overflow-x-auto">
      <table v-if="!loading" class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Оффер</th>
            <th>Продавец</th>
            <th>Покупатель</th>
            <th>Сообщений</th>
            <th>Последняя активность</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="chat in chats" :key="chat.id">
            <td>
              <span class="font-medium">{{ chat.offer?.title ?? chat.offerId }}</span>
            </td>
            <td>{{ chat.seller?.email ?? chat.sellerId }}</td>
            <td>{{ chat.buyer?.email ?? chat.buyerId }}</td>
            <td>
              <span
                v-if="chat.unreadForSeller > 0 || chat.unreadForBuyer > 0"
                class="badge badge-error badge-sm mr-1"
              >
                {{ chat.unreadForSeller || chat.unreadForBuyer }} новых
              </span>
              {{ chat.messageCount ?? '—' }}
            </td>
            <td>{{ formatDate(chat.lastMessageAt) }}</td>
            <td>
              <RouterLink :to="`/chats/${chat.id}`" class="btn btn-xs btn-primary">
                Просмотр
              </RouterLink>
            </td>
          </tr>
          <tr v-if="!chats.length">
            <td colspan="6" class="text-center text-gray-400 py-10">Чаты не найдены</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="flex justify-center py-20">
        <span class="loading loading-spinner loading-lg text-primary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useAdminSocket } from '@/composables/useAdminSocket'

interface ChatItem {
  id: string
  offerId: string
  sellerId: number
  buyerId: number
  offer: { id: string; title: string }
  seller: { id: number; email: string }
  buyer: { id: number; email: string }
  lastMessageAt: string | null
  unreadForSeller: number
  unreadForBuyer: number
  messageCount?: number
}

const authStore = useAuthStore()
const chatStore = useChatStore()
const { onNotificationCreated } = useAdminSocket()

const chats = ref<ChatItem[]>([])
const loading = ref(true)
const isAdmin = authStore.userRole === 'admin'

const filters = reactive({
  buyerId: '',
  sellerId: '',
  offerId: '',
  dateFrom: '',
})

async function loadChats() {
  loading.value = true
  try {
    if (isAdmin) {
      const params: Record<string, string> = {}
      if (filters.buyerId) params.buyerId = filters.buyerId
      if (filters.sellerId) params.sellerId = filters.sellerId
      if (filters.offerId) params.offerId = filters.offerId
      if (filters.dateFrom) params.dateFrom = filters.dateFrom
      const queryStr = new URLSearchParams(params).toString()
      chats.value = await api<ChatItem[]>(`/api/chats/admin/all${queryStr ? '?' + queryStr : ''}`)
    } else {
      // Seller: use the regular endpoint — only returns their own chats
      chats.value = await api<ChatItem[]>('/api/chats')
    }
  } catch (e) {
    console.error('Failed to load chats', e)
  } finally {
    loading.value = false
  }
}

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadChats, 500)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadChats()
  chatStore.reset()

  // Real-time: when a new_message notification arrives, move that chat to top
  const unsubNotif = onNotificationCreated((n) => {
    if (n.type !== 'new_message' || !n.entityId) return
    const chatId = n.entityId
    const existing = chats.value.find((c) => c.id === chatId)
    if (existing) {
      existing.lastMessageAt = n.createdAt
      chats.value = [existing, ...chats.value.filter((c) => c.id !== chatId)]
    } else {
      // Unknown chat (new one) — reload the list
      loadChats()
    }
  })

  onBeforeUnmount(() => {
    unsubNotif()
  })
})
</script>
