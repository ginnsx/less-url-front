export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface User {
  userId: string
  email: string
  nickname: string
  authorities: { authority: string }[]
}
