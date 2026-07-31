/**
 * Segnaposto per le monete prive di foto: un tondello antico con bordo
 * perlinato e busto di profilo laureato, nello stile del dritto di una moneta
 * romana. Disegnato con `currentColor`, così eredita il colore dal contenitore
 * e funziona sia su tema chiaro sia su tema scuro.
 */

const PERLINE = 32
const RAGGIO_PERLINE = 42

/** Punto sulla circonferenza (θ in gradi: 0 = destra, 90 = basso). */
function punto(gradi: number, raggio: number) {
  const r = (gradi * Math.PI) / 180
  return { x: 50 + raggio * Math.cos(r), y: 50 + raggio * Math.sin(r) }
}

// Profilo rivolto a sinistra: fronte, naso, labbra, mento, collo e nuca.
const BUSTO = `M 51 23
  C 41 23, 34 30, 33 39
  C 32.6 42, 32.4 44, 31.4 45.6
  L 25.5 53.5
  C 24.4 55, 26 56, 28.4 56.4
  C 30 56.7, 29.6 58, 29.6 59.4
  C 29.6 61.2, 31 62.4, 33 63.2
  C 34.6 66.4, 38 69.6, 43.4 71.6
  L 43.4 76 C 43.4 78, 44.4 79, 46.4 79
  L 70 79
  C 71.6 70, 73.6 57, 72 45.6
  C 70 31, 61.4 23, 51 23 Z`

// Corona d'alloro: resta dentro il profilo del cranio.
const CORONA = 'M 35 41.5 C 44 33.5, 59 32.5, 68.5 42'

export function MonetaPlaceholder({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="presentation" aria-hidden="true">
      {/* tondello */}
      <circle cx="50" cy="50" r="47" fill="currentColor" opacity="0.13" />
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.4" />

      {/* bordo perlinato */}
      {Array.from({ length: PERLINE }, (_, i) => {
        const p = punto((i / PERLINE) * 360, RAGGIO_PERLINE)
        return <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="currentColor" opacity="0.45" />
      })}

      <path d={BUSTO} fill="currentColor" opacity="0.5" />
      <path d={CORONA} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}
