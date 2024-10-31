import { api } from './axiosWrapper'

export const guestApi = {
  fetchGuestId: async () => {
    return api.get<{ guestId: string }>('/auth/guest-id')
  },
}
