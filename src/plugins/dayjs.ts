import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import isYesterday from 'dayjs/plugin/isYesterday'
import minMax from 'dayjs/plugin/minMax'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'
import isLeapYear from 'dayjs/plugin/isLeapYear'

export function setupDayjs() {
  dayjs.locale('zh-cn')
  dayjs.extend(utc)
  dayjs.extend(relativeTime)
  dayjs.extend(dayOfYear)
  dayjs.extend(isBetween)
  dayjs.extend(isLeapYear)
  dayjs.extend(isSameOrBefore)
  dayjs.extend(isSameOrAfter)
  dayjs.extend(isToday)
  dayjs.extend(isTomorrow)
  dayjs.extend(isYesterday)
  dayjs.extend(minMax)
  dayjs.extend(timezone)
}
