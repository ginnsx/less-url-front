import type { AxiosRequestConfig } from 'axios'

export interface PaginationParams {
  page?: number
  size?: number
  after?: string | number
}

export interface PaginationResponse<T> {
  records: T[]
  total: number
  pages: number
  size: number
  current: number
}

export interface SortParams {
  [key: string]: 'asc' | 'desc'
}

export interface QueryParams extends PaginationParams {
  sort?: SortParams
  [key: string]: any
}

export interface AxiosWrapperConfig extends AxiosRequestConfig {
  baseURL: string
  tokenRefreshURL: string
  authorizationHeader?: string
}

export interface AxiosWrapperRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean
  requiredGuest?: boolean
  requiredJWT?: boolean
  noAuth?: boolean
}
