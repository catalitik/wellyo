create type public.meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 160),
  source text not null default 'manual',
  source_id text,
  kcal_per_100g numeric(8,2),
  protein_per_100g numeric(8,2),
  carbs_per_100g numeric(8,2),
  fat_per_100g numeric(8,2),
  fiber_per_100g numeric(8,2),
  created_at timestamptz not null default now(),
  constraint foods_nutrients_nonnegative check (
    coalesce(kcal_per_100g, 0) >= 0 and coalesce(protein_per_100g, 0) >= 0 and
    coalesce(carbs_per_100g, 0) >= 0 and coalesce(fat_per_100g, 0) >= 0 and coalesce(fiber_per_100g, 0) >= 0
  )
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null default current_date,
  meal_type public.meal_type not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, meal_date, meal_type)
);

create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  food_id uuid references public.foods(id) on delete set null,
  food_name text not null,
  quantity numeric(8,2) not null default 1 check (quantity > 0),
  unit text not null default 'g',
  grams numeric(8,2) not null check (grams > 0),
  kcal numeric(8,2), protein numeric(8,2), carbs numeric(8,2), fat numeric(8,2), fiber numeric(8,2),
  created_at timestamptz not null default now()
);

create table public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  created_at timestamptz not null default now()
);

create index meals_user_date_idx on public.meals(user_id, meal_date desc);
create index meal_items_meal_idx on public.meal_items(meal_id);
create index foods_owner_name_idx on public.foods(owner_user_id, name);

alter table public.foods enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.saved_meals enable row level security;

create policy "shared foods are readable" on public.foods for select using (owner_user_id is null or owner_user_id = auth.uid());
create policy "users manage own foods" on public.foods for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy "users manage own meals" on public.meals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own meal items" on public.meal_items for all using (
  exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
) with check (
  exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
);
create policy "users manage own saved meals" on public.saved_meals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
