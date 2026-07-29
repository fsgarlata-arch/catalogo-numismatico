import type { Coin, CoinInput } from './types'

export interface CoinRow {
  id: string
  user_id: string
  nome: string
  sovrano_emittente: string
  stato_emittente: string
  epoca: Coin['epoca']
  anno_conio: string
  zecca: string
  metallo: string
  peso: number | null
  diametro: number | null
  tiratura: number | null
  rarita: string
  stato_conservazione: string
  periziata: boolean
  ente_perizia: string
  numero_perizia: string
  riferimento_catalogo: string
  valore_stimato: number | null
  prezzo_acquisto: number | null
  note: string
  // Opzionali: la query dell'elenco non seleziona le immagini per non
  // scaricare centinaia di kB per moneta ad ogni ricarica.
  immagine_dritto?: string | null
  immagine_rovescio?: string | null
  preferita: boolean
  data_inserimento: string
  data_modifica: string
}

export function rowToCoin(row: CoinRow): Coin {
  return {
    id: row.id,
    nome: row.nome,
    sovranoEmittente: row.sovrano_emittente,
    statoEmittente: row.stato_emittente,
    epoca: row.epoca,
    annoConio: row.anno_conio,
    zecca: row.zecca,
    metallo: row.metallo,
    peso: row.peso,
    diametro: row.diametro,
    tiratura: row.tiratura,
    rarita: row.rarita,
    statoConservazione: row.stato_conservazione,
    periziata: row.periziata,
    enteperizia: row.ente_perizia,
    numeroPerizia: row.numero_perizia,
    riferimentoCatalogo: row.riferimento_catalogo,
    valoreStimato: row.valore_stimato,
    prezzoAcquisto: row.prezzo_acquisto,
    note: row.note,
    // Assenti quando la riga arriva dalla query dell'elenco, che non le scarica.
    immagineDritto: row.immagine_dritto ?? null,
    immagineRovescio: row.immagine_rovescio ?? null,
    preferita: row.preferita,
    dataInserimento: row.data_inserimento,
    dataModifica: row.data_modifica,
  }
}

export function coinInputToRow(input: CoinInput) {
  return {
    nome: input.nome,
    sovrano_emittente: input.sovranoEmittente,
    stato_emittente: input.statoEmittente,
    epoca: input.epoca,
    anno_conio: input.annoConio,
    zecca: input.zecca,
    metallo: input.metallo,
    peso: input.peso,
    diametro: input.diametro,
    tiratura: input.tiratura,
    rarita: input.rarita,
    stato_conservazione: input.statoConservazione,
    periziata: input.periziata,
    ente_perizia: input.enteperizia,
    numero_perizia: input.numeroPerizia,
    riferimento_catalogo: input.riferimentoCatalogo,
    valore_stimato: input.valoreStimato,
    prezzo_acquisto: input.prezzoAcquisto,
    note: input.note,
    immagine_dritto: input.immagineDritto,
    immagine_rovescio: input.immagineRovescio,
    preferita: input.preferita,
  }
}
