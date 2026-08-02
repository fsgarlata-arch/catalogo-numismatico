import { useEffect, useMemo, useState } from 'react'
import { Menu, Landmark } from 'lucide-react'
import { useAuth } from './auth/AuthContext'
import { AuthScreen } from './auth/AuthScreen'
import { supabaseConfigured } from './lib/supabase'
import { useCoins } from './db/useCoins'
import { addCoin, deleteCoin, fetchCoinCompleta, toggleFavorite, updateCoin } from './db/actions'
import { coinToInput, type Coin, type CoinInput, type Epoca } from './db/types'
import { creaMiniatura } from './utils/image'
import { Sidebar, type FiltroSpeciale } from './components/Sidebar'
import { CoinGrid, type Ordinamento } from './components/CoinGrid'
import { CoinDetail } from './components/CoinDetail'
import { CoinForm } from './components/CoinForm'
import { AccountPanel } from './components/AccountPanel'
import { Toast, type AzioneToast } from './components/Toast'

function SetupNotice() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-stone-100 p-6 text-center dark:bg-stone-950">
      <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <Landmark className="mx-auto mb-3 text-amber-700 dark:text-amber-500" size={32} />
        <h1 className="mb-2 font-serif text-lg font-semibold text-stone-900 dark:text-stone-50">Configurazione mancante</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Crea un file <code className="rounded bg-stone-100 px-1 py-0.5 dark:bg-stone-800">.env.local</code> nella cartella del progetto con
          <code className="mx-1 rounded bg-stone-100 px-1 py-0.5 dark:bg-stone-800">VITE_SUPABASE_URL</code> e
          <code className="mx-1 rounded bg-stone-100 px-1 py-0.5 dark:bg-stone-800">VITE_SUPABASE_ANON_KEY</code>, poi riavvia il server di sviluppo.
        </p>
      </div>
    </div>
  )
}

/**
 * Traduce in italiano gli errori di salvataggio più comuni, allegando sempre il
 * dettaglio tecnico così che un problema residuo sia diagnosticabile.
 */
function descriviErroreSalvataggio(err: unknown): string {
  const e = err as { message?: string; code?: string; details?: string; hint?: string }
  const testo = e?.message ?? String(err)

  let spiegazione = 'Impossibile salvare la moneta.'
  if (/row-level security|row level security/i.test(testo)) {
    spiegazione =
      'Il database ha rifiutato il salvataggio perché la moneta non risulta associata al tuo account. Prova a uscire e rientrare, poi usa "Aggiorna app" in fondo al menu laterale.'
  } else if (/JWT|token|session/i.test(testo)) {
    spiegazione = 'La sessione è scaduta. Esci e accedi di nuovo, poi riprova.'
  } else if (/Failed to fetch|NetworkError|network/i.test(testo)) {
    spiegazione = 'Non riesco a contattare il database. Controlla la connessione a internet e riprova.'
  } else if (/statement timeout|canceling statement|cancelling statement|57014/i.test(testo)) {
    spiegazione =
      'Il database ha impiegato troppo tempo e ha annullato il salvataggio. Di solito succede con foto molto pesanti: prova a salvare la moneta senza foto, e se funziona riaggiungile una alla volta.'
  } else if (/payload|too large|value too long/i.test(testo)) {
    spiegazione = 'Le immagini allegate sono troppo pesanti. Prova a salvare la moneta con una sola foto, o senza foto.'
  }

  const dettagli = [e?.code && `codice: ${e.code}`, testo, e?.details, e?.hint].filter(Boolean).join(' · ')
  return `${spiegazione}\n\nDettaglio tecnico:\n${dettagli}`
}

