-- ============ CARDS: identity + builder + booking config ============
alter table public.cards
  add column if not exists headline text not null default '',
  add column if not exists short_bio text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists section_order jsonb not null default '[]'::jsonb,
  add column if not exists timezone text not null default 'Asia/Kolkata';

-- ============ PROFILES: plan entitlements ============
alter table public.profiles
  add column if not exists plan text not null default 'free';

-- ============ LEADS -> CRM ============
alter table public.card_leads
  add column if not exists company text not null default '',
  add column if not exists designation text not null default '',
  add column if not exists interest text not null default 'general',
  add column if not exists source text not null default 'direct',
  add column if not exists status text not null default 'new',
  add column if not exists notes text not null default '',
  add column if not exists follow_up_date date,
  add column if not exists archived boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.card_leads
  drop constraint if exists card_leads_status_check;
alter table public.card_leads
  add constraint card_leads_status_check
  check (status in ('new','contacted','qualified','won','lost'));

alter table public.card_leads
  drop constraint if exists card_leads_interest_check;
alter table public.card_leads
  add constraint card_leads_interest_check
  check (interest in ('partnership','investment','purchase','distribution','services','employment','general'));

create index if not exists card_leads_card_created_idx
  on public.card_leads (card_id, created_at desc);

drop trigger if exists card_leads_set_updated_at on public.card_leads;
create trigger card_leads_set_updated_at
  before update on public.card_leads
  for each row execute function public.set_updated_at();

-- owners must be able to update leads (status / notes / follow-up)
drop policy if exists leads_owner_update on public.card_leads;
create policy leads_owner_update on public.card_leads
  for update to authenticated
  using (public.owns_card(card_id))
  with check (public.owns_card(card_id));

-- ============ ANALYTICS EVENTS ============
create table if not exists public.card_events (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  event_type text not null,
  source text not null default 'direct',
  label text not null default '',
  created_at timestamptz not null default now()
);

alter table public.card_events
  drop constraint if exists card_events_type_check;
alter table public.card_events
  add constraint card_events_type_check check (event_type in (
    'view','save_contact','connect','whatsapp','call','email','website',
    'social','product_view','product_click','booking','payment','qr','share','document'
  ));

alter table public.card_events
  drop constraint if exists card_events_source_check;
alter table public.card_events
  add constraint card_events_source_check check (source in (
    'qr','whatsapp','linkedin','instagram','facebook','website','nfc','email','event','direct','other'
  ));

grant select, insert on public.card_events to authenticated;
grant insert on public.card_events to anon;
grant all on public.card_events to service_role;

alter table public.card_events enable row level security;

create policy events_public_insert on public.card_events
  for insert to anon, authenticated
  with check (public.card_is_published(card_id));

create policy events_owner_read on public.card_events
  for select to authenticated
  using (public.owns_card(card_id));

create policy events_admin_all on public.card_events
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index if not exists card_events_card_created_idx
  on public.card_events (card_id, created_at desc);
create index if not exists card_events_card_type_idx
  on public.card_events (card_id, event_type);

-- ============ BOOKING RELIABILITY ============
alter table public.card_bookings
  drop constraint if exists card_bookings_status_check;
alter table public.card_bookings
  add constraint card_bookings_status_check
  check (status in ('pending','confirmed','declined','cancelled'));

-- no double booking of the same active slot
create unique index if not exists card_bookings_unique_active_slot
  on public.card_bookings (card_id, slot_date, slot_time)
  where status in ('pending','confirmed');

create table if not exists public.card_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  blocked_date date not null,
  created_at timestamptz not null default now(),
  unique (card_id, blocked_date)
);

grant select, insert, delete on public.card_blocked_dates to authenticated;
grant all on public.card_blocked_dates to service_role;
alter table public.card_blocked_dates enable row level security;

create policy blocked_owner_all on public.card_blocked_dates
  for all to authenticated
  using (public.owns_card(card_id))
  with check (public.owns_card(card_id));

create policy blocked_admin_all on public.card_blocked_dates
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- safe slot availability lookup for visitors (no booking details exposed)
create or replace function public.card_taken_slots(_card_id uuid, _date date)
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select b.slot_time
  from public.card_bookings b
  join public.cards c on c.id = b.card_id
  where b.card_id = _card_id
    and c.published
    and b.slot_date = _date
    and b.status in ('pending','confirmed')
$$;

revoke all on function public.card_taken_slots(uuid, date) from public;
grant execute on function public.card_taken_slots(uuid, date) to anon, authenticated;

create or replace function public.card_blocked_days(_card_id uuid)
returns setof date
language sql
stable
security definer
set search_path = public
as $$
  select d.blocked_date
  from public.card_blocked_dates d
  join public.cards c on c.id = d.card_id
  where d.card_id = _card_id and c.published and d.blocked_date >= current_date
$$;

revoke all on function public.card_blocked_days(uuid) from public;
grant execute on function public.card_blocked_days(uuid) to anon, authenticated;

-- ============ ANTI-SPAM: validate + rate limit public lead inserts ============
create or replace function public.card_leads_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare recent int;
begin
  new.name := left(btrim(coalesce(new.name,'')), 120);
  new.company := left(btrim(coalesce(new.company,'')), 120);
  new.designation := left(btrim(coalesce(new.designation,'')), 120);
  new.phone := left(btrim(coalesce(new.phone,'')), 20);
  new.email := left(btrim(coalesce(new.email,'')), 160);
  new.message := left(btrim(coalesce(new.message,'')), 1500);

  if new.name = '' then
    raise exception 'Please enter your name';
  end if;
  if new.phone = '' and new.email = '' then
    raise exception 'Please enter a phone number or email';
  end if;

  select count(*) into recent
  from public.card_leads l
  where l.card_id = new.card_id
    and l.created_at > now() - interval '2 minutes'
    and (
      (new.phone <> '' and l.phone = new.phone)
      or (new.email <> '' and l.email = new.email)
    );
  if recent > 0 then
    raise exception 'We already received your details — thank you!';
  end if;

  return new;
end;
$$;

drop trigger if exists card_leads_guard_trg on public.card_leads;
create trigger card_leads_guard_trg
  before insert on public.card_leads
  for each row execute function public.card_leads_guard();

create or replace function public.card_bookings_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.name := left(btrim(coalesce(new.name,'')), 120);
  new.phone := left(btrim(coalesce(new.phone,'')), 20);
  new.email := left(btrim(coalesce(new.email,'')), 160);
  new.purpose := left(btrim(coalesce(new.purpose,'')), 800);

  if new.name = '' then
    raise exception 'Please enter your name';
  end if;
  if new.slot_date < current_date then
    raise exception 'Please pick a future date';
  end if;
  if exists (
    select 1 from public.card_blocked_dates d
    where d.card_id = new.card_id and d.blocked_date = new.slot_date
  ) then
    raise exception 'That date is not available';
  end if;
  return new;
end;
$$;

drop trigger if exists card_bookings_guard_trg on public.card_bookings;
create trigger card_bookings_guard_trg
  before insert on public.card_bookings
  for each row execute function public.card_bookings_guard();