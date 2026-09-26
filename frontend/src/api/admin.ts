import api from './axios'

export const getUsers = () => api.get('/admin/users')

export const getAdminOrders = () => api.get('/admin/orders')

export const grantAccess = (email: string, productId: number) =>
  api.post('/products/grant-access', { email, productId })
