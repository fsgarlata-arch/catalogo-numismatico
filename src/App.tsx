import { useMemo, useState } from 'react'
import { Menu, Landmark } from 'lucide-react'
import { useAuth } from './auth/AuthContext'
import { AuthScreen } from './auth/AuthScreen'
import { supabaseConfigured } from './lib/supabase'
import { useCoins } from './db/useCoins'
import { addCoin, deleteCoin, toggleFavorite, updateCoin } from './db/actions'
import type { CoinInput, Epoca } from './db/types'
import { Sidebar, type FiltroSpeciale } from './components/Sidebar'
import { CoinGrid, type Ordinamento } from './components/CoinGrid'
import { CoinDetail } from './components/CoinDetail'
import { CoinForm } from './components/CoinForm'
import { AccountPanel } from './components/AccountPanel'
import { Toast } from './components/Toast'

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
  const [toast, setToast] = useState<string | null>(null)

  const selectedCoin = coins.find((c) => c.id === selectedId) ?? null

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

  async function handleSave(input: CoinInput) {
    setSaving(true)
    try {
      let messaggio: string
      if (formOpen === 'edit' && selectedCoin) {
        await updateCoin(selectedCoin.id, input)
        messaggio = 'Modifiche salvate nel database ✓'
      } else {
        const coin = await addCoin(input)
        setSelectedId(coin.id)
        messaggio = 'Moneta salvata nel database ✓'
      }
      const aggiornate = await refresh()
      const n = aggiornate.length
      setToast(`${messaggio} — ${n} ${n === 1 ? 'moneta' : 'monete'} in totale nel catalogo`)
      setFormOpen(null)
    } catch (err) {
      alert(`Impossibile salvare la moneta: ${(err as Error).message}`)
    } finally {
      setSaving(false)
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
              onEdit={() => setFormOpen('edit')}
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
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
