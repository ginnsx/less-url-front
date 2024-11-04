import deviceMappingJson from './json/devices.json'
import osMappingJson from './json/os.json'
import refererMappingJson from './json/referers.json'
import type { DeviceMapping, OsMapping, RefererMapping } from './types'

export const TIME_CONSTANTS = {
  NOW: Date.now(),
  ONE_YEAR_AGO: Date.now() - 365 * 24 * 60 * 60 * 1000,
  ONE_YEAR_LATER: Date.now() + 365 * 24 * 60 * 60 * 1000,
} as const

export const deviceMapping: DeviceMapping = deviceMappingJson
export const osMapping: OsMapping = osMappingJson
export const refererMapping: RefererMapping = refererMappingJson
export const browsers: string[] = ['Chrome', 'Firefox', 'Safari', 'Edge']
export const languages: string[] = ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru']
