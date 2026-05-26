import { useApiGet, useApiPut, useApiDelete } from '@/composables/useApi.ts'
import { useAuthStore } from '@/stores/auth.ts'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import type { SellerProfile, UpdateSellerProfilePayload, SellerOffer } from '@/types/seller-profile.ts'

export interface MyOffersResponse {
  offers: SellerOffer[]
  total: number
  page: number
  pages: number
}

function getSellerIdFromStore(): number | null {
  const authStore = useAuthStore()
  if (!authStore.accessToken) return null
  try {
    const payload = jwtDecode<JwtPayload & { sub: string }>(authStore.accessToken)
    return Number(payload.sub)
  } catch {
    return null
  }
}

/** Upload via native fetch to allow browser to set multipart Content-Type boundary */
async function uploadFormData<T>(url: string, formData: FormData): Promise<T> {
  const authStore = useAuthStore()
  const baseURL = import.meta.env.VITE_API_URL ?? ''
  const response = await fetch(`${baseURL}${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
    },
    body: formData,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw Object.assign(new Error(error.message ?? 'Upload failed'), { response })
  }
  return response.json() as Promise<T>
}

export async function getMyProfile(): Promise<SellerProfile> {
  return useApiGet<SellerProfile>('/api/seller/me/profile')
}

export async function updateMyProfile(payload: UpdateSellerProfilePayload): Promise<SellerProfile> {
  return useApiPut<SellerProfile>('/api/seller/me/profile', {}, payload as Record<string, unknown>)
}

export async function uploadGalleryImage(file: File): Promise<SellerProfile> {
  const formData = new FormData()
  formData.append('file', file)
  return uploadFormData<SellerProfile>('/api/seller/me/gallery', formData)
}

export async function deleteGalleryImage(imageId: string): Promise<SellerProfile> {
  return useApiDelete<SellerProfile>(`/api/seller/me/gallery/${imageId}`)
}

export async function getMyOffers(page = 1, limit = 12): Promise<MyOffersResponse> {
  const sellerId = getSellerIdFromStore()
  if (!sellerId) return { offers: [], total: 0, page: 1, pages: 0 }

  const response = await useApiGet<{
    offers: SellerOffer[]
    total: number
    page: number
    pages: number
    limit: number
  }>(`/api/seller/${sellerId}`, { query: { page, limit } })

  return {
    offers: response.offers,
    total: response.total,
    page: response.page,
    pages: response.pages,
  }
}
