/**
 * Individua il tondello in una foto, per poterla ritagliare centrata e
 * scontornare lo sfondo.
 *
 * Il metodo sfrutta il fatto che una foto di moneta è quasi sempre un oggetto
 * unico e compatto su un fondo uniforme: si stima il colore dello sfondo dai
 * bordi dell'immagine, si marcano i pixel che se ne discostano e si misura
 * l'estensione della macchia risultante.
 *
 * Restituisce null quando il risultato non è attendibile (sfondo non uniforme,
 * moneta che tocca i bordi, più oggetti): in quel caso la foto va lasciata
 * com'è, meglio di un ritaglio sbagliato.
 */

export interface MonetaRilevata {
  /** Centro in pixel dell'immagine analizzata. */
  cx: number
  cy: number
  /**
   * Semiassi orizzontale e verticale. Sono distinti perché una foto scattata
   * di sbieco restituisce un tondello ellittico: seguirne la forma reale
   * permette di scontornarlo senza lasciare sfondo né deformare la moneta.
   */
  rx: number
  ry: number
}

const LATO_ANALISI = 240
const SPESSORE_BORDO = 0.055
const SOGLIA_PROIEZIONE = 0.12

/** Colore mediano della cornice esterna: la stima dello sfondo. */
function coloreSfondo(dati: Uint8ClampedArray, w: number, h: number) {
  const bordo = Math.max(2, Math.round(Math.min(w, h) * SPESSORE_BORDO))
  const r: number[] = [], g: number[] = [], b: number[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const suBordo = x < bordo || y < bordo || x >= w - bordo || y >= h - bordo
      if (!suBordo) continue
      const i = (y * w + x) * 4
      if (dati[i + 3] < 128) continue // pixel già trasparente: non è sfondo utile
      r.push(dati[i]); g.push(dati[i + 1]); b.push(dati[i + 2])
    }
  }
  if (!r.length) return null
  const mediana = (a: number[]) => a.sort((x, y) => x - y)[a.length >> 1]
  return { r: mediana(r), g: mediana(g), b: mediana(b), campioni: r.length }
}

export function rilevaMoneta(canvas: HTMLCanvasElement): MonetaRilevata | null {
  const scala = LATO_ANALISI / Math.max(canvas.width, canvas.height)
  const w = Math.max(1, Math.round(canvas.width * scala))
  const h = Math.max(1, Math.round(canvas.height * scala))

  const piccolo = document.createElement('canvas')
  piccolo.width = w
  piccolo.height = h
  const ctx = piccolo.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(canvas, 0, 0, w, h)
  const dati = ctx.getImageData(0, 0, w, h).data

  const sfondo = coloreSfondo(dati, w, h)
  if (!sfondo) return null

  // Soglia adattiva: quanto un pixel deve discostarsi dallo sfondo per essere
  // considerato parte della moneta.
  let scarto = 0
  const bordo = Math.max(2, Math.round(Math.min(w, h) * SPESSORE_BORDO))
  let nBordo = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!(x < bordo || y < bordo || x >= w - bordo || y >= h - bordo)) continue
      const i = (y * w + x) * 4
      scarto += Math.hypot(dati[i] - sfondo.r, dati[i + 1] - sfondo.g, dati[i + 2] - sfondo.b)
      nBordo++
    }
  }
  const soglia = Math.max(42, (scarto / Math.max(1, nBordo)) * 2.6)

  const colonne = new Int32Array(w)
  const righe = new Int32Array(h)
  let totale = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (dati[i + 3] < 128) continue
      const d = Math.hypot(dati[i] - sfondo.r, dati[i + 1] - sfondo.g, dati[i + 2] - sfondo.b)
      if (d > soglia) {
        colonne[x]++
        righe[y]++
        totale++
      }
    }
  }
  if (totale < w * h * 0.02) return null // praticamente nulla di distinguibile

  const estensione = (proiezione: Int32Array) => {
    let max = 0
    for (const v of proiezione) if (v > max) max = v
    const soglia = max * SOGLIA_PROIEZIONE
    let a = -1, b = -1
    for (let i = 0; i < proiezione.length; i++) if (proiezione[i] > soglia) { a = i; break }
    for (let i = proiezione.length - 1; i >= 0; i--) if (proiezione[i] > soglia) { b = i; break }
    return a < 0 ? null : { a, b, lung: b - a + 1 }
  }

  const ex = estensione(colonne)
  const ey = estensione(righe)
  if (!ex || !ey) return null

  // --- controlli di attendibilità ---

  // 1. deve essere all'incirca tondo
  const proporzione = ex.lung / ey.lung
  if (proporzione < 0.65 || proporzione > 1.55) return null

  // 2. non deve occupare tutta l'immagine (sfondo non riconosciuto)
  if (ex.lung > w * 0.97 && ey.lung > h * 0.97) return null

  // 3. né essere troppo piccolo per essere il soggetto
  if (ex.lung < w * 0.15 || ey.lung < h * 0.15) return null

  // 4. la macchia deve riempire il proprio riquadro come un disco (~0.785),
  //    non come una striscia o una nuvola sparsa
  const riempimento = totale / (ex.lung * ey.lung)
  if (riempimento < 0.45 || riempimento > 0.97) return null

  return {
    cx: (ex.a + ex.b + 1) / 2 / scala,
    cy: (ey.a + ey.b + 1) / 2 / scala,
    rx: ex.lung / 2 / scala,
    ry: ey.lung / 2 / scala,
  }
}
