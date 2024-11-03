import type { MockMethod } from 'vite-plugin-mock'
import { createResponse } from './utils'
import type { BasicData } from '@/types'
import { getVisitsInTimeRange, getMetricsData } from './data'
import type { VisitRecord } from './data/types'

// Generate timeseries data
const generateTimeseriesData = (
  visits: VisitRecord[],
  startTime: number,
  endTime: number,
  type: 'day' | 'hour'
) => {
  const interval = type === 'day' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000

  // 确保开始时间和结束时间对齐到间隔边界
  const alignedStartTime = Math.floor(startTime / interval) * interval
  const alignedEndTime = Math.ceil(endTime / interval) * interval

  // 初始化时间序列数据结构
  const visitsByTime: Record<number, { visits: number; uniqueIps: Set<string> }> = {}
  for (let time = alignedStartTime; time <= alignedEndTime; time += interval) {
    visitsByTime[time] = { visits: 0, uniqueIps: new Set() }
  }

  // 对齐访问记录到正确的时间间隔
  visits.forEach((visit) => {
    const timeKey = Math.floor(visit.timestamp / interval) * interval
    if (timeKey >= alignedStartTime && timeKey <= alignedEndTime) {
      visitsByTime[timeKey].visits++
      visitsByTime[timeKey].uniqueIps.add(`${visit.country}-${visit.city}-${visit.device}`)
    }
  })

  // 确保时间序列按时间排序
  return Object.entries(visitsByTime)
    .sort(([timeA], [timeB]) => Number(timeA) - Number(timeB))
    .map(([time, data]) => ({
      time: Number(time),
      visits: data.visits,
      visitors: data.uniqueIps.size,
    }))
}

export default [
  // Basic statistics
  {
    url: '/api/v1/statistics/basic',
    method: 'get',
    response: (req: any) => {
      const { startTime = 0, endTime = Date.now() } = req.query
      const visits = getVisitsInTimeRange(Number(startTime), Number(endTime))

      const uniqueVisitors = new Set(visits.map((v) => `${v.country}-${v.city}-${v.device}`)).size

      const uniqueReferers = new Set(visits.map((v) => v.referer)).size

      const basicData: BasicData = {
        visits: visits.length,
        visitors: uniqueVisitors,
        referers: uniqueReferers,
      }

      return createResponse(basicData)
    },
  },

  // Timeseries data
  {
    url: '/api/v1/statistics/timeseries',
    method: 'get',
    response: (req: any) => {
      const { type, startTime, endTime } = req.query
      const visits = getVisitsInTimeRange(Number(startTime), Number(endTime))
      const data = generateTimeseriesData(visits, Number(startTime), Number(endTime), type)
      return createResponse(data)
    },
  },

  // Location data
  {
    url: '/api/v1/statistics/locations',
    method: 'get',
    response: (req: any) => {
      const { type = 'country', startTime, endTime } = req.query
      const visits = getVisitsInTimeRange(Number(startTime), Number(endTime))

      const locationMap: Record<
        string,
        {
          country: string
          region?: string
          city?: string
          value: number
        }
      > = {}

      visits.forEach((visit) => {
        let key: string
        switch (type) {
          case 'country':
            key = visit.country
            break
          case 'region':
            key = `${visit.country}-${visit.region}`
            break
          case 'city':
            key = `${visit.country}-${visit.region}-${visit.city}`
            break
          default:
            key = visit.country
        }

        if (!locationMap[key]) {
          locationMap[key] = {
            country: visit.country,
            region: type === 'country' ? undefined : visit.region,
            city: type === 'city' ? visit.city : undefined,
            value: 0,
          }
        }
        locationMap[key].value += 1
      })

      const data = Object.values(locationMap).sort((a, b) => b.value - a.value)
      return createResponse(data)
    },
  },

  // Metrics data
  {
    url: '/api/v1/statistics/metrics',
    method: 'get',
    response: (req: any) => {
      const { type, startTime, endTime } = req.query
      const visits = getVisitsInTimeRange(Number(startTime), Number(endTime))
      const data = getMetricsData(type, visits)
      return createResponse(data)
    },
  },
] as MockMethod[]
