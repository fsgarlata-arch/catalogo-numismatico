import * as XLSX from 'xlsx'
import type { Coin } from '../db/types'
import { EPOCHE } from '../db/types'

function epocaLabel(coin: Coin): string {
  return EPOCHE.find((e) => e.value === coin.epoca)?.label.split(' (')[0] ?? coin.epoca
}

function dataIt(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('it-IT')
}

export function exportCoinsToExcel(coins: Coin[]): void {
  const rows = coins.map((c) => ({
    Nome: c.nome,
    'Sovrano / autorità': c.sovranoEmittente,
    'Stato emittente': c.statoEmittente,
    Epoca: epocaLabel(c),
    'Anno / periodo di conio': c.annoConio,
    Zecca: c.zecca,
    Metallo: c.metallo,
    'Peso (g)': c.peso ?? '',
    'Diametro (mm)': c.diametro ?? '',
    Tiratura: c.tiratura ?? '',
    Rarità: c.rarita,
    'Stato di conservazione': c.statoConservazione,
    Periziata: c.periziata ? 'Sì' : 'No',
    'Ente / perito': c.enteperizia,
    'N. certificato perizia': c.numeroPerizia,
    'Riferimento catalogo': c.riferimentoCatalogo,
    'Valore stimato (€)': c.valoreStimato ?? '',
    'Prezzo di acquisto (€)': c.prezzoAcquisto ?? '',
    Note: c.note,
    Preferita: c.preferita ? 'Sì' : 'No',
    // Le foto non sono incluse: l'elenco non le scarica (sarebbero centinaia di
    // kB per moneta) e restano consultabili nel dettaglio di ciascuna moneta.
    'Data inserimento': dataIt(c.dataInserimento),
    'Ultima modifica': dataIt(c.dataModifica),
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)

  // Larghezze colonne indicative per una lettura comoda
  worksheet['!cols'] = [
    { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
    { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 22 },
    { wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 18 },
    { wch: 40 }, { wch: 10 }, { wch: 16 }, { wch: 16 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalogo')

  const oggi = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `catalogo-numismatico-${oggi}.xlsx`)
}
