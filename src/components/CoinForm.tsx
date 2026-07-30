import { useState } from 'react'
import { X, Star } from 'lucide-react'
import type { Coin, CoinInput, Epoca } from '../db/types'
import { EPOCHE, GRADI_CONSERVAZIONE, SCALA_RARITA, METALLI, ENTI_PERIZIA } from '../db/types'
import { ImageInput } from './ImageInput'

interface Props {
  coin: Coin | null
  onSave: (input: CoinInput) => void
  onCancel: () => void
}

const empty: CoinInput = {
  nome: '',
  sovranoEmittente: '',
  statoEmittente: '',
  epoca: 'moderna',
  annoConio: '',
  zecca: '',
  metallo: '',
  peso: null,
  diametro: null,
  tiratura: null,
  rarita: '',
  statoConservazione: '',
  periziata: false,
  enteperizia: '',
  numeroPerizia: '',
  riferimentoCatalogo: '',
  valoreStimato: null,
  prezzoAcquisto: null,
  note: '',
  immagineDritto: null,
  immagineRovescio: null,
  // Rigenerata automaticamente al salvataggio a partire dal dritto.
  miniaturaDritto: null,
  preferita: false,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 pb-6 dark:border-stone-800">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">{title}</h3>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">{children}</label>
}

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'

export function CoinForm({ coin, onSave, onCancel }: Props) {
  const [form, setForm] = useState<CoinInput>(coin ?? empty)

  function set<K extends keyof CoinInput>(key: K, value: CoinInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function numOrNull(v: string): number | null {
    if (v === '') return null
    const n = Number(v)
    return Number.isNaN(n) ? null : n
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 lg:items-center" onClick={onCancel}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-stone-900 lg:max-w-2xl lg:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 p-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
          <h2 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-50">
            {coin ? 'Modifica moneta' : 'Nuova moneta'}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => set('preferita', !form.preferita)}
              className={`rounded-lg p-2 ${form.preferita ? 'text-amber-500' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
            >
              <Star size={18} fill={form.preferita ? 'currentColor' : 'none'} />
            </button>
            <button type="button" onClick={onCancel} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-5">
          <Section title="Immagini">
            <div className="flex justify-center gap-8">
              <ImageInput label="Dritto" value={form.immagineDritto} onChange={(v) => set('immagineDritto', v)} />
              <ImageInput label="Rovescio" value={form.immagineRovescio} onChange={(v) => set('immagineRovescio', v)} />
            </div>
          </Section>

          <Section title="Identificazione">
            <div>
              <Label>Nome moneta *</Label>
              <input
                required
                className={inputClass}
                placeholder="Es. Denario, 5 Lire Aquila, Sesterzio..."
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sovrano / autorità emittente</Label>
                <input
                  className={inputClass}
                  placeholder="Es. Traiano, Vittorio Emanuele III..."
                  value={form.sovranoEmittente}
                  onChange={(e) => set('sovranoEmittente', e.target.value)}
                />
              </div>
              <div>
                <Label>Stato emittente</Label>
                <input
                  className={inputClass}
                  placeholder="Es. Impero Romano, Regno d'Italia..."
                  value={form.statoEmittente}
                  onChange={(e) => set('statoEmittente', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Epoca</Label>
                <select className={inputClass} value={form.epoca} onChange={(e) => set('epoca', e.target.value as Epoca)}>
                  {EPOCHE.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Anno / periodo di conio</Label>
                <input
                  className={inputClass}
                  placeholder="Es. 1936, 98-117 d.C., 27 a.C...."
                  value={form.annoConio}
                  onChange={(e) => set('annoConio', e.target.value)}
                />
              </div>
            </div>
          </Section>

          <Section title="Caratteristiche fisiche">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Zecca</Label>
                <input className={inputClass} placeholder="Es. Roma, Milano..." value={form.zecca} onChange={(e) => set('zecca', e.target.value)} />
              </div>
              <div>
                <Label>Metallo</Label>
                <select className={inputClass} value={form.metallo} onChange={(e) => set('metallo', e.target.value)}>
                  <option value="">—</option>
                  {METALLI.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Peso (g)</Label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.peso ?? ''}
                  onChange={(e) => set('peso', numOrNull(e.target.value))}
                />
              </div>
              <div>
                <Label>Diametro (mm)</Label>
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={form.diametro ?? ''}
                  onChange={(e) => set('diametro', numOrNull(e.target.value))}
                />
              </div>
              <div>
                <Label>Tiratura</Label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.tiratura ?? ''}
                  onChange={(e) => set('tiratura', numOrNull(e.target.value))}
                />
              </div>
            </div>
          </Section>

          <Section title="Conservazione e perizia">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Stato di conservazione</Label>
                <select className={inputClass} value={form.statoConservazione} onChange={(e) => set('statoConservazione', e.target.value)}>
                  <option value="">—</option>
                  {GRADI_CONSERVAZIONE.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Rarità (scala Gigante)</Label>
                <select className={inputClass} value={form.rarita} onChange={(e) => set('rarita', e.target.value)}>
                  {SCALA_RARITA.map((r) => (
                    <option key={r} value={r}>
                      {r || '—'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
              <input
                type="checkbox"
                checked={form.periziata}
                onChange={(e) => set('periziata', e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-600"
              />
              Moneta periziata
            </label>
            {form.periziata && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ente / perito</Label>
                  <input
                    list="enti-perizia"
                    className={inputClass}
                    value={form.enteperizia}
                    onChange={(e) => set('enteperizia', e.target.value)}
                    placeholder="Es. NIP, CCPP, PCGS..."
                  />
                  <datalist id="enti-perizia">
                    {ENTI_PERIZIA.map((e) => (
                      <option key={e} value={e} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label>N. certificato</Label>
                  <input className={inputClass} value={form.numeroPerizia} onChange={(e) => set('numeroPerizia', e.target.value)} />
                </div>
              </div>
            )}
          </Section>

          <Section title="Catalogazione e valore">
            <div>
              <Label>Riferimento catalogo (Gigante / Nomisma...)</Label>
              <input
                className={inputClass}
                placeholder="Es. Gigante 123, Nomisma 456..."
                value={form.riferimentoCatalogo}
                onChange={(e) => set('riferimentoCatalogo', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valore stimato (€)</Label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.valoreStimato ?? ''}
                  onChange={(e) => set('valoreStimato', numOrNull(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo di acquisto (€)</Label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.prezzoAcquisto ?? ''}
                  onChange={(e) => set('prezzoAcquisto', numOrNull(e.target.value))}
                />
              </div>
            </div>
          </Section>

          <Section title="Note">
            <textarea
              rows={4}
              className={inputClass}
              placeholder="Provenienza, dettagli particolari, difetti, storia della moneta..."
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
            />
          </Section>
        </div>

        <div className="flex gap-3 border-t border-stone-200 p-4 dark:border-stone-800">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Annulla
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-amber-700 py-3 text-sm font-medium text-white hover:bg-amber-800">
            Salva
          </button>
        </div>
      </form>
    </div>
  )
}
