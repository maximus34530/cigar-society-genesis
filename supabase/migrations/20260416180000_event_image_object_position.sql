-- Focal point for event hero images (CSS object-position, e.g. "50% 35%")
alter table public.events
  add column if not exists image_object_position text;

comment on column public.events.image_object_position is 'CSS object-position for event images (home + events cards), e.g. 50% 35%.';
