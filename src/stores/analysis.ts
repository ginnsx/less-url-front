import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import type { TimeRangeState, TimeRangeType } from '@/types'

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
