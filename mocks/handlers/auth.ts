import { http } from 'msw'
import { faker } from '@faker-js/faker'
import { jsonResponse, errorResponse } from '../utils/response'
import { users } from '../data'
import { guestData } from './guest'
import type { AuthResponse, User, TokenPair, LinkDataCounts } from '@/types'

interface LoginRequest {
  email: string
  password?: string
  verificationCode?: string
}

interface RegisterRequest {
  email: string
  username: string
  password: string
}

interface TokenInfo {
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const generateToken = () => faker.string.alphanumeric(32)

function generateTokenPair(userId: string): TokenInfo {
  const accessToken = generateToken()
  const refreshToken = generateToken()
  const expiresAt = Date.now() + 3600 * 1000 // 1 hour

  const tokenInfo: TokenInfo = {
    userId,
    accessToken,
    refreshToken,
    expiresAt,
  }

  return tokenInfo
}

export const authHandlers = [
  // Login endpoint
  http.post<never, LoginRequest>('/api/v1/auth/login', async ({ request }) => {
    const { email, password, verificationCode } = await request.json()

    const user = users.find((u) => u.email === email)
    if (!user) {
      return errorResponse(404, 'User not found')
    }

    if (!verificationCode && user.password !== password) {
      return errorResponse(401, 'Invalid password')
    }

    const tokenInfo = generateTokenPair(user.userId)

    return jsonResponse<AuthResponse>({
      access_token: tokenInfo.accessToken,
      refresh_token: tokenInfo.refreshToken,
      expires_in: 3600,
    })
  }),

  // Register endpoint
  http.post<never, RegisterRequest>('/api/v1/auth/register', async ({ request }) => {
    const { email, username, password } = await request.json()

    const newUser = {
      userId: faker.string.alphanumeric(10),
      email,
      password,
      nickname: username,
      authorities: [{ authority: 'ROLE_USER' }],
    }
    users.push(newUser)

    const tokenInfo = generateTokenPair(newUser.userId)

    return jsonResponse<AuthResponse>({
      access_token: tokenInfo.accessToken,
      refresh_token: tokenInfo.refreshToken,
      expires_in: 3600,
    })
  }),

  // Check email endpoint
  http.post<never, { email: string }>('/api/v1/auth/check-email', async ({ request }) => {
    const { email } = await request.json()
    const exists = users.some((user) => user.email === email)
    return jsonResponse({ exists })
  }),

  // Verify email code endpoint
  http.post('/api/v1/auth/register-verification/verify', async () => {
    // 简化验证逻辑，实际应该检查验证码是否正确
    return jsonResponse({ valid: true })
  }),

  // Send verification code endpoints
  http.post('/api/v1/auth/register-verification', async () => {
    return jsonResponse({ message: 'Not supported in mock' })
  }),

  // Send verification code endpoints
  http.post('/api/v1/auth/email-verification', async () => {
    return jsonResponse({ message: 'Not supported in mock' })
  }),

  // Get user info endpoint
  http.get('/api/v1/users/me', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse(401, 'Unauthorized')
    }

    const user = users.find((u) => u.userId === '1') // 简化处理，返回测试用户
    return jsonResponse<User>(user!)
  }),

  // Refresh token endpoint
  http.post<never, { refreshToken: string }>('/api/v1/auth/refresh', async () => {
    const tokenInfo = generateTokenPair('1') // 简化处理，生成新token

    return jsonResponse<TokenPair>({
      accessToken: tokenInfo.accessToken,
      refreshToken: tokenInfo.refreshToken,
      expiresIn: 3600,
    })
  }),

  // Migrate guest data endpoint
  http.post<never, { guestId: string }>('/api/v1/users/migrate', async ({ request }) => {
    const { guestId } = await request.json()

    const guestInfo = guestData.get(guestId)
    if (!guestInfo) {
      return errorResponse(404, 'Guest data not found')
    }

    // 生成随机统计数据
    const counts: LinkDataCounts = {
      links: faker.number.int({ min: 0, max: 10 }),
      analytics: faker.number.int({ min: 0, max: 100 }),
    }

    // 清除访客数据
    guestData.delete(guestId)

    return jsonResponse<LinkDataCounts>(counts)
  }),
]
