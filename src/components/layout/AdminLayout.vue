<template>
  <div class="min-h-screen xl:flex">
    <app-sidebar />
    <Backdrop />
    <div class="flex-1 transition-all duration-300 ease-in-out" :class="[isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]']">
      <app-header />
      <div class="p-4 mx-auto md:p-6">
        <RouterView/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useSidebar } from '@/composables/useSidebar'
import Backdrop from './Backdrop.vue'
import { useAdminSocket } from '@/composables/useAdminSocket'
import { useChatStore } from '@/stores/chat'
import { useNotificationStore } from '@/stores/notification'
import { useRoute } from 'vue-router'

const { isExpanded, isHovered } = useSidebar()
const { connect, onNotificationCreated } = useAdminSocket()
const chatStore = useChatStore()
const notifStore = useNotificationStore()
const route = useRoute()

onMounted(() => {
  connect()

  const unsubNotif = onNotificationCreated((n) => {
    notifStore.push(n)
    // Increment chat badge for new messages if not on that chat's page
    if (n.type === 'new_message' && n.entityId && !route.path.startsWith(`/chats/${n.entityId}`)) {
      chatStore.increment()
    }
  })

  onBeforeUnmount(() => {
    unsubNotif()
  })
})
</script>
