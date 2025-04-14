import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useEffect } from 'react'

export function AuthDebug() {
  const user = useQuery(api.users.getCurrentUser)
  const state = useConvexAuth()

  useEffect(() => {
    console.log('Auth Debug:', {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      user: user ? 'User exists' : 'No user',
      userDetails: user,
    })
  }, [state, user])

  return null
}
