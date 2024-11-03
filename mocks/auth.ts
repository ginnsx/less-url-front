import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'
import type { AuthResponse, LinkDataCounts } from '@/types'
import { users } from './data'
import { guestData } from './guest'

const Random = Mock.Random

// Token storage
interface TokenInfo {
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Store active tokens
const activeTokens = new Map<string, TokenInfo>() // key: accessToken
const refreshTokens = new Map<string, TokenInfo>() // key: refreshToken

// Generate JWT token (mock)
const generateToken = () => Random.string('alphanumeric', 32)

// Generate token pair with expiry
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

  activeTokens.set(accessToken, tokenInfo)
  refreshTokens.set(refreshToken, tokenInfo)

  return tokenInfo
}

// Store verification codes
interface VerificationCode {
  code: string
  expiry: number
}

const verificationCodes = new Map<string, VerificationCode>()

// Generate verification code
function generateVerificationCode(email: string): string {
  const code = Mock.Random.string('number', 6)
  const expiry = Date.now() + 5 * 60 * 1000 // 5 minutes

  verificationCodes.set(email, {
    code,
    expiry,
  })

  return code
}

export default [
  // Login endpoint
  {
    url: '/api/v1/auth/login',
    method: 'post',
    response: (opt: any) => {
      const { email } = opt.body

      const user = users.find((u) => u.email === email)
      if (!user) {
        return {}
      }

      const tokenInfo = generateTokenPair(user.userId)

      return {
        access_token: tokenInfo.accessToken,
        refresh_token: tokenInfo.refreshToken,
        expires_in: 3600,
      } as AuthResponse
    },
  },

  // Add register endpoint
  {
    url: '/api/v1/auth/register',
    method: 'post',
    response: (opt: any) => {
      const { email, username, password } = opt.body

      // Create new user (mock implementation)
      const newUser = {
        userId: Random.string('alphanumeric', 10),
        email,
        password,
        nickname: username,
        authorities: [{ authority: 'ROLE_USER' }],
      }
      users.push(newUser)

      const tokenInfo = generateTokenPair(newUser.userId)
      return {
        access_token: tokenInfo.accessToken,
        refresh_token: tokenInfo.refreshToken,
        expires_in: 3600,
      } as AuthResponse
    },
  },

  // Add check email endpoint
  {
    url: '/api/v1/auth/check-email',
    method: 'post',
    response: (opt: any) => {
      const { email } = opt.body
      const exists = users.some((user) => user.email === email)
      return { exists }
    },
  },

  // Add register verification endpoint
  {
    url: '/api/v1/auth/register-verification/verify',
    method: 'post',
    response: () => {
      return { valid: true }
    },
  },

  // Update verification code endpoint to handle different types
  {
    url: ['/api/v1/auth/register-verification', '/api/v1/auth/email-verification'],
    method: 'post',
    response: (opt: any) => {
      const { email, type } = opt.body

      const code = generateVerificationCode(email)
      console.log(`Verification code for ${email} (${type}): ${code}`) // For testing

      return { message: 'Verification code sent' }
    },
  },

  // Get user info
  {
    url: '/api/v1/users/me',
    method: 'get',
    response: (opt: any) => {
      const token = opt.headers?.authorization?.replace('Bearer ', '')
      const tokenInfo = activeTokens.get(token)

      const user = users.find((u) => u.userId === tokenInfo?.userId)
      return user ? user : {}
    },
  },

  // Refresh token
  {
    url: '/api/v1/auth/refresh',
    method: 'post',
    response: (opt: any) => {
      const { refresh_token } = opt.body
      const tokenInfo = refreshTokens.get(refresh_token)

      if (!tokenInfo) {
        return {}
      }

      // Generate new token pair
      const newTokenInfo = generateTokenPair(tokenInfo.userId)

      // Remove old tokens
      activeTokens.delete(tokenInfo.accessToken)
      refreshTokens.delete(tokenInfo.refreshToken)

      return {
        access_token: newTokenInfo.accessToken,
        refresh_token: newTokenInfo.refreshToken,
        expires_in: 3600,
      } as AuthResponse
    },
  },

  // Migrate guest data
  {
    url: '/api/v1/users/migrate',
    method: 'post',
    response: (opt: any) => {
      const { guestId } = opt.body
      const token = opt.headers?.authorization?.replace('Bearer ', '')
      const tokenInfo = activeTokens.get(token)

      if (!tokenInfo || Date.now() > tokenInfo.expiresAt) {
        return {}
      }

      const guestInfo = guestData.get(guestId)
      if (!guestInfo) {
        return {}
      }

      const mockCounts: LinkDataCounts = {
        links: Random.integer(1, 10),
        analytics: Random.integer(1, 10),
      }

      // 删除访客数据
      guestData.delete(guestId)

      return mockCounts
    },
  },

  // Send verification code
  {
    url: '/api/v1/auth/code',
    method: 'post',
    response: (opt: any) => {
      const { email } = opt.body

      if (!email) {
        return {}
      }

      const code = generateVerificationCode(email)
      console.log(`Verification code for ${email}: ${code}`) // For testing purposes

      return { message: 'Verification code sent' }
    },
  },
] as MockMethod[]
