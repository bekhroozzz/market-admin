import type { FetchOptions } from 'ofetch'
import { api } from '@/utils/api.ts'

export const useApiGet = <T>(url: string, options?: FetchOptions<'json'>): Promise<T> => {
  return api<T>(url, {
    method: 'GET',
    ...options,
  })
}

export const useApiPost = <T>( url: string, options?: FetchOptions<'json'>, body?: Record<string, unknown>): Promise<T> => {
  return api<T>(url, {
    method: 'POST',
    body,
    ...options,
  })
}

export const useApiPut = <T>(url: string, options?: FetchOptions<'json'>, body?:Record<string, unknown> ,): Promise<T> => {
  return api<T>(url, {
    method: 'PUT',
    body,
    ...options,
  })
}

export const useApiPatch = <T>(url: string, options?: FetchOptions<'json'>, body?: Record<string, unknown>): Promise<T> => {
  return api<T>(url, {
    method: 'PATCH',
    body,
    ...options,
  })
}

export const useApiDelete = <T>(url: string, options?: FetchOptions<'json'>): Promise<T> => {
  return api<T>(url, {
    method: 'DELETE',
    ...options,
  })
}
