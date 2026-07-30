export type Epoca = 'antica' | 'moderna' | 'contemporanea'

export interface Coin {
  id: string
  nome: string
  sovranoEmittente: string
  statoEmittente: string
  epoca: Epoca
  annoConio: string
  zecca: string
  metallo: string
  peso: number | null
  diametro: number | null
  tiratura: number | null
  rarita: string
  statoConservazione: string
  periziata: boolean
  enteperizia: string
  numeroPerizia: string
  riferimentoCatalogo: string
  valoreStimato: number | null
  prezzoAcquisto: number | null
  note: string
  immagineDritto: string | null
  immagineRovescio: string | null
  /** Versione ridotta del dritto (~5 kB): l'unica immagine scaricata nell'elenco. */
  miniaturaDritto: string | null
  preferita: boolean
  dataInserimento: string
  dataModifica: string
}

export type CoinInput = Omit<Coin, 'id' | 'dataInserimento' | 'dataModifica'>

export const EPOCHE: { value: Epoca; label: string }[] = [
  { value: 'antica', label: 'Antica (Grecia, Roma, Bisanzio...)' },
  { value: 'moderna', label: 'Moderna (Stati preunitari, Regno d\'Italia...)' },
  { value: 'contemporanea', label: 'Contemporanea (Repubblica, Euro...)' },
]

export const GRADI_CONSERVAZIONE = [
  'FDC',
  'qFDC',
  'SPL/FDC',
  'SPL',
  'qSPL',
  'BB/SPL',
  'BB',
  'qBB',
  'MB/BB',
  'MB',
  'qMB',
  'B/MB',
  'B',
  'M',
  'Non periziata / da classificare',
]

export const SCALA_RARITA = [
  '',
  'C — Comune',
  'NC — Non Comune',
  'R — Raro',
  'R2 — Molto Raro',
  'R3 — Rarissimo',
  'R4 — Estremamente Raro',
  'R5 — Unico o quasi',
]

export const METALLI = [
  'Oro (AV)',
  'Argento (AR)',
  'Elettro',
  'Bronzo (AE)',
  'Rame (AE)',
  'Ottone / Oricalco',
  'Mistura / Billon',
  'Nichel',
  'Acmonital',
  'Italma',
  'Bimetallico',
  'Altro',
]

export const ENTI_PERIZIA = [
  'NIP — Numismatica Italiana Professionale',
  'CCPP',
  'IPC — Italian Professional Coins',
  'Gioviano',
  'PCGS',
  'NGC',
  'Perito indipendente',
  'Altro',
]
