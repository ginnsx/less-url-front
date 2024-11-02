import { defineStore } from 'pinia'
import { encryptData, decryptData } from '@/utils/crypto'
import { guestApi } from '@/api/guest'

export const useGuestStore = defineStore('guest', {
  state: () => ({
    guestId: null as string | null,
  }),

  getters: {
    isGuest(): boolean {
      return !!this.guestId
    },
  },

  actions: {
    async ensureGuestId(): Promise<string | null> {
      if (!this.guestId) {
        await this.initGuestId()
      }
      return this.guestId
    },

    async initGuestId() {
      const storedGuestId = localStorage.getItem('encryptedGuestId')
      if (storedGuestId) {
        this.guestId = await decryptData(storedGuestId)
      } else {
        const { data } = await guestApi.fetchGuestId()
        this.guestId = data.guestId
        const encryptedGuestId = await encryptData(data.guestId)
        localStorage.setItem('encryptedGuestId', encryptedGuestId)
      }
    },

    clearGuestId() {
      this.guestId = null
      localStorage.removeItem('encryptedGuestId')
    },
  },

  persist: false, // 不使用 pinia-persistence，因为我们手动管理加密的 localStorage
})

export function setupGuestStore() {
  const guestStore = useGuestStore()
  guestStore
    .initGuestId()
    .then(() => {
      console.log('Guest store initialized')
    })
    .catch((error) => {
      console.error('Failed to setup guest store:', error)
    })
}
