import { supabase } from '../lib/supabase'
import type { Coin, CoinInput } from './types'
import { type CoinRow, coinInputToRow, rowToCoin } from './mapper'

/**
 * Colonne dell'elenco: tutte tranne le immagini.
 * Le foto sono salvate come base64 e pesano centinaia di kB l'una: scaricarle
 * per ogni moneta ad ogni ricarica dell'elenco satura il tempo massimo della
 * query (statement timeout). Vengono quindi caricate solo per la moneta aperta.
 */
const COLONNE_ELENCO = [
  'id',
  'user_id',
  'nome',
  'sovrano_emittente',
  'stato_emittente',
  'epoca',
  'anno_conio',
  'zecca',
  'metallo',
  'peso',
  'diametro',
  'tiratura',
  'rarita',
  'stato_conservazione',
  'periziata',
  'ente_perizia',
  'numero_perizia',
  'riferimento_catalogo',
  'valore_stimato',
  'prezzo_acquisto',
  'note',
  'preferita',
  'data_inserimento',
  'data_modifica',
].join(',')

export async function fetchCoins(): Promise<Coin[]> {
  const { data, error } = await supabase
    .from('coins')
    .select(COLONNE_ELENCO)
    .order('data_inserimento', { ascending: false })
  if (error) throw error
  return (data as unknown as CoinRow[]).map(rowToCoin)
}

/** Carica una singola moneta completa di immagini (per dettaglio e modifica). */
export async function fetchCoinCompleta(id: string): Promise<Coin> {
  const { data, error } = await supabase.from('coins').select('*').eq('id', id).single()
  if (error) throw error
  return rowToCoin(data as CoinRow)
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
    .select(COLONNE_ELENCO)
    .single()
  if (error) throw error
  return rowToCoin(data as unknown as CoinRow)
}

export async function updateCoin(id: string, input: CoinInput): Promise<Coin> {
  const { data, error } = await supabase
    .from('coins')
    .update(coinInputToRow(input))
    .eq('id', id)
    .select(COLONNE_ELENCO)
    .single()
  if (error) throw error
  return rowToCoin(data as unknown as CoinRow)
}

export async function deleteCoin(id: string): Promise<void> {
  const { error } = await supabase.from('coins').delete().eq('id', id)
  if (error) throw error
}

export async function toggleFavorite(id: string, preferita: boolean): Promise<void> {
  const { error } = await supabase.from('coins').update({ preferita }).eq('id', id)
  if (error) throw error
}
