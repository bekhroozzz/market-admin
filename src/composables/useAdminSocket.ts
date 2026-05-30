import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'

let socket: Socket | null = null

export interface IncomingMessage {
  id: string
  chatId: string
  senderId: number
  message: string
  isRead: boolean
  createdAt: string
}

export interface IncomingNotification {
  id: string
  userId: number
  type: string
  title: string
  body: string
  entityId: string | null
  isRead: boolean
  createdAt: string
}

export function useAdminSocket() {
  function connect() {
    const authStore = useAuthStore()
    if (!authStore.accessToken) return
    if (socket?.connected) return

    // Strip trailing /api so socket connects to the root server URL
    const baseUrl = (import.meta.env.VITE_API_URL as string || 'http://localhost:4000')
      .replace(/\/api\/?$/, '')

    socket = io(`${baseUrl}/ws`, {
      auth: { token: authStore.accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
  }

  /**
   * Returns an unsubscribe function — call it in onBeforeUnmount to remove
   * only THIS component's listener, without affecting other components.
   */
  function onMessageCreated(cb: (msg: IncomingMessage) => void): () => void {
    socket?.on('message.created', cb)
    return () => socket?.off('message.created', cb)
  }

  function onNotificationCreated(cb: (n: IncomingNotification) => void): () => void {
    socket?.on('notification.created', cb)
    return () => socket?.off('notification.created', cb)
  }

  function onMessageRead(cb: (data: { chatId: string }) => void): () => void {
    socket?.on('message.read', cb)
    return () => socket?.off('message.read', cb)
  }

  function joinChat(chatId: string) {
    socket?.emit('chat.join', { chatId })
  }

  function leaveChat(chatId: string) {
    socket?.emit('chat.leave', { chatId })
  }

  function isConnected() {
    return socket?.connected ?? false
  }

  return {
    connect,
    disconnect,
    onMessageCreated,
    onNotificationCreated,
    onMessageRead,
    joinChat,
    leaveChat,
    isConnected,
  }
}
