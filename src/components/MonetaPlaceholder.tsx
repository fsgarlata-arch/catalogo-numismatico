/**
 * Segnaposto per le monete prive di foto: il ducato di Ruggero II, re di
 * Sicilia. L'immagine (public/moneta-segnaposto.webp) è ritagliata a quadrato
 * attorno al tondello e ha lo sfondo trasparente, così si appoggia al fondo del
 * contenitore sia su tema chiaro sia su tema scuro.
 */
export function MonetaPlaceholder({ className = '' }: { className?: string }) {
  return (
    <img
      src="/moneta-segnaposto.webp"
      alt=""
      role="presentation"
      loading="lazy"
      draggable={false}
      className={`object-contain p-[6%] select-none ${className}`}
    />
  )
}
