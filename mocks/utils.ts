export function createResponse<T>(data: T, code = 200, message = 'success') {
  return {
    code,
    data,
    msg: message,
  }
}

export function createErrorResponse(code = 500, message = 'error') {
  return {
    code,
    data: null,
    msg: message,
  }
}

export function getOwnerIdFromRequest(req: any): string {
  const token = req.headers?.authorization?.replace('Bearer ', '')
  const guestId = req.headers?.['guest-id']

  if (token) {
    // 在实际项目中需要解析 token 获取用户 ID
    // 这里简化处理，假设 token 存在就是测试用户
    return 'u_1'
  }

  if (guestId) {
    return `g_${guestId}`
  }

  return ''
}
