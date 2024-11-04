import { faker } from '@faker-js/faker'
import Mock from 'mockjs'
import type { User, Link, MetricsType } from '@/types'
import type { VisitRecord, DeviceInfo, LocationInfo, LinkWithAnalytics } from './types'
import {
  TIME_CONSTANTS,
  deviceMapping,
  osMapping,
  refererMapping,
  browsers,
  languages,
} from './configs'

import { SHORT_URL_PREFIX } from '../config'

// 预设用户
export const users: User[] = [
  {
    userId: '1',
    email: 'test@example.com',
    password: '123456',
    nickname: 'testuser',
    authorities: [{ authority: 'ROLE_USER' }],
  },
]

function generateVisitRecord(minTime: number, maxTime: number): VisitRecord {
  const { device, brand, deviceType, os } = generateDeviceInfo()
  const { referer, refererType } = generateRefererInfo()
  const { country, region, city } = generateLocationInfo()

  return {
    timestamp: faker.date.between({ from: minTime, to: maxTime }).getTime(),
    device,
    brand,
    deviceType,
    browser: faker.helpers.arrayElement(browsers),
    os,
    language: faker.helpers.arrayElement(languages),
    timezone: faker.location.timeZone(),
    country,
    region,
    city,
    referer,
    refererType,
  }
}

function generateDeviceInfo() {
  const brands = Object.keys(deviceMapping)
  const brand = faker.helpers.arrayElement(brands)

  const deviceTypes = Object.keys(deviceMapping[brand]) as Array<DeviceInfo['deviceType']>
  const deviceType = faker.helpers.arrayElement(deviceTypes)

  const device = faker.helpers.arrayElement(deviceMapping[brand][deviceType])

  const os = faker.helpers.arrayElement(osMapping[brand][deviceType])

  return {
    brand,
    deviceType,
    device,
    os,
  }
}

function generateLocationInfo(): LocationInfo {
  if (faker.number.int(100) < 30) {
    const cityName = Mock.Random.city(true)
    const region = cityName.split(' ')[0]
    const city = cityName.split(' ')[1]

    return {
      country: 'China',
      region,
      city,
    }
  }

  // 70% 概率生成国外地址
  return {
    country: faker.location.country(),
    region: faker.location.state(),
    city: faker.location.city(),
  }
}

function generateRefererInfo() {
  // 首先随机选择 refererType
  const refererTypes = Object.keys(refererMapping)
  const refererType = faker.helpers.arrayElement(refererTypes)

  // 根据选定的 type 选择具体的 referer
  const referer = faker.helpers.arrayElement(refererMapping[refererType])

  return { referer, refererType }
}

// 生成预设数据
export const linksWithAnalytics: LinkWithAnalytics[] = Array.from({ length: 50 }, (_, index) => {
  const createdAt = faker.date
    .between({ from: TIME_CONSTANTS.ONE_YEAR_AGO, to: TIME_CONSTANTS.NOW })
    .getTime()
  const updatedAt = faker.date.between({ from: createdAt, to: TIME_CONSTANTS.NOW }).getTime()
  const expiresAt = faker.date
    .between({ from: TIME_CONSTANTS.NOW, to: TIME_CONSTANTS.ONE_YEAR_LATER })
    .getTime()

  const link: Link = {
    id: index + 1,
    shortUrl: `${SHORT_URL_PREFIX}${faker.string.alphanumeric(6)}`,
    originalUrl: faker.internet.url(),
    visits: faker.number.int({ min: 50, max: 200 }),
    isCustom: faker.datatype.boolean(),
    ownerId: 'u_1', // 关联到测试用户
    createdAt,
    updatedAt,
    expiresAt,
  }

  const visitCount = link.visits
  const visits = Array.from({ length: visitCount }, () =>
    generateVisitRecord(createdAt, Math.min(TIME_CONSTANTS.NOW, expiresAt))
  ).sort((a, b) => a.timestamp - b.timestamp) // 按时间排序

  return { link, visits }
})

export const links: Link[] = linksWithAnalytics.map((item) => item.link)

export function getVisitsInTimeRange(startTime: number, endTime: number): VisitRecord[] {
  return linksWithAnalytics
    .flatMap((item) => item.visits)
    .filter((visit) => visit.timestamp >= startTime && visit.timestamp <= endTime)
}

export function getVisitsByShortUrl(
  shortUrl: string,
  startTime: number,
  endTime: number
): VisitRecord[] {
  const linkWithAnalytics = linksWithAnalytics.find((item) => item.link.shortUrl === shortUrl)
  if (!linkWithAnalytics) return []

  return linkWithAnalytics.visits.filter(
    (visit) => visit.timestamp >= startTime && visit.timestamp <= endTime
  )
}

const metricsKeyMap: Record<MetricsType, keyof VisitRecord> = {
  browser: 'browser',
  device: 'device',
  brand: 'brand',
  device_type: 'deviceType',
  os: 'os',
  language: 'language',
  timezone: 'timezone',
  referer: 'referer',
  referer_type: 'refererType',
}

export function getMetricsData(type: MetricsType, visits: VisitRecord[]) {
  const metricsMap: Record<string, number> = {}
  const key = metricsKeyMap[type]

  visits.forEach((visit) => {
    const value = visit[key]
    metricsMap[value] = (metricsMap[value] || 0) + 1
  })

  return Object.entries(metricsMap).map(([name, value]) => ({ name, value }))
}
