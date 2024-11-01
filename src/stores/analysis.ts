import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import type { TimeRangeType, TimeRange, MetricsType, TimeRangeState } from '@/types'
import { analysisApi } from '@/api/analysis'

export const useAnalysisStore = defineStore('analysis', {
  state: (): TimeRangeState => ({
    selectedTimeRange: 'last7d' as TimeRangeType,
    timeRange: {
      start: dayjs().subtract(6, 'day').startOf('day').valueOf(),
      end: dayjs().endOf('day').valueOf(),
    } as TimeRange,
  }),

  getters: {
    timeUnitType: (state) =>
      state.selectedTimeRange === 'last24h' || state.selectedTimeRange === 'today' ? 'hour' : 'day',
  },
  actions: {
    updateTimeRange(range: TimeRangeType, start?: number, end?: number) {
      this.selectedTimeRange = range
      if (start && end) {
        this.timeRange = { start, end }
      }
    },
    async getBasicData(shortUrl?: string) {
      try {
        return await analysisApi.getBasicData(this.timeRange, shortUrl)
      } catch (error) {
        console.error('Failed to get basic data:', error)
        return null
      }
    },
    async getTimeseriesData(shortUrl?: string) {
      try {
        return await analysisApi.getTimeseriesData(this.timeUnitType, this.timeRange, shortUrl)
      } catch (error) {
        console.error('Failed to get timeseries data:', error)
        return null
      }
    },
    async getLocationData(type: 'country' | 'region' | 'city', shortUrl?: string) {
      try {
        return await analysisApi.getLocationData(type, this.timeRange, shortUrl)
      } catch (error) {
        console.error('Failed to get location data:', error)
        return null
      }
    },
    async getMetricsData(type: MetricsType, shortUrl?: string) {
      try {
        return await analysisApi.getMetricsData(type, this.timeRange, shortUrl)
      } catch (error) {
        console.error('Failed to get metrics data:', error)
        return null
      }
    },
  },
})
