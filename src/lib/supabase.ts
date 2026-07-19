import { createClient } from '@supabase/supabase-js'

// URL e chiave "anon" del progetto Supabase.
// Questi valori sono PUBBLICI per definizione: la chiave anon è pensata per
// essere inclusa nel codice del browser ed è protetta dalle policy RLS del
// database. Non è un segreto (a differenza della service_role key, che NON usiamo).
// Vengono letti dalle variabili d'ambiente se presenti, altrimenti si usano
// questi valori predefiniti, così l'app funziona ovunque senza configurazione.
const FALLBACK_URL = 'https://fixfsilmerditnxdnbak.supabase.co'
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeGZzaWxtZXJkaXRueGRuYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTUwMzMsImV4cCI6MjA5OTkzMTAzM30.P4lZs1IWLY-SnH9RBrURSo_3EUi1L8cQbQlA8i2pcWE'

// .trim() rimuove eventuali spazi o a-capo invisibili copiati per errore
// nelle variabili d'ambiente, che renderebbero l'indirizzo malformato.
const url = (import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL).trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY).trim()

export const supabaseConfigured = Boolean(url && anonKey)

export const supabase = createClient(url, anonKey)
