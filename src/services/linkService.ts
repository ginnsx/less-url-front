import type { Link } from '@/stores/links'
import type { QueryParams } from '@/api/axiosWrapper'
import { api } from '@/api/axiosWrapper'

export const LinkService = {
  async getLinks(params: QueryParams = {}): Promise<Link[]> {
    const response = await api.get(`/links`, { ...params })
    if (response.status === 200) {
      return response.data.data
    } else {
      throw new Error('Failed to fetch links')
    }
  },
  async createLink(
    longUrl: string,
    customAlias: string | null,
    expirationTime: number | null
  ): Promise<Link> {
    const response = await api.post('/links', { longUrl, customAlias, expirationTime })
    if (response.status === 200) {
      return response.data.data
    } else {
      throw new Error('Failed to create link')
    }
  },
  async getLinkDetails(id: string): Promise<Link> {
    const response = await api.get(`/links/${id}`)
    if (response.status === 200) {
      return response.data.data
    } else {
      throw new Error('Failed to fetch link details')
    }
  },
}
