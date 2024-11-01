import type { AxiosRequestConfig } from 'axios'

export interface PaginationParams {
  page?: number
  size?: number
  after?: string | number
}

export interface PaginationResponse<T> {
  records: T[]
  total: number // 总条数
  pages: number // 总页数
  size: number // 每页条数
  current: number // 当前页码
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
