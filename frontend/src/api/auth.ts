import api from './axios'

export const registerRequest = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password })

export const loginRequest = (email: string, password: string) =>
  api.post('/auth/login', { email, password })