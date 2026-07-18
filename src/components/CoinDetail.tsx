import { Star, Pencil, Trash2, ShieldCheck, X } from 'lucide-react'
import type { Coin } from '../db/types'
import { formatEuro, formatNumber } from '../utils/format'

interface Props {
  coin: Coin
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onClose?: () => void
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-400">{label}</dt>
      <dd className="text-sm text-stone-800 dark:text-stone-100">{value}</dd>
    </div>
  )
}

export function CoinDetail({ coin, onEdit, onDelete, onToggleFavorite, onClose }: Props) {
  return (
    <section className="flex h-full flex-col overflow-y-auto bg-white dark:bg-stone-900">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 p-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden">
              <X size={18} />
            </button>
          )}
          <h2 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-50">Dettaglio moneta</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleFavorite}
            className={`rounded-lg p-2 transition ${coin.preferita ? 'text-amber-500' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
            title="Preferita"
          >
            <Star size={18} fill={coin.preferita ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onEdit} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800" title="Modifica">
            <Pencil size={18} />
          </button>
          <button onClick={onDelete} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40" title="Elimina">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-5">
        <div className="grid grid-cols-2 gap-4">
          {(['immagineDritto', 'immagineRovescio'] as const).map((key) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border border-stone-300 bg-gradient-to-br from-stone-100 to-stone-200 shadow-inner dark:border-stone-700 dark:from-stone-800 dark:to-stone-900">
                {coin[key] ? (
                  <img src={coin[key]!} alt={key} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-stone-400">Nessuna immagine</span>
                )}
              </div>
              <span className="text-xs text-stone-400">{key === 'immagineDritto' ? 'Dritto' : 'Rovescio'}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">{coin.nome || 'Senza nome'}</h3>
          <p className="text-stone-500 dark:text-stone-400">
            {[coin.sovranoEmittente, coin.statoEmittente, coin.annoConio].filter(Boolean).join(' · ')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {coin.statoConservazione && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {coin.statoConservazione}
              </span>
            )}
            {coin.periziata && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <ShieldCheck size={13} /> Periziata{coin.enteperizia ? ` — ${coin.enteperizia}` : ''}
              </span>
            )}
            {coin.rarita && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                {coin.rarita}
              </span>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded-xl border border-stone-200 p-4 dark:border-stone-800">
          <Field label="Epoca" value={coin.epoca ? coin.epoca[0].toUpperCase() + coin.epoca.slice(1) : ''} />
          <Field label="Zecca" value={coin.zecca} />
          <Field label="Metallo" value={coin.metallo} />
          <Field label="Peso" value={formatNumber(coin.peso, ' g')} />
          <Field label="Diametro" value={formatNumber(coin.diametro, ' mm')} />
          <Field label="Tiratura" value={formatNumber(coin.tiratura)} />
          <Field label="Riferimento catalogo" value={coin.riferimentoCatalogo} />
          <Field label="N. certificato perizia" value={coin.numeroPerizia} />
          <Field label="Valore stimato" value={formatEuro(coin.valoreStimato)} />
          <Field label="Prezzo di acquisto" value={formatEuro(coin.prezzoAcquisto)} />
        </dl>

        {coin.note && (
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-stone-400">Note</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-200">{coin.note}</p>
          </div>
        )}

        <p className="text-xs text-stone-400">
          Aggiunta il {new Date(coin.dataInserimento).toLocaleDateString('it-IT')} · Ultima modifica il{' '}
          {new Date(coin.dataModifica).toLocaleDateString('it-IT')}
        </p>
      </div>
    </section>
  )
}
