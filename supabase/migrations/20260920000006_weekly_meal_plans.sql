create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);
create table if not exists public.weekly_plan_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  plan_date date not null,
  meal_type public.meal_type not null,
  title text not null,
  foods jsonb not null default '[]'::jsonb,
  grams jsonb not null default '{}'::jsonb,
  kcal numeric(8,2),
  created_at timestamptz not null default now(),
  unique (plan_id, plan_date, meal_type)
);
alter table public.weekly_plans enable row level security;
alter table public.weekly_plan_meals enable row level security;
create policy "users manage own weekly plans" on public.weekly_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own planned meals" on public.weekly_plan_meals for all using (exists (select 1 from public.weekly_plans p where p.id = plan_id and p.user_id = auth.uid())) with check (exists (select 1 from public.weekly_plans p where p.id = plan_id and p.user_id = auth.uid()));
