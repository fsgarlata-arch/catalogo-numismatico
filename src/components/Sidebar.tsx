import { Coins, Star, ShieldCheck, Plus, Landmark, UserCircle } from 'lucide-react'
import type { Coin, Epoca } from '../db/types'
import { EPOCHE } from '../db/types'
import { formatEuro } from '../utils/format'

export type FiltroSpeciale = 'tutte' | 'preferite' | 'periziate'

interface Props {
  coins: Coin[]
  epocaFiltro: Epoca | 'tutte'
  onEpocaFiltro: (e: Epoca | 'tutte') => void
  filtroSpeciale: FiltroSpeciale
  onFiltroSpeciale: (f: FiltroSpeciale) => void
  onNuovaMoneta: () => void
  userEmail?: string | null
  onAccount: () => void
  className?: string
}

export function Sidebar({
  coins,
  epocaFiltro,
  onEpocaFiltro,
  filtroSpeciale,
  onFiltroSpeciale,
  onNuovaMoneta,
  userEmail,
  onAccount,
  className = '',
}: Props) {
  const totale = coins.length
  const valoreTotale = coins.reduce((sum, c) => sum + (c.valoreStimato ?? 0), 0)
  const preferite = coins.filter((c) => c.preferita).length
  const periziate = coins.filter((c) => c.periziata).length

  const NavItem = ({
    active,
    onClick,
    icon,
    label,
    count,
  }: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
    count: number
  }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
        active
          ? 'bg-amber-600 text-white shadow-sm'
          : 'text-stone-700 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-stone-800'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      <span className={`text-xs tabular-nums ${active ? 'text-amber-100' : 'text-stone-400'}`}>{count}</span>
    </button>
  )

  return (
    <aside className={`flex flex-col gap-6 overflow-y-auto border-r border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950 ${className}`}>
      <div className="flex items-center gap-2 px-1">
        <Landmark className="text-amber-700 dark:text-amber-500" size={26} />
        <h1 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-50">Numismatica</h1>
      </div>

      <button
        onClick={onNuovaMoneta}
        className="flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-amber-800 active:scale-[0.98]"
      >
        <Plus size={18} />
        Nuova moneta
      </button>

      <nav className="flex flex-col gap-1">
        <NavItem
          active={filtroSpeciale === 'tutte' && epocaFiltro === 'tutte'}
          onClick={() => {
            onFiltroSpeciale('tutte')
            onEpocaFiltro('tutte')
          }}
          icon={<Coins size={17} />}
          label="Tutte le monete"
          count={totale}
        />
        <NavItem
          active={filtroSpeciale === 'preferite'}
          onClick={() => onFiltroSpeciale('preferite')}
          icon={<Star size={17} />}
          label="Preferite"
          count={preferite}
        />
        <NavItem
          active={filtroSpeciale === 'periziate'}
          onClick={() => onFiltroSpeciale('periziate')}
          icon={<ShieldCheck size={17} />}
          label="Periziate"
          count={periziate}
        />
      </nav>

      <div>
        <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Epoca</p>
        <nav className="flex flex-col gap-1">
          {EPOCHE.map((e) => (
            <NavItem
              key={e.value}
              active={epocaFiltro === e.value}
              onClick={() => onEpocaFiltro(e.value)}
              icon={<span className="w-[17px] text-center text-xs">●</span>}
              label={e.label.split(' (')[0]}
              count={coins.filter((c) => c.epoca === e.value).length}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs uppercase tracking-wide text-stone-400">Valore stimato collezione</p>
          <p className="mt-1 font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">{formatEuro(valoreTotale) || '—'}</p>
        </div>
        <button
          onClick={onAccount}
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <UserCircle size={20} className="shrink-0 text-stone-400" />
          <span className="min-w-0 flex-1 truncate">{userEmail ?? 'Il mio account'}</span>
        </button>
      </div>
    </aside>
  )
}
