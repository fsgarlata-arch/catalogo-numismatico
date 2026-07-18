export function formatEuro(value: number | null): string {
  if (value === null || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

export function formatNumber(value: number | null, unit = ''): string {
  if (value === null || Number.isNaN(value)) return ''
  return `${new Intl.NumberFormat('it-IT').format(value)}${unit}`
}
