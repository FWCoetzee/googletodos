CREATE TABLE public.rate_limit_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_key text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_events_key_action_time ON public.rate_limit_events (event_key, action, created_at);

GRANT ALL ON public.rate_limit_events TO service_role;

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_event_key text, p_action text, p_limit integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.rate_limit_events
  WHERE created_at < now() - interval '1 day';

  SELECT count(*) INTO v_count
  FROM public.rate_limit_events
  WHERE event_key = p_event_key
    AND action = p_action
    AND created_at > now() - make_interval(secs => p_window_seconds);

  IF v_count >= p_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_events (event_key, action) VALUES (p_event_key, p_action);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_todo_insert_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.user_id::text, 'todo_create', 30, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: you can create at most 30 tasks per hour. Please try again later.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER todos_insert_rate_limit
BEFORE INSERT ON public.todos
FOR EACH ROW EXECUTE FUNCTION public.enforce_todo_insert_rate_limit();