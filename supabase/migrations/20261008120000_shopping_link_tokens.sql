-- Secret per-household token that lets other apps (HabitQuest, iPhone widget,
-- Apple Watch shortcut) add to and read the shopping list without a login.
create table if not exists public.shopping_link_tokens (
  household_id bigint primary key references public.households(id) on delete cascade,
  token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now()
);

alter table public.shopping_link_tokens enable row level security;
-- No policies: the table is only reachable through the functions below.

create or replace function public.get_shopping_link_token(p_regenerate boolean default false)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_household_id bigint;
  v_token text;
begin
  select household_id into v_household_id
  from household_members
  where user_id = auth.uid()
  order by created_at desc
  limit 1;

  if v_household_id is null then
    raise exception 'Not a member of any household';
  end if;

  if p_regenerate then
    delete from shopping_link_tokens where household_id = v_household_id;
  end if;

  insert into shopping_link_tokens (household_id)
  values (v_household_id)
  on conflict (household_id) do nothing;

  select token into v_token from shopping_link_tokens where household_id = v_household_id;
  return v_token;
end;
$$;

create or replace function public.add_shopping_item_by_token(p_token text, p_name text, p_quantity text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id bigint;
  v_name text := left(btrim(coalesce(p_name, '')), 200);
begin
  select household_id into v_household_id from shopping_link_tokens where token = p_token;

  if v_household_id is null then
    raise exception 'Invalid token';
  end if;

  if v_name = '' then
    return false;
  end if;

  -- Skip if the same item is already on the list and not ticked off.
  if exists (
    select 1 from shopping_items
    where household_id = v_household_id
      and not is_checked
      and lower(name) = lower(v_name)
  ) then
    return false;
  end if;

  insert into shopping_items (household_id, name, quantity, is_checked)
  values (v_household_id, v_name, nullif(left(btrim(coalesce(p_quantity, '')), 100), ''), false);

  return true;
end;
$$;

create or replace function public.get_shopping_items_by_token(p_token text)
returns table (id bigint, name text, quantity text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id bigint;
begin
  select household_id into v_household_id from shopping_link_tokens where token = p_token;

  if v_household_id is null then
    raise exception 'Invalid token';
  end if;

  return query
    select s.id, s.name, s.quantity
    from shopping_items s
    where s.household_id = v_household_id and not s.is_checked
    order by s.created_at asc;
end;
$$;

revoke all on function public.get_shopping_link_token(boolean) from public, anon;
grant execute on function public.get_shopping_link_token(boolean) to authenticated;

revoke all on function public.add_shopping_item_by_token(text, text, text) from public;
grant execute on function public.add_shopping_item_by_token(text, text, text) to anon, authenticated;

revoke all on function public.get_shopping_items_by_token(text) from public;
grant execute on function public.get_shopping_items_by_token(text) to anon, authenticated;
