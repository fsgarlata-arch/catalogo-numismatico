import { rilevaMoneta } from './rilevaMoneta'

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

// Margine lasciato oltre il bordo rilevato della moneta: assorbe le piccole
// imprecisioni del riconoscimento, evitando di tranciare il tondello.
const MARGINE_TONDELLO = 1.03

/** Byte effettivi rappresentati da un data URL base64. */
function pesoDataUrl(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.floor((base64.length * 3) / 4)
}

/** Esporta abbassando la qualità finché non si rientra nel limite di peso. */
function esporta(canvas: HTMLCanvasElement, tipo: string, qualitaIniziale: number): string {
  let q = qualitaIniziale
  let dataUrl = canvas.toDataURL(tipo, q)
  while (pesoDataUrl(dataUrl) > MAX_BYTES && q > QUALITY_MINIMA) {
    q -= 0.1
    dataUrl = canvas.toDataURL(tipo, q)
  }
  return dataUrl
}

function ridimensiona(bitmap: ImageBitmap, maxDim: number): HTMLCanvasElement {
  const scala = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scala)
  canvas.height = Math.round(bitmap.height * scala)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponibile')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * Ritaglia la moneta al centro di un quadrato e rende trasparente lo sfondo
 * attorno al tondello. Restituisce null se la moneta non è stata riconosciuta
 * con sufficiente certezza: in quel caso è più prudente lasciare la foto intera.
 */
function scontornaMoneta(origine: HTMLCanvasElement): HTMLCanvasElement | null {
  const moneta = rilevaMoneta(origine)
  if (!moneta) return null

  const lato = MAX_DIM
  const meta = lato / 2
  // Scala uniforme sul semiasse maggiore: la moneta riempie il riquadro senza
  // essere deformata, anche quando la foto è scattata di sbieco.
  const scala = (meta * 0.99) / (Math.max(moneta.rx, moneta.ry) * MARGINE_TONDELLO)

  const canvas = document.createElement('canvas')
  canvas.width = lato
  canvas.height = lato
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingQuality = 'high'

  // porta il centro della moneta al centro del quadrato, alla scala calcolata
  ctx.save()
  ctx.translate(meta, meta)
  ctx.scale(scala, scala)
  ctx.translate(-moneta.cx, -moneta.cy)
  ctx.drawImage(origine, 0, 0)
  ctx.restore()

  // Ritaglio con bordo sfumato che segue l'ellisse rilevata: così non resta un
  // anello di sfondo attorno ai tondelli fotografati di sbieco.
  const rx = moneta.rx * scala * MARGINE_TONDELLO
  const ry = moneta.ry * scala * MARGINE_TONDELLO
  ctx.globalCompositeOperation = 'destination-in'
  ctx.save()
  ctx.translate(meta, meta)
  ctx.scale(rx / ry, 1) // il cerchio della sfumatura diventa l'ellisse voluta
  const sfumatura = ctx.createRadialGradient(0, 0, ry * 0.985, 0, 0, ry)
  sfumatura.addColorStop(0, 'rgba(0,0,0,1)')
  sfumatura.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sfumatura
  ctx.fillRect(-lato, -lato, lato * 2, lato * 2)
  ctx.restore()
  ctx.globalCompositeOperation = 'source-over'

  return canvas
}

export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const intera = ridimensiona(bitmap, MAX_DIM * 1.6)
  bitmap.close?.()

  const scontornata = scontornaMoneta(intera)
  if (scontornata) {
    // WebP perché conserva la trasparenza dello sfondo rimosso
    return esporta(scontornata, 'image/webp', 0.82)
  }

  // Riconoscimento non attendibile: si conserva la foto così com'è.
  const ridotta = intera.width > MAX_DIM || intera.height > MAX_DIM
    ? ridimensionaCanvas(intera, MAX_DIM)
    : intera
  return esporta(ridotta, 'image/jpeg', QUALITY_INIZIALE)
}

function ridimensionaCanvas(origine: HTMLCanvasElement, maxDim: number): HTMLCanvasElement {
  const scala = Math.min(1, maxDim / Math.max(origine.width, origine.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(origine.width * scala)
  canvas.height = Math.round(origine.height * scala)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponibile')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(origine, 0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * Ricava dalla foto già compressa una miniatura per la griglia del catalogo.
 * Restituisce null se l'immagine non è leggibile: la griglia ripiega
 * sull'icona segnaposto, quindi non è un errore bloccante.
 */
export async function creaMiniatura(dataUrl: string): Promise<string | null> {
  try {
    const risposta = await fetch(dataUrl)
    const bitmap = await createImageBitmap(await risposta.blob())
    const scala = Math.min(1, MINIATURA_DIM / Math.max(bitmap.width, bitmap.height))

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scala)
    canvas.height = Math.round(bitmap.height * scala)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()

    // WebP anche qui: le foto scontornate hanno lo sfondo trasparente, che il
    // JPEG appiattirebbe in nero.
    return canvas.toDataURL('image/webp', MINIATURA_QUALITY)
  } catch {
    return null
  }
}
