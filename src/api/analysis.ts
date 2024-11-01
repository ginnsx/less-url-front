import { api } from './axiosWrapper'
import type {
  BasicData,
  TimeRange,
  TimeseriesData,
  LocationData,
  MetricsData,
  MetricsType,
} from '@/types'

export const analysisApi = {
  getBasicData: async (timeRange: TimeRange, shortUrl?: string) => {
    return api.get<BasicData>(`/statistics/basic`, {
      startTime: timeRange.start,
      endTime: timeRange.end,
      shortUrl,
    })
  },
  getTimeseriesData: async (type: 'day' | 'hour', timeRange: TimeRange, shortUrl?: string) => {
    return api.get<TimeseriesData[]>(`/statistics/timeseries`, {
      type,
      startTime: timeRange.start,
      endTime: timeRange.end,
      shortUrl,
    })
  },
  getLocationData: async (
    type: 'country' | 'region' | 'city',
    timeRange: TimeRange,
    shortUrl?: string
  ) => {
    return api.get<LocationData[]>(`/statistics/locations`, {
      type,
      startTime: timeRange.start,
      endTime: timeRange.end,
      shortUrl,
    })
  },
  getMetricsData: async (type: MetricsType, timeRange: TimeRange, shortUrl?: string) => {
    return api.get<MetricsData[]>(`/statistics/metrics`, {
      type,
      startTime: timeRange.start,
      endTime: timeRange.end,
      shortUrl,
    })
  },
}
