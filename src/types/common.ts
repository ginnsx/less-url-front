// 通用响应类型
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 通用分页请求参数
export interface PaginationQuery {
  page: number
  pageSize: number
}

// 工具类型
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
