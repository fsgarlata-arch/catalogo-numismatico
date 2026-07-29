import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { fetchCoins } from './actions'
import type { Coin } from './types'

export function useCoins() {
  const { user } = useAuth()
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (): Promise<Coin[]> => {
    if (!user) {
      setCoins([])
      setLoading(false)
      return []
    }
    setLoading(true)
    try {
      const data = await fetchCoins()
      setCoins(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { coins, loading, refresh }
}
