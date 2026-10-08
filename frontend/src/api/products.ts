import api from './axios'
import type { ProductInput } from './types'

export const getProducts = (params?: { type?: string; all?: boolean }) =>
  api.get('/products', {
    params: {
      type: params?.type,
      all: params?.all ? 'true' : undefined,
    },
  })

export const getProduct = (slug: string) => api.get(`/products/slug/${slug}`)

export const getMyProducts = () => api.get('/products/me')

export const createProduct = (data: ProductInput) => api.post('/products', data)

export const updateProduct = (productId: number, data: ProductInput) =>
  api.patch(`/products/${productId}`, data)

export const uploadProductFile = (productId: number, formData: FormData) =>
  api.post(`/products/${productId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const getDownloadUrl = (productId: number, platform: string) =>
  api.get(`/products/${productId}/download/${platform}`)
