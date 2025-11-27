import { useAuth } from '@/context/AuthContext'
import { SessionData } from './lib/definitions'

/**
 * Custom hook to get session data.
 * This is the REWRITTEN version for the SPA architecture.
 *
 * It reads authentication state from the `useAuth` hook (which is backed by localStorage and oidc-client-ts)
 * and transforms it into the `SessionData` format that older components expect.
 * This acts as a compatibility layer, removing the need for network requests to `/session`.
 *
 * @returns An object mimicking the structure of `UseQueryResult` for compatibility.
 */
export default function useSession() {
  const { user, isLoading, tenantId } = useAuth()

  // Construct the SessionData object from the user object provided by oidc-client-ts
  const sessionData: SessionData | undefined = user
    ? {
        isLoggedIn: true,
        access_token: user.access_token,
        userInfo: {
          sub: user.profile.sub!,
          name: user.profile.given_name || user.profile.name || '',
          email: user.profile.email || '',
          email_verified: user.profile.email_verified || false,
        },
        tenantId: tenantId,
      }
    : undefined

  // Return an object that looks like a `useQuery` result for compatibility
  return {
    data: sessionData,
    isLoading,
    error: null, // Assuming no error state to manage for now
  }
}
