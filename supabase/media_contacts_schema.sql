-- 全球媒体目录的实际联络台账与私有 Media Kit 文件库。
create table if not exists public.media_outlet_contacts (
  outlet_id text primary key,
  outlet_name text not null,
  quoted_price numeric(14, 2),
  quoted_currency text not null default 'USD',
  quote_notes text,
  actual_contact_name text,
  actual_contact_role text,
  actual_contact_email text,
  actual_contact_phone text,
  contact_status text not null default 'not_contacted'
    check (contact_status in ('not_contacted', 'contacted', 'follow_up', 'negotiating', 'cooperated', 'declined')),
  last_contacted_at timestamptz,
  contact_notes text,
  media_kit_path text,
  media_kit_name text,
  media_kit_type text,
  media_kit_size bigint check (media_kit_size is null or media_kit_size >= 0),
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists media_outlet_contacts_touch_updated_at on public.media_outlet_contacts;
create trigger media_outlet_contacts_touch_updated_at
before update on public.media_outlet_contacts
for each row execute function public.touch_updated_at();

alter table public.media_outlet_contacts enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_outlet_contacts' and policyname = 'media_outlet_contacts_auth_all') then
    create policy media_outlet_contacts_auth_all on public.media_outlet_contacts
      for all to authenticated using (true) with check (true);
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media-kits',
  'media-kits',
  false,
  20971520,
  array[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_kits_auth_select') then
    create policy media_kits_auth_select on storage.objects for select to authenticated using (bucket_id = 'media-kits');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_kits_auth_insert') then
    create policy media_kits_auth_insert on storage.objects for insert to authenticated with check (bucket_id = 'media-kits');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_kits_auth_update') then
    create policy media_kits_auth_update on storage.objects for update to authenticated using (bucket_id = 'media-kits') with check (bucket_id = 'media-kits');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_kits_auth_delete') then
    create policy media_kits_auth_delete on storage.objects for delete to authenticated using (bucket_id = 'media-kits');
  end if;
end $$;
