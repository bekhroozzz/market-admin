import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  entityId: string | null
  isRead: boolean
  createdAt: string
}

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])

  const unreadCount = computed(() => items.value.filter((n) => !n.isRead).length)
  const hasUnread = computed(() => unreadCount.value > 0)

  function push(n: AppNotification) {
    // Avoid duplicates
    if (items.value.find((x) => x.id === n.id)) return
    items.value.unshift(n)
    // Cap list at 50
    if (items.value.length > 50) items.value = items.value.slice(0, 50)
  }

  function markRead(id: string) {
    const item = items.value.find((n) => n.id === id)
    if (item) item.isRead = true
  }

  function markAllRead() {
    items.value.forEach((n) => (n.isRead = true))
  }

  return { items, unreadCount, hasUnread, push, markRead, markAllRead }
})
