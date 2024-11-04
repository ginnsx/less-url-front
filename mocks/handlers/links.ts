import { http } from 'msw'
import { faker } from '@faker-js/faker'
import { jsonResponse, errorResponse } from '../utils/response'
import { getOwnerIdFromRequest } from '../utils/response'
import { links, linksWithAnalytics } from '../data'
import { SHORT_URL_PREFIX } from '../data/configs'
import type { Link, PaginationResponse } from '@/types'

type LinkKey = keyof Link

// 转换排序字段名
function convertSortField(field: string): string {
  return field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

interface CreateLinkBody {
  originalUrl: string
  customAlias?: string
  expiresAt?: number
}

export const linksHandlers = [
  // Get links list with pagination
  http.get('/api/v1/links', async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const size = Number(url.searchParams.get('size')) || 10
    const sortBy = url.searchParams.get('sortBy')
    const ownerId = getOwnerIdFromRequest(request)

    // Filter by owner
    const filteredLinks = [...links].filter((link) => link.ownerId === ownerId)

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

    return jsonResponse<PaginationResponse<Link>>({
      records: paginatedLinks,
      total: filteredLinks.length,
      pages: Math.ceil(filteredLinks.length / size),
      current: page,
      size: size,
    })
  }),

  // Get link counts
  http.get('/api/v1/links/counts', async ({ request }) => {
    const ownerId = getOwnerIdFromRequest(request)
    const ownerLinks = linksWithAnalytics.filter((l) => l.link.ownerId === ownerId)
    const counts = ownerLinks.reduce((acc, curr) => acc + curr.visits.length, 0)

    return jsonResponse({
      links: ownerLinks.length,
      analytics: counts,
    })
  }),

  // Get single link
  http.get('/api/v1/links/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const ownerId = getOwnerIdFromRequest(request)

    const link = links.find((l) => l.id === id && l.ownerId === ownerId)
    if (!link) {
      return errorResponse(404, 'Link not found')
    }

    return jsonResponse(link)
  }),

  // Create link
  http.post<never, CreateLinkBody>('/api/v1/links', async ({ request }) => {
    const { originalUrl, customAlias, expiresAt } = await request.json()
    const ownerId = getOwnerIdFromRequest(request)

    if (!ownerId) {
      return errorResponse(401, 'Unauthorized')
    }

    const newLink: Link = {
      id: links.length + 1,
      shortUrl: `${SHORT_URL_PREFIX}${customAlias || faker.string.alphanumeric(6)}`,
      originalUrl,
      visits: 0,
      isCustom: !!customAlias,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000,
      ownerId,
    }

    links.push(newLink)
    linksWithAnalytics.push({
      link: newLink,
      visits: [],
    })

    return jsonResponse(newLink)
  }),

  // Update link
  http.put('/api/v1/links/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const ownerId = getOwnerIdFromRequest(request)

    const link = links.find((l) => l.id === id && l.ownerId === ownerId)
    if (!link) {
      return errorResponse(404, 'Link not found')
    }

    return jsonResponse(link)
  }),

  // Delete link
  http.delete('/api/v1/links/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const ownerId = getOwnerIdFromRequest(request)

    const linkIndex = links.findIndex((l) => l.id === id && l.ownerId === ownerId)
    if (linkIndex === -1) {
      return errorResponse(404, 'Link not found')
    }

    links.splice(linkIndex, 1)
    const analyticsIndex = linksWithAnalytics.findIndex((l) => l.link.id === id)
    if (analyticsIndex !== -1) {
      linksWithAnalytics.splice(analyticsIndex, 1)
    }

    return jsonResponse(null)
  }),
]
