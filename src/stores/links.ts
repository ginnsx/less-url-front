import { defineStore } from 'pinia'
import { LinkService } from '@/services/linkService'
import type { QueryParams, PaginationResponse } from '@/api/axiosWrapper'

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

interface LinkDataCounts {
  links: number
  analytics: number
}

const useLinksStore = defineStore('links', {
  state: () => ({
    links: [] as Link[],
    currentLink: null as Link | null,
  }),
  actions: {
    async fetchLinks(params: QueryParams = {}): Promise<PaginationResponse<Link>> {
      try {
        const response = await LinkService.getLinks(params)
        this.links = response.records ?? []
        return response
      } catch (error) {
        console.error('Failed to fetch links:', error)
        throw error
      }
    },
    async fetchRecentLinks() {
      try {
        await this.fetchLinks({
          page: 1,
          size: 50,
          sort: {
            created_at: 'desc',
          },
        })
      } catch (error) {
        console.error('Failed to fetch recent links:', error)
        throw error
      }
    },
    async createLink(originalUrl: string, customAlias: string | null, expiresAt: number | null) {
      try {
        const newLink = await LinkService.createLink(originalUrl, customAlias, expiresAt)
        this.currentLink = newLink
        await this.fetchRecentLinks()
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
    async countLinks({
      requiredGuest = false,
      requiredJWT = false,
    }: {
      requiredGuest?: boolean
      requiredJWT?: boolean
    } = {}) {
      try {
        return await LinkService.countLinks({ requiredGuest, requiredJWT })
      } catch (error) {
        console.error('Failed to count links:', error)
        throw error
      }
    },
  },
})

export { type Link, type LinkDataCounts, useLinksStore }
