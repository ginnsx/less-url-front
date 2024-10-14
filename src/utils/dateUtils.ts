import dayjs from 'dayjs'

export const getExpirationTagType = (expiresAt: number) => {
  const now = dayjs()
  const daysUntilExpiration = dayjs(expiresAt).diff(now, 'day')

  if (daysUntilExpiration < 0) {
    return 'error'
  } else if (daysUntilExpiration <= 3) {
    return 'warning'
  } else {
    return 'success'
  }
}

export const formatDateTime = (date: number) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
