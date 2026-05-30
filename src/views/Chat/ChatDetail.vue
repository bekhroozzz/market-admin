<template>
  <div>
    <div class="mb-6 flex items-center gap-4">
      <RouterLink to="/chats" class="btn btn-ghost btn-sm"> ← Назад </RouterLink>
      <h2 class="text-2xl font-bold">Детали чата</h2>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>

    <div v-else-if="chat" class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      <!-- Participants + offer -->
      <div class="flex flex-col gap-4 sticky top-0">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow p-5">
          <h3 class="font-semibold text-sm text-gray-500 uppercase mb-3">Оффер</h3>
          <p class="font-bold text-lg">{{ chat.offer?.title }}</p>
          <p class="text-sm text-gray-400 mt-1">ID: {{ chat.offerId }}</p>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl shadow p-5">
          <h3 class="font-semibold text-sm text-gray-500 uppercase mb-3">Продавец</h3>
          <p class="font-medium">{{ chat.seller?.email }}</p>
          <p class="text-sm text-gray-400">ID: {{ chat.sellerId }}</p>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl shadow p-5">
          <h3 class="font-semibold text-sm text-gray-500 uppercase mb-3">Покупатель</h3>
          <p class="font-medium">{{ chat.buyer?.email }}</p>
          <p class="text-sm text-gray-400">ID: {{ chat.buyerId }}</p>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl shadow p-5">
          <h3 class="font-semibold text-sm text-gray-500 uppercase mb-3">Статистика</h3>
          <div class="flex flex-col gap-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Создан:</span>
              <span>{{ formatDate(chat.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Последняя активность:</span>
              <span>{{ formatDate(chat.lastMessageAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages + input -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl shadow flex flex-col overflow-hidden">
        <div class="p-4 border-b font-semibold flex items-center justify-between">
          <span>Сообщения</span>
          <span v-if="isSeller" class="text-xs text-green-600 font-medium">● Продавец</span>
          <span v-else class="text-xs text-blue-500 font-medium">● Администратор</span>
        </div>

        <!-- Message list -->
        <div ref="messagesEl" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
          <!-- Load more -->
          <div v-if="hasMore" class="text-center">
            <button
              class="btn btn-ghost btn-xs text-gray-400"
              :disabled="loadingMore"
              @click="loadMore"
            >
              {{ loadingMore ? 'Загрузка...' : 'Загрузить ранние сообщения' }}
            </button>
          </div>

          <div v-if="loadingMsgs" class="flex justify-center py-10">
            <span class="loading loading-spinner" />
          </div>

          <template v-else>
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex flex-col"
              :class="msg.senderId === currentUserId ? 'items-end' : 'items-start'"
            >
              <div class="text-[10px] text-gray-400 mb-0.5 px-1">
                {{ msg.senderId === chat.sellerId ? 'Продавец' : 'Покупатель' }}
              </div>
              <div
                class="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                :class="
                  msg.senderId === currentUserId
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                "
              >
                {{ msg.message }}
              </div>
              <div class="flex items-center gap-1 mt-0.5 px-1">
                <span class="text-[10px] text-gray-400">{{ formatTime(msg.createdAt) }}</span>
                <span v-if="msg.senderId === currentUserId" class="text-[10px] text-gray-400">
                  {{ msg.isRead ? '✓✓' : '✓' }}
                </span>
              </div>
            </div>

            <div v-if="!messages.length" class="text-center text-gray-400 py-10">Нет сообщений</div>
          </template>
        </div>

        <!-- Reply input (seller only — admin views read-only) -->
        <div
          v-if="isSeller"
          class="p-3 sticky bottom-0 bg-white shadow dark:bg-gray-900 border-t flex items-end gap-2"
        >
          <textarea
            v-model="messageText"
            placeholder="Напишите ответ покупателю..."
            rows="1"
            class="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-32"
            @keydown="handleKeydown"
          />
          <button
            class="btn btn-primary btn-sm btn-square flex-shrink-0"
            :disabled="!messageText.trim() || sending"
            @click="handleSend"
          >
            <svg
              v-if="!sending"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <span v-else class="loading loading-spinner loading-xs" />
          </button>
        </div>
        <div v-else class="p-3 border-t text-center text-xs text-gray-400">
          Только продавец может отвечать в этом чате
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useAdminSocket } from '@/composables/useAdminSocket'
import { jwtDecode } from 'jwt-decode'

interface ChatDetail {
  id: string
  offerId: string
  sellerId: number
  buyerId: number
  offer: { id: string; title: string }
  seller: { id: number; email: string }
  buyer: { id: number; email: string }
  lastMessageAt: string | null
  createdAt: string
}

interface ChatMessage {
  id: string
  chatId: string
  senderId: number
  message: string
  isRead: boolean
  createdAt: string
}

const route = useRoute()
const chatId = String(route.params.id)
const authStore = useAuthStore()
const { joinChat, leaveChat, onMessageCreated, onMessageRead } = useAdminSocket()

// Decode current user from JWT
const currentUserId = computed<number | null>(() => {
  if (!authStore.accessToken) return null
  try {
    const decoded = jwtDecode<{ sub: string | number }>(authStore.accessToken)
    return Number(decoded.sub)
  } catch {
    return null
  }
})

const chat = ref<ChatDetail | null>(null)
const messages = ref<ChatMessage[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const loadingMsgs = ref(true)
const loadingMore = ref(false)
const messageText = ref('')
const sending = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

const hasMore = computed(() => messages.value.length < total.value)

let unsubMsg: (() => void) | null = null
let unsubRead: (() => void) | null = null

// Seller check: current user is the seller of this chat
const isSeller = computed(() => chat.value !== null && currentUserId.value === chat.value.sellerId)

async function loadChat() {
  loading.value = true
  try {
    chat.value = await api<ChatDetail>(`/api/chats/${chatId}`)
  } finally {
    loading.value = false
  }
}

async function loadMessages(p = 1) {
  if (p === 1) loadingMsgs.value = true
  else loadingMore.value = true
  try {
    const data = await api<{ data: ChatMessage[]; total: number }>(
      `/api/chats/${chatId}/messages`,
      { params: { page: p } },
    )
    if (p === 1) {
      messages.value = data.data
    } else {
      messages.value = [...data.data, ...messages.value]
    }
    total.value = data.total
    page.value = p
  } finally {
    loadingMsgs.value = false
    loadingMore.value = false
  }
}

async function loadMore() {
  if (loadingMore.value) return
  await loadMessages(page.value + 1)
}

async function handleSend() {
  const text = messageText.value.trim()
  if (!text || sending.value || !currentUserId.value) return

  const optimistic: ChatMessage = {
    id: `tmp-${Date.now()}`,
    chatId,
    senderId: currentUserId.value,
    message: text,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  messageText.value = ''
  messages.value.push(optimistic)
  scrollToBottom()
  sending.value = true

  try {
    const real = await api<ChatMessage>(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: { message: text },
    })
    const idx = messages.value.findIndex((m) => m.id === optimistic.id)
    if (idx !== -1) messages.value[idx] = real
  } catch {
    messages.value = messages.value.filter((m) => m.id !== optimistic.id)
    messageText.value = text
  } finally {
    sending.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  await Promise.all([loadChat(), loadMessages(1)])
  scrollToBottom()

  // Mark as read
  api(`/api/chats/${chatId}/read`, { method: 'POST' }).catch(() => {})

  joinChat(chatId)

  unsubMsg = onMessageCreated((msg) => {
    if (msg.chatId !== chatId) return

    // If own message: replace optimistic
    if (msg.senderId === currentUserId.value) {
      const tmpIdx = messages.value.findIndex((m) => m.id.startsWith('tmp-'))
      if (tmpIdx !== -1) {
        messages.value[tmpIdx] = msg
        scrollToBottom()
        return
      }
    }

    // Incoming message from the other party
    const alreadyExists = messages.value.some((m) => m.id === msg.id)
    if (!alreadyExists) {
      messages.value.push(msg)
      scrollToBottom()
    }

    // Mark read since we're looking at this chat
    api(`/api/chats/${chatId}/read`, { method: 'POST' }).catch(() => {})
  })

  unsubRead = onMessageRead((data) => {
    if (data.chatId !== chatId) return
    messages.value = messages.value.map((m) => ({
      ...m,
      isRead: m.senderId === currentUserId.value ? true : m.isRead,
    }))
  })
})

onBeforeUnmount(() => {
  leaveChat(chatId)
  unsubMsg?.()
  unsubRead?.()
})
</script>