function AppShell() {
  const { user, signOut } = useAuth()
  const { coins, refresh } = useCoins()

  const [epocaFiltro, setEpocaFiltro] = useState<Epoca | 'tutte'>('tutte')
  const [filtroSpeciale, setFiltroSpeciale] = useState<FiltroSpeciale>('tutte')
  const [search, setSearch] = useState('')
  const [ordinamento, setOrdinamento] = useState<Ordinamento>('recenti')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState<'new' | 'edit' | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ testo: string; azione?: AzioneToast } | null>(null)
  const [immagini, setImmagini] = useState<Pick<Coin, 'immagineDritto' | 'immagineRovescio'> | null>(null)
  /** Incrementato per forzare il ricaricamento delle foto della moneta aperta. */
  const [ricaricaImmagini, setRicaricaImmagini] = useState(0)

  const coinElenco = coins.find((c) => c.id === selectedId) ?? null
  // L'elenco non contiene le immagini: quelle della moneta aperta arrivano da
  // una richiesta dedicata e vengono unite qui.
  const selectedCoin = coinElenco && immagini ? { ...coinElenco, ...immagini } : coinElenco

  useEffect(() => {
    if (!selectedId) {
      setImmagini(null)
      return
    }
    let annullato = false
    setImmagini(null)
    fetchCoinCompleta(selectedId)
      .then((c) => {
        if (!annullato) setImmagini({ immagineDritto: c.immagineDritto, immagineRovescio: c.immagineRovescio })
      })
      .catch(() => {
        /* senza immagini il dettaglio resta comunque consultabile */
      })
    return () => {
      annullato = true
    }
  }, [selectedId, ricaricaImmagini])

  const filtered = useMemo(() => {
    let list = coins
    if (epocaFiltro !== 'tutte') list = list.filter((c) => c.epoca === epocaFiltro)
    if (filtroSpeciale === 'preferite') list = list.filter((c) => c.preferita)
    if (filtroSpeciale === 'periziate') list = list.filter((c) => c.periziata)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((c) =>
        [c.nome, c.sovranoEmittente, c.statoEmittente, c.zecca, c.riferimentoCatalogo, c.note]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q)),
      )
    }
    const sorted = [...list]
    switch (ordinamento) {
      case 'nome':
        sorted.sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
        break
      case 'anno':
        sorted.sort((a, b) => a.annoConio.localeCompare(b.annoConio, 'it'))
        break
      case 'valore':
        sorted.sort((a, b) => (b.valoreStimato ?? 0) - (a.valoreStimato ?? 0))
        break
      default:
        sorted.sort((a, b) => b.dataInserimento.localeCompare(a.dataInserimento))
    }
    return sorted
  }, [coins, epocaFiltro, filtroSpeciale, search, ordinamento])

  const titolo =
    filtroSpeciale === 'preferite'
      ? 'Preferite'
      : filtroSpeciale === 'periziate'
        ? 'Periziate'
        : epocaFiltro !== 'tutte'
          ? epocaFiltro[0].toUpperCase() + epocaFiltro.slice(1)
          : 'Tutte le monete'

  /**
   * Apre la modifica solo con le immagini già disponibili: il modulo riscrive
   * tutti i campi, quindi partire senza foto le cancellerebbe dal database.
   */
  async function apriModifica() {
    if (!selectedId) return
    if (!immagini) {
      try {
        const c = await fetchCoinCompleta(selectedId)
        setImmagini({ immagineDritto: c.immagineDritto, immagineRovescio: c.immagineRovescio })
      } catch {
        alert('Non riesco a caricare le foto di questa moneta: riprova tra qualche istante.')
        return
      }
    }
    setFormOpen('edit')
  }

  async function handleSave(inputOriginale: CoinInput) {
    setSaving(true)
    try {
      // La miniatura mostrata nella griglia viene sempre riderivata dal dritto,
      // così resta allineata anche quando la foto viene sostituita o rimossa.
      const input: CoinInput = {
        ...inputOriginale,
        miniaturaDritto: inputOriginale.immagineDritto
          ? await creaMiniatura(inputOriginale.immagineDritto)
          : null,
      }

      let messaggio: string
      let azione: AzioneToast | undefined
      if (formOpen === 'edit' && selectedCoin) {
        // Fotografia dello stato precedente, scattata prima di sovrascriverlo.
        const precedente = coinToInput(selectedCoin)
        const id = selectedCoin.id
        await updateCoin(id, input)
        messaggio = 'Modifiche salvate nel database ✓'
        azione = { etichetta: 'Annulla', onClick: () => ripristina(id, precedente) }
      } else {
        const coin = await addCoin(input)
        setSelectedId(coin.id)
        messaggio = 'Moneta salvata nel database ✓'
      }
      const aggiornate = await refresh()
      const n = aggiornate.length
      setToast({
        testo: `${messaggio} — ${n} ${n === 1 ? 'moneta' : 'monete'} in totale nel catalogo`,
        azione,
      })
      setFormOpen(null)
    } catch (err) {
      alert(descriviErroreSalvataggio(err))
    } finally {
      setSaving(false)
    }
  }

  /** Riporta la moneta ai valori che aveva prima dell'ultima modifica. */
  async function ripristina(id: string, precedente: CoinInput) {
    try {
      await updateCoin(id, precedente)
      await refresh()
      // L'elenco non trasporta le foto: si forza il ricaricamento di quelle
      // della moneta aperta, qualunque essa sia adesso. Riassegnarle a mano
      // sarebbe sbagliato se nel frattempo fosse stata aperta un'altra moneta.
      setRicaricaImmagini((n) => n + 1)
      setToast({ testo: 'Modifiche annullate: la moneta è tornata com’era ✓' })
    } catch (err) {
      alert(descriviErroreSalvataggio(err))
    }
  }

  async function handleDelete() {
    if (!selectedCoin) return
    if (!confirm(`Eliminare "${selectedCoin.nome}" dal catalogo? L'operazione non è reversibile.`)) return
    await deleteCoin(selectedCoin.id)
    setSelectedId(null)
    await refresh()
  }

  async function handleToggleFavorite() {
    if (!selectedCoin) return
    await toggleFavorite(selectedCoin.id, !selectedCoin.preferita)
    await refresh()
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-stone-100 font-sans text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <Sidebar
        coins={coins}
        epocaFiltro={epocaFiltro}
        onEpocaFiltro={(e) => {
          setEpocaFiltro(e)
          setMobileSidebarOpen(false)
        }}
        filtroSpeciale={filtroSpeciale}
        onFiltroSpeciale={(f) => {
          setFiltroSpeciale(f)
          setMobileSidebarOpen(false)
        }}
        onNuovaMoneta={() => {
          setSelectedId(null)
          setFormOpen('new')
          setMobileSidebarOpen(false)
        }}
        userEmail={user?.email}
        onAccount={() => {
          setAccountOpen(true)
          setMobileSidebarOpen(false)
        }}
        className="hidden w-64 shrink-0 lg:flex"
      />

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <Sidebar
            coins={coins}
            epocaFiltro={epocaFiltro}
            onEpocaFiltro={(e) => {
              setEpocaFiltro(e)
              setMobileSidebarOpen(false)
            }}
            filtroSpeciale={filtroSpeciale}
            onFiltroSpeciale={(f) => {
              setFiltroSpeciale(f)
              setMobileSidebarOpen(false)
            }}
            onNuovaMoneta={() => {
              setSelectedId(null)
              setFormOpen('new')
              setMobileSidebarOpen(false)
            }}
            userEmail={user?.email}
            onAccount={() => {
              setAccountOpen(true)
              setMobileSidebarOpen(false)
            }}
            className="relative z-10 w-72 shrink-0"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1">
        <div className={`min-w-0 flex-1 flex-col lg:flex ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950 lg:hidden">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileSidebarOpen(true)} className="rounded-lg p-2 text-stone-600 hover:bg-stone-200 dark:text-stone-300">
                <Menu size={20} />
              </button>
              <span className="font-serif text-base font-semibold">Numismatica</span>
            </div>
            <button onClick={() => signOut()} className="text-xs text-stone-400">
              Esci
            </button>
          </div>
          <CoinGrid
            coins={filtered}
            search={search}
            onSearch={setSearch}
            ordinamento={ordinamento}
            onOrdinamento={setOrdinamento}
            selectedId={selectedId}
            onSelect={setSelectedId}
            titolo={titolo}
          />
        </div>

        {selectedCoin ? (
          <div className="w-full shrink-0 lg:w-[420px] lg:border-l lg:border-stone-200 lg:dark:border-stone-800">
            <CoinDetail
              coin={selectedCoin}
              onEdit={apriModifica}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onClose={() => setSelectedId(null)}
            />
          </div>
        ) : (
          <div className="hidden w-[420px] shrink-0 items-center justify-center border-l border-stone-200 text-center text-stone-400 dark:border-stone-800 lg:flex">
            <p className="px-8 font-serif">Seleziona una moneta per vederne i dettagli</p>
          </div>
        )}
      </div>

      {formOpen && (
        <CoinForm
          coin={formOpen === 'edit' ? selectedCoin : null}
          onSave={handleSave}
          onCancel={() => !saving && setFormOpen(null)}
        />
      )}

      {accountOpen && <AccountPanel onClose={() => setAccountOpen(false)} />}

      {toast && <Toast message={toast.testo} azione={toast.azione} onClose={() => setToast(null)} />}
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (!supabaseConfigured) return <SetupNotice />
  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-stone-100 dark:bg-stone-950">
        <Landmark className="animate-pulse text-amber-700 dark:text-amber-500" size={32} />
      </div>
    )
  }
  if (!user) return <AuthScreen />
  return <AppShell />
}

export default App
