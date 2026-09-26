import api from './axios'

export const registerRequest = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password })

export const loginRequest = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const meRequest = () => api.get('/auth/me')

export const verifyEmailRequest = (token: string) => api.get(`/auth/verify/${token}`)

export const resendVerificationRequest = (email: string) =>
  api.post('/auth/resend-verification', { email })

export const forgotPasswordRequest = (email: string) =>
  api.post('/auth/forgot-password', { email })

export const resetPasswordRequest = (token: string, password: string) =>
  api.post(`/auth/reset-password/${token}`, { password })

export const contactRequest = (name: string, email: string, message: string) =>
  api.post('/contact', { name, email, message })
