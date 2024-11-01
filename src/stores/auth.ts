import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { useGuestStore } from './guest'
import { useLinksStore } from './links'
import type { User, TokenPair, LinkDataCounts } from '@/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    expiresIn: null as number | null,
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken && state.expiresIn! > Date.now(),
    getTokenPair: (state): TokenPair | null => {
      if (state.accessToken && state.refreshToken && state.expiresIn) {
        return {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          expiresIn: state.expiresIn,
        }
      }
      return null
    },
    isTokenExpiringSoon: (state) => {
      const expirationThreshold = 5 * 60 * 1000 // 5 minutes
      return (
        !!state.accessToken &&
        state.expiresIn != null &&
        state.expiresIn - Date.now() < expirationThreshold
      )
    },
    username: (state) => state.user?.nickname || '',
  },
  actions: {
    setTokenPair(tokenPair: TokenPair) {
      this.accessToken = tokenPair.accessToken
      this.refreshToken = tokenPair.refreshToken
      this.expiresIn = tokenPair.expiresIn
    },

    clearTokenPair() {
      this.accessToken = null
      this.refreshToken = null
      this.expiresIn = null
      this.user = null
    },

    async checkEmail(email: string) {
      try {
        const response = await authApi.checkEmail(email)
        return response.data.exist
      } catch (error) {
        console.error('Failed to check email:', error)
        return false
      }
    },

    async verifyEmailCode(email: string, verifyCode: string): Promise<boolean> {
      try {
        await authApi.verifyEmailCode(email, verifyCode)
        return true
      } catch (error) {
        console.error('Email verification failed:', error)
        const errorMessage = (error as any).response?.data?.detail || '邮箱验证失败，请稍后重试'
        window['$message'].error(errorMessage)
        return false
      }
    },

    async login(email: string, password?: string, verifyCode?: string) {
      try {
        const response = await authApi.login(email, password, verifyCode)
        this.setTokenPair({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: Date.now() + response.data.expires_in * 1000,
        })
        await this.fetchUserInfo()

        // 处理游客数据迁移
        const guestStore = useGuestStore()
        if (guestStore.guestId) {
          const migrated = await this.migrate(guestStore.guestId)
          if (migrated) {
            guestStore.clearGuestId()
          }
        }
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async register(email: string, username: string, password: string, verifyCode: string) {
      try {
        await authApi.register(email, username, password, verifyCode)
        return true
      } catch (error) {
        console.error('Registration failed:', error)
        return false
      }
    },

    async sendVerificationCode(
      email: string,
      type: 'LOGIN' | 'REGISTER'
    ): Promise<boolean | string> {
      try {
        await authApi.sendVerificationCode(email, type)
        return true
      } catch (error) {
        console.error('Failed to send verification code:', error)
        return (error as any).response.data.detail || '发送验证码失败'
      }
    },

    async fetchUserInfo() {
      try {
        const response = await authApi.getUserInfo()
        this.user = response.data
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        window['$message'].error('获取用户信息失败')
      }
    },

    logout() {
      this.clearTokenPair()
      this.user = null
      const guestStore = useGuestStore()
      guestStore.initGuestId()
    },

    async migrate(guestId: string) {
      const linkStore = useLinksStore()
      try {
        const data = await linkStore.countLinks({ requiredGuest: true })
        if (data.links > 0) {
          const shouldMigrate = await this.showMigrationConfirmation(data)
          if (shouldMigrate) {
            return await this.migrateGuestData(guestId)
          }
        }
      } catch (error) {
        console.error('Failed to check guest data:', error)
      }
      return false
    },

    async migrateGuestData(guestId: string) {
      try {
        const response = await authApi.migrateGuestData(guestId)
        window['$notification'].success({
          title: '合并本地数据',
          content: `成功合并 ${response.data.links} 条链接记录和 ${response.data.analytics} 条分析记录`,
        })
        return true
      } catch (error) {
        console.error('Failed to migrate guest data:', error)
        window['$notification'].error({
          title: '合并本地数据',
          content: '合并本地数据失败',
        })
        return false
      }
    },

    async showMigrationConfirmation(counts: LinkDataCounts): Promise<boolean> {
      return new Promise((resolve) => {
        window['$dialog'].info({
          title: '合并本地数据',
          content: `检查到本地有 ${counts.links} 条链接记录。是否要将这些数据合并到您的账户？`,
          positiveText: '合并',
          negativeText: '取消',
          maskClosable: false,
          closable: true,
          onClose: () => resolve(false),
          onPositiveClick: () => resolve(true),
        })
      })
    },
  },
  persist: {
    key: 'auth',
    storage: localStorage,
  },
})
