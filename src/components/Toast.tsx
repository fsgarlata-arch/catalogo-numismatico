import { useEffect } from 'react'
import { CheckCircle2, X, Undo2 } from 'lucide-react'

export interface AzioneToast {
  etichetta: string
  onClick: () => void
}

interface Props {
  message: string
  azione?: AzioneToast
  onClose: () => void
}

// Con un'azione a disposizione la notifica resta più a lungo: chi deve
// accorgersi dell'errore e decidere ha bisogno di qualche secondo in più.
const DURATA_SEMPLICE = 3500
const DURATA_CON_AZIONE = 12000

export function Toast({ message, azione, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, azione ? DURATA_CON_AZIONE : DURATA_SEMPLICE)
    return () => clearTimeout(timer)
  }, [onClose, azione])

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>{message}</span>

        {azione && (
          <button
            onClick={() => {
              azione.onClick()
              onClose()
            }}
            className="ml-1 flex shrink-0 items-center gap-1 rounded-lg border border-emerald-400 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900"
          >
            <Undo2 size={13} /> {azione.etichetta}
          </button>
        )}

        <button onClick={onClose} className="ml-1 rounded p-0.5 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
