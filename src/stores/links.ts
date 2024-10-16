import { defineStore } from 'pinia'
import { LinkService } from '@/services/linkService'
import type { QueryParams } from '@/api/axiosWrapper'

interface Link {
  id: string
  shortUrl: string
  originalUrl: string
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
    async fetchLinks(params: QueryParams = {}): Promise<Link[]> {
      try {
        this.links = (await LinkService.getLinks(params)) ?? []
        return this.links
      } catch (error) {
        console.error('Failed to fetch links:', error)
        throw error
      }
    },
    async createLink(
      originalUrl: string,
      customAlias: string | null,
      expirationTime: number | null
    ) {
      try {
        const newLink = await LinkService.createLink(originalUrl, customAlias, expirationTime)
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
