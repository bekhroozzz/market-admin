import { useApiPost } from '@/composables/useApi.ts'
import { useAuthStore } from '@/stores/auth.ts'
import { storeToRefs } from 'pinia'
import { getCookie, setCookie } from '@/utils/cookie.ts'
import { jwtDecode } from 'jwt-decode'

export interface AuthJwt {
  accessToken: string,
  refreshToken: string,
  refreshTokenExpire: number
}

export async function useRefreshToken(): Promise<AuthJwt> {
  const refreshToken = getCookie('refreshToken')

  return useApiPost<AuthJwt>('/api/auth/refresh', {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  })
}

export function useSetTokens(data: AuthJwt) {
  const authStore = useAuthStore()
  const { isLogged, accessToken, userRole } = storeToRefs(authStore)

  const expires = new Date(data.refreshTokenExpire * 1000)
  accessToken.value = data.accessToken
  setCookie('refreshToken', data.refreshToken, expires)
  isLogged.value = true

  try {
    const decoded = jwtDecode<{ role?: string }>(data.accessToken)
    userRole.value = decoded.role
  } catch {
    userRole.value = undefined
  }
}
