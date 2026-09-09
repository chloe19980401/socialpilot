-- SocialPilot AI · 平台发布任务与日志
create table if not exists public.publication_jobs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.content_plans(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  platform text not null check (platform in ('facebook', 'instagram', 'tiktok', 'youtube')),
  status text not null default 'queued'
    check (status in ('queued', 'publishing', 'processing', 'published', 'failed', 'blocked', 'cancelled')),
  scheduled_at timestamptz,
  external_id text,
  published_url text,
  error_message text,
  response_data jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  requested_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, account_id)
);

create index if not exists idx_publication_jobs_due
  on public.publication_jobs (status, scheduled_at);
create index if not exists idx_publication_jobs_plan
  on public.publication_jobs (plan_id);

drop trigger if exists trg_publication_jobs_touch on public.publication_jobs;
create trigger trg_publication_jobs_touch
  before update on public.publication_jobs
  for each row execute function public.touch_updated_at();

alter table public.publication_jobs enable row level security;
drop policy if exists publication_jobs_read on public.publication_jobs;
create policy publication_jobs_read on public.publication_jobs
  for select to authenticated using (true);

-- 写入只能通过校验登录身份与排期归属的 Edge Function 完成。
revoke insert, update, delete on public.publication_jobs from anon, authenticated;
grant select on public.publication_jobs to authenticated;

