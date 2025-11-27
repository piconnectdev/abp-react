export type SessionData = {
  isLoggedIn: boolean
  access_token?: string
  userInfo?: {
    sub: string
    name: string
    email: string
    email_verified: boolean
  }
  tenantId?: string | null
  refresh_token?: string
}
