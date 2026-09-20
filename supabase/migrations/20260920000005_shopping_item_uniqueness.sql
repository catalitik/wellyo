alter table public.shopping_list_items add constraint shopping_list_items_unique_name unique (list_id, name);
