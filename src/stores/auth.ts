import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLogged = ref(false)
  const accessToken = ref<string | undefined>()
  const userRole = ref<string | undefined>()

  return { isLogged, accessToken, userRole }
})
