import { defineStore } from 'pinia'
import { encryptData, decryptData } from '@/utils/crypto'
import { api } from '@/api/axiosWrapper'

async function fetchGuestId(): Promise<string> {
  try {
    const response = await api.get<{ guestId: string }>('/auth/guest-id')
    return response.data.guestId
  } catch (error) {
    console.error('Failed to fetch guest ID:', error)
    throw error
  }
}

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
        const newGuestId = await fetchGuestId()
        this.guestId = newGuestId
        const encryptedGuestId = await encryptData(newGuestId)
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

export async function setupGuestStore() {
  const guestStore = useGuestStore()
  try {
    await guestStore.initGuestId()
  } catch (error) {
    console.error('Failed to setup guest store:', error)
  }
}
