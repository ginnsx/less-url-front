import { api } from './axiosWrapper'
import type { AuthResponse, User, TokenPair, LinkDataCounts } from '@/types'

export const authApi = {
  login: async (email: string, password?: string, verifyCode?: string) => {
    return api.post<AuthResponse>('/auth/login', {
      email,
      password,
      verifyCode,
    })
  },

  register: async (email: string, username: string, password: string, verifyCode: string) => {
    return api.post('/auth/register', {
      email,
      username,
      password,
      verifyCode,
    })
  },

  checkEmail: async (email: string) => {
    return api.post('/auth/check-email', { email })
  },

  verifyEmailCode: async (email: string, verifyCode: string) => {
    return api.post('/auth/register-verification/verify', {
      email,
      verifyCode,
    })
  },

  sendVerificationCode: async (email: string, type: 'LOGIN' | 'REGISTER') => {
    const endpoint =
      type === 'REGISTER' ? '/auth/register-verification' : '/auth/email-verification'
    return api.post(endpoint, { email, type })
  },

  getUserInfo: async () => {
    return api.get<User>('/users/me')
  },

  refreshToken: async (refreshToken: string) => {
    return api.post<TokenPair>('/auth/refresh', { refreshToken })
  },

  migrateGuestData: async (guestId: string) => {
    return api.post<LinkDataCounts>('/users/migrate', { guestId })
  },
}
