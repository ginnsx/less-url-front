import type { Link } from '@/types'

export interface VisitRecord {
  timestamp: number
  device: string
  brand: string
  deviceType: string
  browser: string
  os: string
  language: string
  timezone: string
  country: string
  region: string
  city: string
  referer: string
  refererType: string
}

export interface DeviceInfo {
  brand: string
  deviceType: 'phone' | 'tablet' | 'laptop'
  device: string
  os: string
}

export interface LocationInfo {
  country: string
  region: string
  city: string
}

export interface LinkWithAnalytics {
  link: Link
  visits: VisitRecord[]
}

export type DeviceMapping = Record<string, Record<DeviceInfo['deviceType'], string[]>>
export type OsMapping = Record<string, Record<DeviceInfo['deviceType'], string[]>>
export type RefererMapping = Record<string, string[]>
