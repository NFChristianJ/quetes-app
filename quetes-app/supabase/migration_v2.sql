-- =============================================================
-- Migration V2 — à coller dans Supabase > SQL Editor > Run
-- (à exécuter APRÈS schema.sql, sur un projet déjà existant)
-- =============================================================

-- 1. Historique quotidien par tâche : sert aux calendriers/heatmaps
create table if not exists task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
  log_date date not null default current_date,
  done boolean not null default true,
  created_at timestamptz not null default now(),
  unique (task_id, log_date)
);

create index if not exists task_logs_user_idx on task_logs (user_id, task_id, log_date);

alter table task_logs enable row level security;

create policy "task_logs: lecture propre" on task_logs
  for select using (auth.uid() = user_id);
create policy "task_logs: écriture propre" on task_logs
  for insert with check (auth.uid() = user_id);
create policy "task_logs: mise à jour propre" on task_logs
  for update using (auth.uid() = user_id);
create policy "task_logs: suppression propre" on task_logs
  for delete using (auth.uid() = user_id);

-- 2. Profil : objectifs choisis, onboarding fait, thème, avatar
alter table player_stats add column if not exists goals text[] not null default '{}';
alter table player_stats add column if not exists onboarded boolean not null default false;
alter table player_stats add column if not exists theme text not null default 'arcane';
alter table player_stats add column if not exists avatar_icon text not null default '🧙';
alter table player_stats add column if not exists avatar_color text not null default '#E3B54E';
