import { http } from 'msw'
import { jsonResponse, errorResponse } from '../utils/response'
import { getVisitsInTimeRange, getMetricsData } from '../data'
import type { BasicData, MetricsType } from '@/types'
import type { VisitRecord } from '../data/types'

// 复用时间序列数据生成函数
function generateTimeseriesData(
  visits: VisitRecord[],
  startTime: number,
  endTime: number,
  type: 'day' | 'hour'
) {
  const interval = type === 'day' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000

  const alignedStartTime = Math.floor(startTime / interval) * interval
  const alignedEndTime = Math.ceil(endTime / interval) * interval

  const visitsByTime: Record<number, { visits: number; uniqueIps: Set<string> }> = {}
  for (let time = alignedStartTime; time <= alignedEndTime; time += interval) {
    visitsByTime[time] = { visits: 0, uniqueIps: new Set() }
  }

  visits.forEach((visit) => {
    const timeKey = Math.floor(visit.timestamp / interval) * interval
    if (timeKey >= alignedStartTime && timeKey <= alignedEndTime) {
      visitsByTime[timeKey].visits++
      visitsByTime[timeKey].uniqueIps.add(`${visit.country}-${visit.city}-${visit.device}`)
    }
  })

  return Object.entries(visitsByTime)
    .sort(([timeA], [timeB]) => Number(timeA) - Number(timeB))
    .map(([time, data]) => ({
      time: Number(time),
      visits: data.visits,
      visitors: data.uniqueIps.size,
    }))
}

export const analysisHandlers = [
  // Get basic analytics data
  http.get('/api/v1/statistics/basic', async ({ request }) => {
    const url = new URL(request.url)
    const startTime = Number(url.searchParams.get('startTime')) || 0
    const endTime = Number(url.searchParams.get('endTime')) || Date.now()

    const visits = getVisitsInTimeRange(Number(startTime), Number(endTime))

    const uniqueVisitors = new Set(visits.map((v) => `${v.country}-${v.city}-${v.device}`)).size

    const uniqueReferers = new Set(visits.map((v) => v.referer)).size

    const basicData: BasicData = {
      visits: visits.length,
      visitors: uniqueVisitors,
      referers: uniqueReferers,
    }

    return jsonResponse(basicData)
  }),

  // Timeseries data
  http.get('/api/v1/statistics/timeseries', async ({ request }) => {
    const url = new URL(request.url)
    const startTime = Number(url.searchParams.get('startTime')) || 0
    const endTime = Number(url.searchParams.get('endTime')) || Date.now()
    const type = url.searchParams.get('type') as 'day' | 'hour'

    const visits = getVisitsInTimeRange(startTime, endTime)
    const data = generateTimeseriesData(visits, startTime, endTime, type)
    return jsonResponse(data)
  }),

  http.get('/api/v1/statistics/locations', async ({ request }) => {
    const url = new URL(request.url)
    const type = (url.searchParams.get('type') as 'country' | 'region' | 'city') || 'country'
    const startTime = Number(url.searchParams.get('startTime')) || 0
    const endTime = Number(url.searchParams.get('endTime')) || Date.now()

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
    return jsonResponse(data)
  }),

  // Get metrics data
  http.get('/api/v1/statistics/metrics', async ({ request }) => {
    const url = new URL(request.url)
    const startTime = Number(url.searchParams.get('startTime')) || 0
    const endTime = Number(url.searchParams.get('endTime')) || Date.now()
    const type = url.searchParams.get('type') as MetricsType

    if (!startTime || !endTime || !type) {
      return errorResponse(400, 'Invalid parameters')
    }

    const visits = getVisitsInTimeRange(startTime, endTime)
    const metricsData = getMetricsData(type, visits)
    if (!metricsData) {
      return errorResponse(404, 'Data not found')
    }

    return jsonResponse(metricsData)
  }),
]
