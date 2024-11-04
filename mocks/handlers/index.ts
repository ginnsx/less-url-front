import { authHandlers } from './auth'
import { linksHandlers } from './links'
import { guestHandlers } from './guest'
import { analysisHandlers } from './analysis'

export const handlers = [...authHandlers, ...linksHandlers, ...guestHandlers, ...analysisHandlers]
