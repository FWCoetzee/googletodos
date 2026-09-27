REVOKE ALL ON FUNCTION public.enforce_todo_insert_rate_limit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_todo_insert_rate_limit() TO service_role;