import { HttpResponse } from 'msw'

// 通用的响应处理函数
export function jsonResponse<T>(data: T, status = 200) {
  return HttpResponse.json({ code: 1, data, msg: 'success' }, { status })
}

export function errorResponse(status: number, message: string) {
  return HttpResponse.json({ code: status, data: null, msg: message })
}

export function getOwnerIdFromRequest(req: Request): string {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const guestId = req.headers.get('Guest-Id')

  if (token) {
    return 'u_1'
  }

  if (guestId) {
    return `g_${guestId}`
  }

  return ''
}
