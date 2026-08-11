-- Remove blanket PUBLIC execute rights on all SECURITY DEFINER helpers
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.owns_card(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.card_is_published(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_card_view(text) FROM PUBLIC, anon, authenticated;

-- Re-grant only what the RLS policies and app flows actually require
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_card(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.card_is_published(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_card_view(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;