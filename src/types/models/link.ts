export interface Link {
  id: number
  shortUrl: string
  originalUrl: string
  visits: number
  isCustom: boolean
  ownerId: string
  createdAt: number
  updatedAt: number
  expiresAt: number
}

export interface LinkDataCounts {
  links: number
  analytics: number
}
