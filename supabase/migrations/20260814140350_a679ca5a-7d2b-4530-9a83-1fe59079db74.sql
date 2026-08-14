ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS profile_type text NOT NULL DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS primary_cta text NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS primary_cta_label text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS primary_cta_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS offer_mode text NOT NULL DEFAULT 'both';

CREATE TABLE IF NOT EXISTS public.card_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  cta_label text NOT NULL DEFAULT '',
  cta_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.card_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_services TO authenticated;
GRANT ALL ON public.card_services TO service_role;

ALTER TABLE public.card_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_public_read" ON public.card_services
  FOR SELECT TO anon, authenticated USING (public.card_is_published(card_id));

CREATE POLICY "services_owner_all" ON public.card_services
  FOR ALL TO authenticated USING (public.owns_card(card_id)) WITH CHECK (public.owns_card(card_id));

CREATE POLICY "services_admin_all" ON public.card_services
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER card_services_set_updated_at BEFORE UPDATE ON public.card_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS card_services_card_id_idx ON public.card_services(card_id, sort_order);