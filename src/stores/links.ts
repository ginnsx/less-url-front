import { defineStore } from 'pinia'
import { linksApi } from '@/api/links'
import type { Link, LinkDataCounts, QueryParams } from '@/types'

export const useLinksStore = defineStore('links', {
  state: () => ({
    links: [] as Link[],
    loading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  }),

  actions: {
    async createLink(data: {
      originalUrl: string
      customAlias?: string
      expiresAt?: number
    }): Promise<Link | null> {
      try {
        const result = await linksApi.createLink(data)
        await this.fetchRecentLinks() // 刷新列表
        return result
      } catch (error) {
        console.error('Failed to create link:', error)
        return null
      }
    },

    async fetchLinks(params: QueryParams = {}) {
      this.loading = true
      try {
        const result = await linksApi.getLinks({
          page: this.currentPage,
          size: this.pageSize,
          ...params,
        })
        this.links = result.records ?? []
        this.total = result.total ?? 0
        this.totalPages = result.pages ?? 0
      } catch (error) {
        console.error('Failed to fetch links:', error)
        window['$message'].error('获取链接列表失败')
      } finally {
        this.loading = false
      }
    },

    async fetchLink(id: string) {
      try {
        const result = await linksApi.getLink(id)
        return result
      } catch (error) {
        console.error('Failed to fetch link:', error)
        return null
      }
    },

    async fetchRecentLinks() {
      try {
        await this.fetchLinks({
          page: 1,
          size: 20,
          sort: {
            created_at: 'desc',
          },
        })
      } catch (error) {
        console.error('Failed to fetch recent links:', error)
      }
    },

    async updateLink(id: string, data: Partial<Link>) {
      try {
        await linksApi.updateLink(id, data)
        await this.fetchLinks() // 刷新列表
        return true
      } catch (error) {
        console.error('Failed to update link:', error)
        return false
      }
    },

    async deleteLink(id: string) {
      try {
        await linksApi.deleteLink(id)
        await this.fetchLinks() // 刷新列表
        return true
      } catch (error) {
        console.error('Failed to delete link:', error)
        return false
      }
    },

    async countLinks(
      params: { requiredGuest?: boolean; requiredJWT?: boolean } = {}
    ): Promise<LinkDataCounts> {
      try {
        const result = await linksApi.countLinks(params)
        return result
      } catch (error) {
        console.error('Failed to count links:', error)
        return { links: 0, analytics: 0 }
      }
    },

    async fetchLatestLink() {
      try {
        const result = await linksApi.getLinks({
          page: 1,
          size: 1,
          sort: { created_at: 'desc' },
        })
        return result.records[0]
      } catch (error) {
        console.error('Failed to fetch latest link:', error)
        return null
      }
    },

    setPage(page: number) {
      this.currentPage = page
    },

    setPageSize(size: number) {
      this.pageSize = size
      this.currentPage = 1 // 重置到第一页
    },

    clearLinks() {
      this.links = []
      this.total = 0
    },
  },
})
