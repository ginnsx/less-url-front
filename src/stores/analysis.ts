import { defineStore } from 'pinia'
import dayjs from 'dayjs'

export type TimeRangeType =
  | 'today'
  | 'last24h'
  | 'thisWeek'
  | 'last7d'
  | 'thisMonth'
  | 'last30d'
  | 'last90d'
  | 'custom'

interface TimeRangeState {
  selectedTimeRange: TimeRangeType
  timeRange: [number, number]
}

export const useAnalysisStore = defineStore('analysis', {
  state: (): TimeRangeState => ({
    selectedTimeRange: 'last7d',
    timeRange: [
      dayjs().subtract(6, 'day').startOf('day').valueOf(),
      dayjs().endOf('day').valueOf(),
    ],
  }),

  actions: {
    updateTimeRange(range: TimeRangeType, start?: number, end?: number) {
      this.selectedTimeRange = range
      if (start && end) {
        this.timeRange = [start, end]
      }
    },
  },
})
