import { defineStore } from 'pinia'
import { LinkService } from '@/services/linkService'

interface Link {
  id: string
  shortUrl: string
  longUrl: string
  clicks: number
  isCustom: boolean
  createdAt: number
  updatedAt: number
  expiresAt: number
}

const useLinksStore = defineStore('links', {
  state: () => ({
    links: [] as Link[],
    currentLink: null as Link | null,
  }),
  actions: {
    async fetchLinks() {
      try {
        this.links = await LinkService.getLinks()
      } catch (error) {
        console.error('Failed to fetch links:', error)
      }
    },
    async createLink(longUrl: string, customAlias: string | null, expirationTime: number | null) {
      try {
        const newLink = await LinkService.createLink(longUrl, customAlias, expirationTime)
        this.links.push(newLink)
        return newLink
      } catch (error) {
        console.error('Failed to create link:', error)
        throw error
      }
    },
    async fetchLinkDetails(id: string): Promise<Link> {
      try {
        this.currentLink = await LinkService.getLinkDetails(id)
        return this.currentLink
      } catch (error) {
        console.error('Failed to fetch link details:', error)
        throw error
      }
    },
  },
})

export { type Link, useLinksStore }
