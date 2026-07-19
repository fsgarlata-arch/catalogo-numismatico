import { supabase } from '../lib/supabase'
import type { Coin, CoinInput } from './types'
import { type CoinRow, coinInputToRow, rowToCoin } from './mapper'

export async function fetchCoins(): Promise<Coin[]> {
  const { data, error } = await supabase.from('coins').select('*').order('data_inserimento', { ascending: false })
  if (error) throw error
  return (data as CoinRow[]).map(rowToCoin)
}

export async function addCoin(input: CoinInput): Promise<Coin> {
  // Imposta esplicitamente il proprietario della moneta all'utente loggato:
  // è ciò che la policy RLS di INSERT verifica (auth.uid() = user_id).
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('Sessione non valida: effettua di nuovo l\'accesso.')

  const { data, error } = await supabase
    .from('coins')
    .insert({ ...coinInputToRow(input), user_id: userId })
    .select()
    .single()
  if (error) throw error
  return rowToCoin(data as CoinRow)
}

export async function updateCoin(id: string, input: CoinInput): Promise<Coin> {
  const { data, error } = await supabase.from('coins').update(coinInputToRow(input)).eq('id', id).select().single()
  if (error) throw error
  return rowToCoin(data as CoinRow)
}

export async function deleteCoin(id: string): Promise<void> {
  const { error } = await supabase.from('coins').delete().eq('id', id)
  if (error) throw error
}

export async function toggleFavorite(id: string, preferita: boolean): Promise<void> {
  const { error } = await supabase.from('coins').update({ preferita }).eq('id', id)
  if (error) throw error
}
