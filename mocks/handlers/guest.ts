import { http } from 'msw'
import { faker } from '@faker-js/faker'
import { jsonResponse } from '../utils/response'

interface GuestData {
  guestId: string
  createdAt: number
}

export const guestData = new Map<string, GuestData>()

function generateGuestId(): string {
  let guestId: string
  do {
    guestId = faker.string.alphanumeric(10)
  } while (guestData.has(guestId))

  return guestId
}

export const guestHandlers = [
  // Fetch guest ID endpoint
  http.get('/api/v1/auth/guest-id', () => {
    const guestId = generateGuestId()

    // 存储访客数据
    const guestInfo: GuestData = {
      guestId,
      createdAt: Date.now(),
    }
    guestData.set(guestId, guestInfo)

    return jsonResponse({ guestId })
  }),
]
