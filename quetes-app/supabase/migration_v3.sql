-- =============================================================
-- Migration V3 — à coller dans Supabase > SQL Editor > Run
-- (à exécuter APRÈS schema.sql et migration_v2.sql)
-- =============================================================

-- 1. Tâches : sous-tâches (checklist), catégorie d'objectif, rappel
alter table tasks add column if not exists checklist jsonb not null default '[]'::jsonb;
alter table tasks add column if not exists category text;
alter table tasks add column if not exists reminder_time text; -- format 'HH:MM', pour les quotidiennes

-- 2. Rituels personnalisés créés par l'utilisateur
create table if not exists rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  moment text check (moment in ('matin', 'soir', null)),
  description text default '',
  steps jsonb not null default '[]'::jsonb, -- [{ title, difficulty }]
  created_at timestamptz not null default now()
);

alter table rituals enable row level security;

create policy "rituals: lecture propre" on rituals
  for select using (auth.uid() = user_id);
create policy "rituals: écriture propre" on rituals
  for insert with check (auth.uid() = user_id);
create policy "rituals: mise à jour propre" on rituals
  for update using (auth.uid() = user_id);
create policy "rituals: suppression propre" on rituals
  for delete using (auth.uid() = user_id);
