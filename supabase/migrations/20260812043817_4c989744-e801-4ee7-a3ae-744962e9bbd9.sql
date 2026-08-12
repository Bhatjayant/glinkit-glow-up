ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'dark';
ALTER TABLE public.cards ADD CONSTRAINT cards_theme_check CHECK (theme IN ('dark','light'));