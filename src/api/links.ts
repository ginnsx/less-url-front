import { api } from './axiosWrapper'
import type { Link, PaginationResponse, QueryParams, LinkDataCounts } from '@/types'

export const linksApi = {
  createLink: async (data: { originalUrl: string; customAlias?: string; expiresAt?: number }) => {
    return api.post<Link>('/links', data)
  },

  getLinks: async (params: QueryParams) => {
    return api.get<PaginationResponse<Link>>('/links', params)
  },

  updateLink: async (id: string, data: Partial<Link>) => {
    return api.put<Link>(`/links/${id}`, data)
  },

  deleteLink: async (id: string) => {
    return api.delete(`/links/${id}`)
  },

  countLinks: async (
    params: { requiredGuest?: boolean; requiredJWT?: boolean } = {
      requiredGuest: false,
      requiredJWT: false,
    }
  ) => {
    return api.get<LinkDataCounts>('/links/counts', {}, params)
  },
}
