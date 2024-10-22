import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { type TokenPair, useAuthStore } from '@/stores/auth'
import { useGuestStore } from '@/stores/guest'

// 定义分页参数接口，支持页码分页和游标分页
interface PaginationParams {
  page?: number
  size?: number
  after?: string | number
}

interface PaginationResponse<T> {
  records: T[]
  total: number
  pages: number
  size: number
  current: number
}

// 定义排序参数接口
interface SortParams {
  [key: string]: 'asc' | 'desc'
}

// 定义查询参数接口，继承分页参数并添加排序和其他自定义参数
interface QueryParams extends PaginationParams {
  sort?: SortParams
  [key: string]: any
}

// 扩展 Axios 配置接口，添加自定义配置项
interface AxiosWrapperConfig extends AxiosRequestConfig {
  baseURL: string
  tokenRefreshURL: string
  authorizationHeader?: string
}

interface AxiosWrapperRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean
  requiredGuest?: boolean
  requiredJWT?: boolean
  noAuth?: boolean
}

export type {
  PaginationParams,
  PaginationResponse,
  SortParams,
  QueryParams,
  AxiosWrapperConfig,
  AxiosWrapperRequestConfig,
}

class AxiosWrapper {
  private instance: AxiosInstance
  private config: AxiosWrapperConfig

  constructor(config: AxiosWrapperConfig) {
    this.config = config
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  private async getAuthHeader(config: AxiosWrapperRequestConfig): Promise<Record<string, string>> {
    const authStore = useAuthStore()
    const guestStore = useGuestStore()
    if (config.requiredGuest && guestStore.isGuest) {
      return { 'Guest-ID': guestStore.guestId! }
    }
    if (config.requiredJWT || authStore.isAuthenticated) {
      const token = await this.getValidToken()
      const headerName = this.config.authorizationHeader || 'Authorization'
      return token ? { [headerName]: `Bearer ${token}` } : {}
    }
    if (guestStore.isGuest) {
      return { 'Guest-ID': guestStore.guestId! }
    }
    if (config.noAuth) {
      return { 'No-Auth': 'true' }
    }
    return {}
  }

  // 设置请求和响应拦截器
  private setupInterceptors() {
    // 请求拦截器：添加认证令牌
    this.instance.interceptors.request.use(
      async (config) => {
        if (this.shouldAttachToken(config)) {
          const authHeader = await this.getAuthHeader(config)
          config.headers = config.headers.concat(authHeader)
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器：处理令牌过期
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore()
          if (authStore.isAuthenticated) {
            try {
              await this.refreshToken()
              return this.instance(error.config)
            } catch (refreshError) {
              authStore.clearTokenPair()
              throw refreshError
            }
          }
        }
        throw error
      }
    )
  }

  // 判断是否应该附加令牌
  private shouldAttachToken(config: AxiosRequestConfig): boolean {
    const authStore = useAuthStore()
    const guestStore = useGuestStore()
    const { requireAuth, requiredGuest, requiredJWT, noAuth } = config as AxiosWrapperRequestConfig
    const noTokenRequired = noAuth || config.headers?.['No-Auth'] === 'true'

    const isAuthenticated = authStore.isAuthenticated || guestStore.isGuest
    // 如果明确要求认证，或者用户已登录/是guest且没有明确指示不需要token，则附加token
    return (
      (requireAuth || requiredGuest || requiredJWT || (isAuthenticated && !noTokenRequired)) &&
      config.url !== this.config.tokenRefreshURL
    )
  }

  // 获取有效的访问令牌
  private async getValidToken(): Promise<string | null> {
    const authStore = useAuthStore()

    try {
      await this.refreshTokenIfNeeded()
    } catch (error) {
      return null
    }
    return authStore.accessToken
  }

  // 刷新令牌
  public async refreshToken(): Promise<void> {
    const authStore = useAuthStore()
    const currentTokenPair = authStore.getTokenPair

    if (!currentTokenPair) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await this.instance.post<TokenPair>(this.config.tokenRefreshURL, {
        refreshToken: currentTokenPair.refreshToken,
      })
      authStore.setTokenPair(response.data)
    } catch (error) {
      authStore.clearTokenPair()
      throw error
    }
  }

  private async refreshTokenIfNeeded() {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated && authStore.isTokenExpiringSoon) {
      await this.refreshToken()
    }
  }

  // 转换查询参数，处理排序参数
  private transformQueryParams(params: QueryParams): Record<string, any> {
    const transformedParams: Record<string, any> = { ...params }
    if (params.sort && Object.keys(params.sort).length > 0) {
      const sortBy = Object.entries(params.sort)
        .map(([key, order]) => `${order === 'desc' ? '-' : ''}${key}`)
        .join(',')
      transformedParams.sortBy = sortBy
      delete transformedParams.sort
    }

    return transformedParams
  }

  // GET 请求方法
  public async get<T = any>(
    url: string,
    params: QueryParams = {},
    config: AxiosWrapperRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const transformedParams = this.transformQueryParams(params)
    return this.instance.get<T>(url, {
      ...config,
      params: transformedParams,
    })
  }

  // POST 请求方法
  public async post<T = any>(
    url: string,
    data?: any,
    config: AxiosWrapperRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config)
  }

  // PUT 请求方法
  public async put<T = any>(
    url: string,
    data?: any,
    config: AxiosWrapperRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config)
  }

  // DELETE 请求方法
  public async delete<T = any>(
    url: string,
    config: AxiosWrapperRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config)
  }
}

// 创建 AxiosWrapper 实例的工厂函数
export function createAxiosWrapper(config: AxiosWrapperConfig): AxiosWrapper {
  return new AxiosWrapper(config)
}

export const api = createAxiosWrapper({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  tokenRefreshURL: '/auth/refresh',
  authorizationHeader: 'Authorization',
})

export default AxiosWrapper
