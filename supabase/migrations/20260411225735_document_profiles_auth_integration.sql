-- Applied via Supabase MCP (document_profiles_auth_integration); keeps remote + repo in sync.
comment on table public.profiles is 'App profile: id matches auth.users. Created via on_auth_user_created trigger. OAuth and email/password users both get a row when the trigger runs.';
