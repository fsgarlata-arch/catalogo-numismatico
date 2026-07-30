import type { Coin } from '../db/types'
import { Star, ShieldCheck } from 'lucide-react'

interface Props {
  coin: Coin
  selected: boolean
  onSelect: () => void
}

export function CoinCard({ coin, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition ${
        selected
          ? 'border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/40'
          : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-amber-800'
      }`}
    >
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-stone-300 bg-gradient-to-br from-stone-100 to-stone-200 shadow-inner dark:border-stone-700 dark:from-stone-800 dark:to-stone-900">
          {coin.miniaturaDritto ? (
            <img src={coin.miniaturaDritto} alt={coin.nome} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-serif text-stone-400 dark:text-stone-600">
              {coin.nome.slice(0, 1).toUpperCase() || '?'}
            </span>
          )}
        </div>
        {coin.preferita && (
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 p-1 text-white shadow">
            <Star size={12} fill="currentColor" />
          </span>
        )}
        {coin.periziata && (
          <span className="absolute -left-1 -bottom-1 rounded-full bg-emerald-600 p-1 text-white shadow">
            <ShieldCheck size={12} />
          </span>
        )}
      </div>
      <div className="w-full">
        <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{coin.nome || 'Senza nome'}</p>
        <p className="truncate text-xs text-stone-500 dark:text-stone-400">{coin.annoConio || '—'}</p>
        {coin.statoConservazione && (
          <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {coin.statoConservazione}
          </span>
        )}
      </div>
    </button>
  )
}
