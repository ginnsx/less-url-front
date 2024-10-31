export type TimeRangeType =
  | 'today'
  | 'last24h'
  | 'thisWeek'
  | 'last7d'
  | 'thisMonth'
  | 'last30d'
  | 'last90d'
  | 'custom'

export interface TimeRangeState {
  selectedTimeRange: TimeRangeType
  timeRange: [number, number]
}
