create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);
create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  name text not null,
  category text not null,
  amount text not null,
  checked boolean not null default false
);
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
create policy "users manage own shopping lists" on public.shopping_lists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own shopping items" on public.shopping_list_items for all using (exists (select 1 from public.shopping_lists l where l.id = list_id and l.user_id = auth.uid())) with check (exists (select 1 from public.shopping_lists l where l.id = list_id and l.user_id = auth.uid()));
