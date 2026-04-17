-- Add personal info fields for Manage Account page
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text;

comment on column public.profiles.first_name is 'User first name (app profile).';
comment on column public.profiles.last_name is 'User last name (app profile).';
comment on column public.profiles.phone is 'User phone number stored in E.164-like format when possible.';

