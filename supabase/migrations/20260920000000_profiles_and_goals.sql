create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_unit_system text not null default 'metric' check (preferred_unit_system in ('metric')),
  timezone text not null default 'Europe/Madrid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_goals (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  starts_on date not null default current_date,
  ends_on date,
  calorie_target integer check (calorie_target is null or calorie_target > 0),
  protein_target numeric(8,2) check (protein_target is null or protein_target >= 0),
  carbohydrate_target numeric(8,2) check (carbohydrate_target is null or carbohydrate_target >= 0),
  fat_target numeric(8,2) check (fat_target is null or fat_target >= 0),
  created_at timestamptz not null default now(),
  constraint valid_goal_period check (ends_on is null or ends_on >= starts_on)
);

alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
create policy "Users can read their profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert their profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can manage their goals" on public.user_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', '')); return new; end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
