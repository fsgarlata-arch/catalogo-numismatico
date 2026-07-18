import { useState } from 'react'
import { X, LogOut, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

interface Props {
  onClose: () => void
}

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 pb-6 dark:border-stone-800">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">{title}</h3>
      {children}
    </div>
  )
}

export function AccountPanel({ onClose }: Props) {
  const { user, signOut, updateEmail, updatePassword, deleteAccount } = useAuth()

  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState<{ type: 'error' | 'info'; text: string } | null>(null)
  const [emailSubmitting, setEmailSubmitting] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'error' | 'info'; text: string } | null>(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const [deleting, setDeleting] = useState(false)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailMsg(null)
    setEmailSubmitting(true)
    const { error } = await updateEmail(newEmail)
    setEmailSubmitting(false)
    if (error) {
      setEmailMsg({ type: 'error', text: error })
    } else {
      setEmailMsg({ type: 'info', text: 'Controlla la tua nuova casella email per confermare il cambio.' })
      setNewEmail('')
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Le due password non coincidono.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'La password deve avere almeno 6 caratteri.' })
      return
    }
    setPasswordSubmitting(true)
    const { error } = await updatePassword(newPassword)
    setPasswordSubmitting(false)
    if (error) {
      setPasswordMsg({ type: 'error', text: error })
    } else {
      setPasswordMsg({ type: 'info', text: 'Password aggiornata con successo.' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleDelete() {
    if (!confirm('Eliminare definitivamente il tuo account e tutte le monete del tuo catalogo? L\'operazione non è reversibile.')) return
    setDeleting(true)
    const { error } = await deleteAccount()
    setDeleting(false)
    if (error) alert(`Impossibile eliminare l'account: ${error}`)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 lg:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-stone-900 lg:max-w-lg lg:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 p-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
          <h2 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-50">Il mio account</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-5">
          <Section title="Email attuale">
            <p className="text-sm text-stone-700 dark:text-stone-200">{user?.email}</p>
          </Section>

          <Section title="Cambia email">
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Nuova email"
                className={inputClass}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              {emailMsg && (
                <p className={`text-sm ${emailMsg.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {emailMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={emailSubmitting}
                className="self-start rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                {emailSubmitting ? 'Attendere...' : 'Aggiorna email'}
              </button>
            </form>
          </Section>

          <Section title="Cambia password">
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                required
                placeholder="Nuova password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                required
                placeholder="Conferma nuova password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordMsg && (
                <p className={`text-sm ${passwordMsg.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {passwordMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="self-start rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                {passwordSubmitting ? 'Attendere...' : 'Aggiorna password'}
              </button>
            </form>
          </Section>

          <Section title="Sessione">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 self-start rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <LogOut size={16} /> Esci
            </button>
          </Section>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-red-500">Zona pericolosa</h3>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} /> {deleting ? 'Eliminazione...' : 'Elimina account e catalogo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
