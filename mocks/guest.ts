import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

const Random = Mock.Random

// Store guest IDs with their associated data
interface GuestData {
  guestId: string
  createdAt: number
}

// Export for other modules to use
export const guestData = new Map<string, GuestData>()

const generateGuestId = (): string => {
  let guestId: string
  do {
    guestId = `guest_${Random.string('lower', 8)}`
  } while (guestData.has(guestId))

  guestData.set(guestId, {
    guestId,
    createdAt: Date.now(),
  })

  return guestId
}

export default [
  // Fetch guest ID endpoint
  {
    url: '/api/v1/auth/guest-id',
    method: 'get',
    response: () => {
      return {
        guestId: generateGuestId(),
      }
    },
  },
] as MockMethod[]
