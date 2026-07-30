// Le foto vengono salvate nel database come testo (data URL base64), quindi il
// loro peso incide direttamente sul tempo di scrittura: immagini troppo grandi
// fanno scadere il tempo massimo della query ("statement timeout").
// Questi limiti tengono ogni foto ben sotto i 200 kB restando nitida a schermo.
const MAX_DIM = 900
const QUALITY_INIZIALE = 0.72
const QUALITY_MINIMA = 0.4
const MAX_BYTES = 200_000

// Miniatura per la griglia del catalogo: minuscola di proposito, così può
// essere scaricata per ogni moneta dell'elenco senza appesantire la query.
const MINIATURA_DIM = 160
const MINIATURA_QUALITY = 0.6

/** Byte effettivi rappresentati da un data URL base64. */
function pesoDataUrl(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.floor((base64.length * 3) / 4)
}

export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponibile')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  // Riduce progressivamente la qualità finché la foto non rientra nel limite,
  // così anche gli scatti più pesanti restano salvabili.
  let quality = QUALITY_INIZIALE
  let dataUrl = canvas.toDataURL('image/jpeg', quality)
  while (pesoDataUrl(dataUrl) > MAX_BYTES && quality > QUALITY_MINIMA) {
    quality -= 0.1
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }

  return dataUrl
}

/**
 * Ricava dalla foto già compressa una miniatura per la griglia del catalogo.
 * Restituisce null se l'immagine non è leggibile: la griglia ripiega
 * sull'iniziale del nome, quindi non è un errore bloccante.
 */
export async function creaMiniatura(dataUrl: string): Promise<string | null> {
  try {
    const risposta = await fetch(dataUrl)
    const bitmap = await createImageBitmap(await risposta.blob())
    const scale = Math.min(1, MINIATURA_DIM / Math.max(bitmap.width, bitmap.height))

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()

    return canvas.toDataURL('image/jpeg', MINIATURA_QUALITY)
  } catch {
    return null
  }
}
