-- Catalogo Numismatico - schema iniziale
-- Da eseguire una sola volta nel SQL Editor di Supabase (Project > SQL Editor > New query).

create extension if not exists pgcrypto;

create table if not exists public.coins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),

  nome text not null,
  sovrano_emittente text not null default '',
  stato_emittente text not null default '',
  epoca text not null default 'moderna' check (epoca in ('antica', 'moderna', 'contemporanea')),
  anno_conio text not null default '',
  zecca text not null default '',
  metallo text not null default '',
  peso numeric,
  diametro numeric,
  tiratura bigint,
  rarita text not null default '',
  stato_conservazione text not null default '',
  periziata boolean not null default false,
  ente_perizia text not null default '',
  numero_perizia text not null default '',
  riferimento_catalogo text not null default '',
  valore_stimato numeric,
  prezzo_acquisto numeric,
  note text not null default '',
  immagine_dritto text,
  immagine_rovescio text,
  -- Versione ridotta del dritto (~2 kB): è l'unica immagine caricata
  -- nell'elenco, così la griglia mostra le miniature senza scaricare le foto
  -- intere di ogni moneta (che farebbero scadere lo statement timeout).
  miniatura_dritto text,
  preferita boolean not null default false,

  data_inserimento timestamptz not null default now(),
  data_modifica timestamptz not null default now()
);

create index if not exists coins_user_id_idx on public.coins (user_id);

alter table public.coins enable row level security;

create policy "Gli utenti vedono solo le proprie monete"
  on public.coins for select
  using (auth.uid() = user_id);

create policy "Gli utenti inseriscono solo le proprie monete"
  on public.coins for insert
  with check (auth.uid() = user_id);

create policy "Gli utenti modificano solo le proprie monete"
  on public.coins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Gli utenti eliminano solo le proprie monete"
  on public.coins for delete
  using (auth.uid() = user_id);

-- Aggiorna automaticamente data_modifica ad ogni update
create or replace function public.set_data_modifica()
returns trigger
language plpgsql
as $$
begin
  new.data_modifica = now();
  return new;
end;
$$;

drop trigger if exists coins_set_data_modifica on public.coins;
create trigger coins_set_data_modifica
  before update on public.coins
  for each row
  execute function public.set_data_modifica();

-- Permette a un utente autenticato di eliminare il proprio account
-- (di default il client Supabase non può farlo direttamente: serve questa funzione
-- lato database con privilegi elevati, ma limitata a "solo l'utente stesso").
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
