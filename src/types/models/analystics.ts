export type TimeRangeType =
  | 'today'
  | 'last24h'
  | 'thisWeek'
  | 'last7d'
  | 'thisMonth'
  | 'last30d'
  | 'last90d'
  | 'thisYear'
  | 'last12m'
  | 'custom'

export type MetricsType =
  | 'referer'
  | 'referer_type'
  | 'language'
  | 'timezone'
  | 'device'
  | 'brand'
  | 'device_type'
  | 'os'
  | 'browser'

export interface TimeRangeState {
  selectedTimeRange: TimeRangeType
  timeRange: TimeRange
}

export interface BasicData {
  visits: number
  visitors: number
  referers: number // 错误拼写，因为 http 规范里就是错的
}

export interface MetricsData {
  name: string
  value: number
}

export interface TimeseriesData {
  time: number
  visits: number
  visitors: number
}

export interface LocationData {
  country: string
  region?: string
  city?: string
  value: number
}

export interface TimeRange {
  start: number
  end: number
}
