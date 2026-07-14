-- Adds non-privileged role for new Auth signups.
-- Must be committed in its own migration before use (Postgres enum rule).

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'SEM_ACESSO';
