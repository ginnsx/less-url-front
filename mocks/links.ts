import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'
import { createResponse, createErrorResponse, getOwnerIdFromRequest } from './utils'
import type { Link, PaginationResponse } from '@/types'
import { links, linksWithAnalytics } from './data'
import { SHORT_URL_PREFIX } from './data/configs'

type LinkKey = keyof Link

// 添加工具函数，转换排序字段名
function convertSortField(field: string): string {
  // 转换下划线为驼峰
  return field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export default [
  // Get links list with pagination
  {
    url: '/api/v1/links',
    method: 'get',
    response: (req: any) => {
      const ownerId = getOwnerIdFromRequest(req)
      const { page = 1, size = 10, sortBy, filters } = req.query

      // Filter by owner
      let filteredLinks = [...links].filter((link) => link.ownerId === ownerId)

      // Handle search
      if (filters) {
        filteredLinks = filteredLinks.filter(
          (link) => link.shortUrl.includes(filters) || link.originalUrl.includes(filters)
        )
      }

      // Handle sorting
      if (sortBy) {
        const sortFields = sortBy.split(',')
        filteredLinks.sort((a, b) => {
          for (const field of sortFields) {
            const isDesc = field.startsWith('-')
            const fieldName = convertSortField(field.replace(/^[+-]/, ''))

            if (a[fieldName as LinkKey] === b[fieldName as LinkKey]) continue

            const compareResult = a[fieldName as LinkKey] < b[fieldName as LinkKey] ? -1 : 1
            return isDesc ? -compareResult : compareResult
          }
          return 0
        })
      }

      // Handle pagination
      const start = (page - 1) * size
      const paginatedLinks = filteredLinks.slice(start, start + size)

      return createResponse<PaginationResponse<Link>>({
        records: paginatedLinks,
        total: filteredLinks.length,
        pages: Math.ceil(filteredLinks.length / Number(size)),
        current: Number(page),
        size: Number(size),
      })
    },
  },

  // Get single link
  {
    url: '/api/v1/links/:id',
    method: 'get',
    response: (opt: any) => {
      const id = Number(opt.url.split('/').pop())
      const ownerId = getOwnerIdFromRequest(opt)

      const link = links.find((l) => l.id === id && l.ownerId === ownerId)
      return link ? createResponse(link) : createErrorResponse(404, 'Link not found')
    },
  },

  // Create link
  {
    url: '/api/v1/links',
    method: 'post',
    response: (opt: any) => {
      const { originalUrl, customAlias, expiresAt } = opt.body
      const ownerId = getOwnerIdFromRequest(opt)

      if (!ownerId) {
        return createErrorResponse(401, 'Unauthorized')
      }

      const newLink: Link = {
        id: links.length + 1,
        shortUrl: `${SHORT_URL_PREFIX}${customAlias || Mock.Random.string('lower', 6)}`,
        originalUrl,
        visits: 0,
        isCustom: !!customAlias,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
        ownerId,
      }

      links.push(newLink)
      // 同时添加到 linksWithAnalytics
      linksWithAnalytics.push({
        link: newLink,
        visits: [],
      })

      return createResponse(newLink)
    },
  },

  {
    url: '/api/v1/links/counts',
    method: 'get',
    response: (opt: any) => {
      const ownerId = getOwnerIdFromRequest(opt)

      const ownerLinks = linksWithAnalytics.filter((l) => l.link.ownerId === ownerId)
      const counts = ownerLinks.reduce((acc, curr) => {
        return acc + curr.visits.length
      }, 0)

      return createResponse({ links: ownerLinks.length, analytics: counts })
    },
  },

  // Update link
  {
    url: '/api/v1/links/:id',
    method: 'put',
    response: (opt: any) => {
      const id = Number(opt.url.split('/').pop())
      const ownerId = getOwnerIdFromRequest(opt)

      const linkIndex = links.findIndex((l) => l.id === id && l.ownerId === ownerId)
      if (linkIndex === -1) {
        return createErrorResponse(404, 'Link not found')
      }

      const updatedLink = {
        ...links[linkIndex],
        ...opt.body,
        updatedAt: Date.now(),
      }

      links[linkIndex] = updatedLink
      // 更新 linksWithAnalytics
      const analyticsIndex = linksWithAnalytics.findIndex((l) => l.link.id === id)
      if (analyticsIndex !== -1) {
        linksWithAnalytics[analyticsIndex].link = updatedLink
      }

      return createResponse(updatedLink)
    },
  },

  // Delete link
  {
    url: '/api/v1/links/:id',
    method: 'delete',
    response: (opt: any) => {
      const id = Number(opt.url.split('/').pop())
      const ownerId = getOwnerIdFromRequest(opt)

      const linkIndex = links.findIndex((l) => l.id === id && l.ownerId === ownerId)
      if (linkIndex === -1) {
        return createErrorResponse(404, 'Link not found')
      }

      links.splice(linkIndex, 1)
      // 同时从 linksWithAnalytics 中删除
      const analyticsIndex = linksWithAnalytics.findIndex((l) => l.link.id === id)
      if (analyticsIndex !== -1) {
        linksWithAnalytics.splice(analyticsIndex, 1)
      }

      return createResponse(null)
    },
  },
] as MockMethod[]
