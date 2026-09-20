create table if not exists public.food_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  diet text not null default 'omnivore' check (diet in ('omnivore','vegetarian','vegan','pescatarian')),
  allergies text[] not null default '{}',
  excluded_foods text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.food_preferences enable row level security;
create policy "users manage own food preferences" on public.food_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
