import type { MockMethod } from 'vite-plugin-mock'
import { createResponse } from './utils'
import type { BasicData, TimeseriesData } from '@/types'
import { getVisitsByShortUrl, getMetricsData } from './data'
import type { VisitRecord } from './data/types'

// Generate timeseries data
const generateTimeseriesData = (
  visits: VisitRecord[],
  startTime: number,
  endTime: number,
  type: 'day' | 'hour'
) => {
  const timeseriesData: TimeseriesData[] = []
  const interval = type === 'day' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000

  // Group visits by time interval
  const visitsByTime: Record<number, { visits: number; uniqueIps: Set<string> }> = {}

  for (let time = startTime; time <= endTime; time += interval) {
    visitsByTime[time] = { visits: 0, uniqueIps: new Set() }
  }

  visits.forEach((visit) => {
    const timeKey = Math.floor(visit.timestamp / interval) * interval
    if (visitsByTime[timeKey]) {
      visitsByTime[timeKey].visits++
      visitsByTime[timeKey].uniqueIps.add(`${visit.country}-${visit.city}-${visit.device}`)
    }
  })

  Object.entries(visitsByTime).forEach(([time, data]) => {
    const timeseriesEntry: TimeseriesData = {
      time: Number(time),
      visits: data.visits,
      visitors: data.uniqueIps.size,
    }
    timeseriesData.push(timeseriesEntry)
  })

  return timeseriesData
}

export default [
  // Basic statistics
  {
    url: '/api/v1/statistics/basic',
    method: 'get',
    response: (req: any) => {
      const { shortUrl, startTime = 0, endTime = Date.now() } = req.query
      const visits = getVisitsByShortUrl(shortUrl, Number(startTime), Number(endTime))

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
      const { shortUrl, type, startTime, endTime } = req.query
      const visits = getVisitsByShortUrl(shortUrl, Number(startTime), Number(endTime))
      const data = generateTimeseriesData(visits, Number(startTime), Number(endTime), type)
      return createResponse(data)
    },
  },

  // Location data
  {
    url: '/api/v1/statistics/locations',
    method: 'get',
    response: (req: any) => {
      const { shortUrl, type, startTime, endTime } = req.query
      const visits = getVisitsByShortUrl(shortUrl, Number(startTime), Number(endTime))

      const locationMap: Record<string, number> = {}
      const totalVisits = visits.length

      visits.forEach((visit) => {
        const location = visit[type as 'country' | 'region' | 'city']
        locationMap[location] = (locationMap[location] || 0) + 1
      })

      const data = Object.entries(locationMap).map(([name, visits]) => ({
        name,
        visits,
        percentage: (visits / totalVisits) * 100,
      }))

      return createResponse(data)
    },
  },

  // Metrics data
  {
    url: '/api/v1/statistics/metrics',
    method: 'get',
    response: (req: any) => {
      const { shortUrl, type, startTime, endTime } = req.query
      const visits = getVisitsByShortUrl(shortUrl, Number(startTime), Number(endTime))
      const data = getMetricsData(type, visits)
      return createResponse(data)
    },
  },
] as MockMethod[]
