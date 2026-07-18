import { Search, ArrowUpDown } from 'lucide-react'
import type { Coin } from '../db/types'
import { CoinCard } from './CoinCard'

export type Ordinamento = 'recenti' | 'nome' | 'anno' | 'valore'

interface Props {
  coins: Coin[]
  search: string
  onSearch: (v: string) => void
  ordinamento: Ordinamento
  onOrdinamento: (o: Ordinamento) => void
  selectedId: string | null
  onSelect: (id: string) => void
  titolo: string
}

export function CoinGrid({ coins, search, onSearch, ordinamento, onOrdinamento, selectedId, onSelect, titolo }: Props) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col">
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-stone-200 bg-stone-50/95 p-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-50">{titolo}</h2>
          <span className="text-sm text-stone-400">{coins.length} {coins.length === 1 ? 'moneta' : 'monete'}</span>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900">
            <Search size={16} className="text-stone-400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Cerca per nome, sovrano, zecca, riferimento..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400 dark:text-stone-100"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 dark:border-stone-700 dark:bg-stone-900">
            <ArrowUpDown size={14} className="text-stone-400" />
            <select
              value={ordinamento}
              onChange={(e) => onOrdinamento(e.target.value as Ordinamento)}
              className="bg-transparent py-2 text-sm outline-none dark:text-stone-100"
            >
              <option value="recenti">Recenti</option>
              <option value="nome">Nome</option>
              <option value="anno">Anno</option>
              <option value="valore">Valore</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {coins.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-stone-400">
            <p className="font-serif text-lg">Nessuna moneta trovata</p>
            <p className="text-sm">Prova a cambiare i filtri o aggiungi una nuova moneta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {coins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} selected={coin.id === selectedId} onSelect={() => onSelect(coin.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
