export interface Link {
  id: string
  shortUrl: string
  originalUrl: string
  visits: number
  isCustom: boolean
  createdAt: number
  updatedAt: number
  expiresAt: number
}

export interface LinkDataCounts {
  links: number
  analytics: number
}
