import { api } from './axiosWrapper'
// import type { AnalyticsData, TimeRange } from '@/types'

export interface AnalyticsData {
  visits: number
  uniqueVisitors: number
  avgDuration: number
  bounceRate: number
}

export interface TimeRange {
  start: number
  end: number
}

export const analysisApi = {
  getAnalytics: async (linkId: string, timeRange: TimeRange) => {
    return api.get<AnalyticsData>(`/analytics/${linkId}`, {
      startTime: timeRange.start,
      endTime: timeRange.end,
    })
  },

  getVisitTrends: async (linkId: string, timeRange: TimeRange) => {
    return api.get(`/analytics/${linkId}/trends`, {
      startTime: timeRange.start,
      endTime: timeRange.end,
    })
  },

  getGeoDistribution: async (linkId: string, timeRange: TimeRange) => {
    return api.get(`/analytics/${linkId}/geo`, {
      startTime: timeRange.start,
      endTime: timeRange.end,
    })
  },
}
