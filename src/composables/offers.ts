import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/composables/useApi.ts'
import { useAuthStore } from '@/stores/auth.ts'
import type { CreateOffer, UpdateOffer, Offer } from '@/types/offer.ts'

export async function createOffer(offer: CreateOffer): Promise<Offer> {
  return useApiPost('/api/offer/create', { body: offer })
}

export async function getOffer(offerId: string): Promise<Offer> {
  return useApiGet(`/api/offer/find-by-id/${offerId}`)
}

export async function updateOffer(offerId: string, offer: UpdateOffer): Promise<Offer> {
  return useApiPut(`/api/offer/update/${offerId}`, { body: offer as Record<string, unknown> })
}

export async function deleteOffer(offerId: string): Promise<void> {
  return useApiDelete(`/api/offer/delete/${offerId}`)
}

/** Upload a single image via multipart/form-data; returns URL of the stored file. */
export async function uploadOfferImage(file: File): Promise<{ url: string }> {
  const authStore = useAuthStore()
  const baseURL = import.meta.env.VITE_API_URL ?? ''

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${baseURL}/api/upload/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw Object.assign(new Error((error as { message?: string }).message ?? 'Upload failed'), { response })
  }

  return response.json() as Promise<{ url: string }>
}
