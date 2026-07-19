import { createClient } from '@supabase/supabase-js'

// URL e chiave "anon" del progetto Supabase.
// Sono valori PUBBLICI per definizione: la chiave anon è pensata per essere
// inclusa nel codice del browser ed è protetta dalle policy RLS del database.
// Non è un segreto (a differenza della service_role key, che NON usiamo).
//
// Sono scritti direttamente qui come costanti (non letti da variabili
// d'ambiente) di proposito: incollare questi valori nelle variabili d'ambiente
// di hosting come Vercel può introdurre caratteri invisibili non-ASCII che
// rendono malformata l'intestazione della richiesta ("non ISO-8859-1 code
// point") e impediscono login/registrazione. Come costanti nel codice il
// valore è sempre pulito e identico ovunque.
const SUPABASE_URL = 'https://fixfsilmerditnxdnbak.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeGZzaWxtZXJkaXRueGRuYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTUwMzMsImV4cCI6MjA5OTkzMTAzM30.P4lZs1IWLY-SnH9RBrURSo_3EUi1L8cQbQlA8i2pcWE'

export const supabaseConfigured = true

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
