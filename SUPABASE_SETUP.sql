-- ===== RyozoGames Supabase Setup =====
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now()
);

-- 2. Game saves table
create table if not exists public.game_saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_id text not null,
  save_data jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id, game_id)
);

-- 3. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.game_saves enable row level security;

-- 4. RLS Policies for profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. RLS Policies for game_saves
create policy "Users can read own saves"
  on public.game_saves for select
  using (auth.uid() = user_id);

create policy "Users can insert own saves"
  on public.game_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can update own saves"
  on public.game_saves for update
  using (auth.uid() = user_id);

create policy "Users can upsert own saves"
  on public.game_saves for all
  using (auth.uid() = user_id);
