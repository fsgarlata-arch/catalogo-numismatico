import { useState } from 'react'
import { Landmark } from 'lucide-react'
import { useAuth } from './AuthContext'

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'

export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function resetMessages() {
    setError(null)
    setInfo(null)
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next)
    resetMessages()
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetMessages()

    if (mode === 'register' && password !== confirmPassword) {
      setError('Le due password non coincidono.')
      return
    }
    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.')
      return
    }

    setSubmitting(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(traduciErrore(error))
    } else {
      const { error, needsEmailConfirmation } = await signUp(email, password)
      if (error) {
        setError(traduciErrore(error))
      } else if (needsEmailConfirmation) {
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setInfo('Registrazione completata. Controlla la tua email per confermare l\'account prima di accedere.')
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-stone-100 p-4 dark:bg-stone-950">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Landmark className="text-amber-700 dark:text-amber-500" size={32} />
          <h1 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-50">Numismatica</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {mode === 'login' ? 'Accedi al tuo catalogo personale' : 'Crea un nuovo account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">Password</label>
            <input
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">Conferma password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {info && <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-amber-700 py-2.5 text-sm font-medium text-white transition hover:bg-amber-800 disabled:opacity-60"
          >
            {submitting ? 'Attendere...' : mode === 'login' ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500 dark:text-stone-400">
          {mode === 'login' ? (
            <>
              Non hai un account?{' '}
              <button onClick={() => switchMode('register')} className="font-medium text-amber-700 hover:underline dark:text-amber-500">
                Registrati
              </button>
            </>
          ) : (
            <>
              Hai già un account?{' '}
              <button onClick={() => switchMode('login')} className="font-medium text-amber-700 hover:underline dark:text-amber-500">
                Accedi
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

function traduciErrore(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email o password non corrette.'
  if (message.includes('User already registered')) return 'Esiste già un account con questa email.'
  if (message.includes('Password should be at least')) return 'La password deve avere almeno 6 caratteri.'
  if (message.includes('Unable to validate email address') || message.includes('is invalid')) return 'Indirizzo email non valido.'
  if (message.includes('email rate limit exceeded')) return 'Troppi tentativi di invio email in poco tempo. Riprova tra qualche minuto.'
  if (message.includes('For security purposes')) return 'Troppi tentativi in poco tempo. Attendi qualche istante e riprova.'
  return message
}
