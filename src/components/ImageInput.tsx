import { useRef, useState } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import { fileToCompressedDataUrl } from '../utils/image'

interface Props {
  label: string
  value: string | null
  onChange: (dataUrl: string | null) => void
}

export function ImageInput({ label, value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setLoading(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      onChange(dataUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-stone-300 bg-gradient-to-br from-stone-100 to-stone-200 dark:border-stone-700 dark:from-stone-800 dark:to-stone-900">
        {loading ? (
          <span className="text-xs text-stone-400">Elaborazione...</span>
        ) : value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <span className="text-xs text-stone-400">Nessuna immagine</span>
        )}
      </div>
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <Camera size={13} /> Scatta
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <ImagePlus size={13} /> Galleria
        </button>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
