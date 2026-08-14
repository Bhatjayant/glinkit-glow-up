ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS booking_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS booking_duration integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS booking_slots text NOT NULL DEFAULT '10:00,11:00,12:00,15:00,16:00,17:00';

CREATE TABLE IF NOT EXISTS public.card_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  purpose text NOT NULL DEFAULT '',
  slot_date date NOT NULL,
  slot_time text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.card_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_bookings TO authenticated;
GRANT ALL ON public.card_bookings TO service_role;

ALTER TABLE public.card_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_public_insert" ON public.card_bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.card_is_published(card_id));

CREATE POLICY "bookings_owner_read" ON public.card_bookings
  FOR SELECT TO authenticated
  USING (public.owns_card(card_id));

CREATE POLICY "bookings_owner_update" ON public.card_bookings
  FOR UPDATE TO authenticated
  USING (public.owns_card(card_id))
  WITH CHECK (public.owns_card(card_id));

CREATE POLICY "bookings_owner_delete" ON public.card_bookings
  FOR DELETE TO authenticated
  USING (public.owns_card(card_id));

CREATE POLICY "bookings_admin_all" ON public.card_bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS card_bookings_card_idx ON public.card_bookings (card_id, slot_date);

CREATE TRIGGER card_bookings_set_updated_at
  BEFORE UPDATE ON public.card_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();