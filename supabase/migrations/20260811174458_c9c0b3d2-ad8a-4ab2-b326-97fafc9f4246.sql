-- roles
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "user_roles_select_own" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- cards
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  display_name text not null default '',
  job_title text not null default '',
  company text not null default '',
  tagline text not null default '',
  about text not null default '',
  photo_url text,
  logo_url text,
  phone text,
  whatsapp text,
  email text,
  website text,
  address text,
  maps_url text,
  upi_id text,
  bank_details text,
  published boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.cards to authenticated;
grant select on public.cards to anon;
grant all on public.cards to service_role;
alter table public.cards enable row level security;
create policy "cards_public_read" on public.cards for select to anon, authenticated using (published = true);
create policy "cards_owner_read" on public.cards for select to authenticated using (owner_id = auth.uid());
create policy "cards_owner_insert" on public.cards for insert to authenticated with check (owner_id = auth.uid());
create policy "cards_owner_update" on public.cards for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "cards_owner_delete" on public.cards for delete to authenticated using (owner_id = auth.uid());
create policy "cards_admin_all" on public.cards for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger cards_updated_at before update on public.cards for each row execute function public.set_updated_at();

create or replace function public.owns_card(_card_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cards c where c.id = _card_id and c.owner_id = auth.uid())
$$;
create or replace function public.card_is_published(_card_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cards c where c.id = _card_id and c.published)
$$;

create table public.card_products (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  name text not null default '',
  description text not null default '',
  image_url text,
  mrp numeric(12,2),
  offer_price numeric(12,2),
  allow_buy boolean not null default true,
  allow_enquiry boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.card_products to authenticated;
grant select on public.card_products to anon;
grant all on public.card_products to service_role;
alter table public.card_products enable row level security;
create policy "products_public_read" on public.card_products for select to anon, authenticated using (public.card_is_published(card_id));
create policy "products_owner_all" on public.card_products for all to authenticated using (public.owns_card(card_id)) with check (public.owns_card(card_id));
create policy "products_admin_all" on public.card_products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.card_media (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  kind text not null default 'image',
  url text not null,
  title text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.card_media to authenticated;
grant select on public.card_media to anon;
grant all on public.card_media to service_role;
alter table public.card_media enable row level security;
create policy "media_public_read" on public.card_media for select to anon, authenticated using (public.card_is_published(card_id));
create policy "media_owner_all" on public.card_media for all to authenticated using (public.owns_card(card_id)) with check (public.owns_card(card_id));
create policy "media_admin_all" on public.card_media for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.card_leads (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  message text not null default '',
  created_at timestamptz not null default now()
);
grant insert on public.card_leads to anon;
grant select, insert, delete on public.card_leads to authenticated;
grant all on public.card_leads to service_role;
alter table public.card_leads enable row level security;
create policy "leads_public_insert" on public.card_leads for insert to anon, authenticated with check (public.card_is_published(card_id));
create policy "leads_owner_read" on public.card_leads for select to authenticated using (public.owns_card(card_id));
create policy "leads_owner_delete" on public.card_leads for delete to authenticated using (public.owns_card(card_id));
create policy "leads_admin_all" on public.card_leads for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.increment_card_view(_slug text)
returns void language sql security definer set search_path = public as $$
  update public.cards set view_count = view_count + 1 where slug = _slug and published;
$$;
grant execute on function public.increment_card_view(text) to anon, authenticated;

create index card_products_card_idx on public.card_products(card_id);
create index card_media_card_idx on public.card_media(card_id);
create index card_leads_card_idx on public.card_leads(card_id);
