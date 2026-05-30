<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { api } from '@/utils/api'

const router = useRouter()
const store = useNotificationStore()
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const TYPE_ICONS: Record<string, string> = {
  new_message: '💬',
  offer_created: '📦',
  offer_updated: '✏️',
  offer_approved: '✅',
  offer_rejected: '❌',
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

async function handleNotificationClick(id: string, entityId: string | null, type: string) {
  store.markRead(id)
  closeDropdown()

  // Mark as read on the backend
  api(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {})

  // Navigate to relevant entity
  if (type === 'new_message' && entityId) {
    await router.push(`/chats/${entityId}`)
  }
}

async function markAllRead() {
  store.markAllRead()
  api('/api/notifications/read-all', { method: 'POST' }).catch(() => {})
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Bell button -->
    <button
      class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      @click="toggleDropdown"
    >
      <!-- Ping dot -->
      <span
        v-if="store.hasUnread"
        class="absolute right-0 top-0.5 z-10 flex h-2 w-2"
      >
        <span class="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        <span class="relative inline-flex w-2 h-2 bg-orange-400 rounded-full"></span>
      </span>

      <!-- Bell icon -->
      <svg class="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          fill=""/>
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="dropdownOpen"
      class="absolute -right-[200px] mt-[17px] flex flex-col w-[350px] max-h-[480px] rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:w-[380px] lg:right-0 z-50"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <h5 class="text-base font-semibold text-gray-800 dark:text-white">Уведомления</h5>
          <span
            v-if="store.unreadCount > 0"
            class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-xs font-bold"
          >
            {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
          </span>
        </div>
        <button
          v-if="store.hasUnread"
          class="text-xs text-blue-500 hover:underline"
          @click="markAllRead"
        >
          Прочитать все
        </button>
      </div>

      <!-- List -->
      <ul class="flex-1 overflow-y-auto">
        <li
          v-for="n in store.items"
          :key="n.id"
          @click="handleNotificationClick(n.id, n.entityId, n.type)"
          class="flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': !n.isRead }"
        >
          <!-- Icon -->
          <span class="flex-shrink-0 text-2xl leading-none mt-0.5">
            {{ TYPE_ICONS[n.type] ?? '🔔' }}
          </span>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ n.title }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ n.body }}</p>
            <p class="text-[10px] text-gray-400 mt-1">{{ formatTime(n.createdAt) }}</p>
          </div>

          <!-- Unread dot -->
          <span
            v-if="!n.isRead"
            class="flex-shrink-0 w-2 h-2 rounded-full bg-orange-400 mt-2"
          />
        </li>

        <li v-if="!store.items.length" class="px-4 py-10 text-center text-gray-400 text-sm">
          Нет уведомлений
        </li>
      </ul>

      <!-- Footer -->
      <router-link
        to="/chats"
        class="px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-100 dark:border-gray-800 transition-colors rounded-b-2xl"
        @click="closeDropdown"
      >
        Все чаты →
      </router-link>
    </div>
  </div>
</template>
