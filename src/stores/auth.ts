import { defineStore } from 'pinia'
import { useGuestStore } from '@/stores/guest'
// 定义 JWT 令牌对的接口
export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    expiresAt: null as number | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken && state.expiresAt! > Date.now(),
    getTokenPair: (state): TokenPair | null => {
      if (state.accessToken && state.refreshToken && state.expiresAt) {
        return {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          expiresAt: state.expiresAt,
        }
      }
      return null
    },
    isTokenExpiringSoon: (state) => {
      const expirationThreshold = 5 * 60 * 1000 // 5 minutes
      return state.expiresAt != null && state.expiresAt - Date.now() < expirationThreshold
    },
  },
  actions: {
    setTokenPair(tokenPair: TokenPair) {
      this.accessToken = tokenPair.accessToken
      this.refreshToken = tokenPair.refreshToken
      this.expiresAt = tokenPair.expiresAt
    },
    clearTokenPair() {
      this.accessToken = null
      this.refreshToken = null
      this.expiresAt = null
    },
    async login(username: string, password: string) {
      // 执行登录逻辑
      // ...

      // 登录成功后，清除 guest id
      const guestStore = useGuestStore()
      guestStore.clearGuestId()
    },
    logout() {
      this.clearTokenPair()
      // 登出后，初始化 guest id
      const guestStore = useGuestStore()
      guestStore.initGuestId()
    },
  },
  persist: {
    key: 'auth',
    storage: localStorage,
  },
})
