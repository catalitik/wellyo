create table if not exists public.body_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_year integer not null check (birth_year between 1900 and extract(year from current_date)),
  sex text not null check (sex in ('female', 'male', 'other')),
  height_cm numeric(5,2) not null check (height_cm between 100 and 250),
  starting_weight_kg numeric(5,2) not null check (starting_weight_kg between 25 and 350),
  activity_level text not null check (activity_level in ('low', 'moderate', 'high')),
  updated_at timestamptz not null default now()
);
alter table public.body_profiles enable row level security;
create policy "users manage own body profile" on public.body_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
