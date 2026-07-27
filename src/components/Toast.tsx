import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

interface Props {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 rounded p-0.5 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
