-- =============================================================
-- Schéma "Quêtes" — à coller dans Supabase > SQL Editor > Run
-- =============================================================

-- 1. Statistiques du joueur (une ligne par utilisateur)
create table if not exists player_stats (
  user_id uuid references auth.users(id) on delete cascade primary key,
  level int not null default 1,
  xp int not null default 0,
  gold int not null default 0,
  hp int not null default 50,
  max_hp int not null default 50,
  last_cron date not null default current_date,
  created_at timestamptz not null default now()
);

-- 2. Tâches : habitudes, quotidiennes, to-do, récompenses
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('habit', 'daily', 'todo', 'reward')),
  title text not null,
  notes text default '',
  difficulty text not null default 'facile' check (difficulty in ('trivial','facile','moyen','difficile')),
  -- habitudes : autorise le clic positif / négatif
  positive boolean not null default true,
  negative boolean not null default false,
  -- quotidiennes / to-do
  completed boolean not null default false,
  streak int not null default 0,
  active boolean not null default true,
  due_date date,
  -- récompenses
  cost int,
  -- suivi
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_type_idx on tasks (user_id, type);

-- 3. Row Level Security : chacun ne voit / modifie que ses propres données
alter table player_stats enable row level security;
alter table tasks enable row level security;

create policy "player_stats: lecture propre" on player_stats
  for select using (auth.uid() = user_id);
create policy "player_stats: écriture propre" on player_stats
  for insert with check (auth.uid() = user_id);
create policy "player_stats: mise à jour propre" on player_stats
  for update using (auth.uid() = user_id);

create policy "tasks: lecture propre" on tasks
  for select using (auth.uid() = user_id);
create policy "tasks: écriture propre" on tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks: mise à jour propre" on tasks
  for update using (auth.uid() = user_id);
create policy "tasks: suppression propre" on tasks
  for delete using (auth.uid() = user_id);

-- 4. Création automatique d'une fiche joueur à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.player_stats (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
