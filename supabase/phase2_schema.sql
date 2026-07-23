-- =============================================================
-- Phase 2 · 社媒平台 API 自动同步  附加表
-- 在跑完 schema.sql 之后再执行本文件
-- =============================================================

-- 给账号 / 竞品加上「平台账号ID」和「主页链接」，供 API 抓取用
alter table public.accounts    add column if not exists external_id text;  -- 如 YouTube channelId
alter table public.accounts    add column if not exists profile_url text;
alter table public.accounts    add column if not exists last_synced_at timestamptz;

alter table public.competitors add column if not exists external_id text;
alter table public.competitors add column if not exists profile_url text;
alter table public.competitors add column if not exists last_synced_at timestamptz;

-- ---------- 指标快照（时间序列，画趋势用） ----------
create table if not exists public.metric_snapshots (
  id bigint generated always as identity primary key,
  subject_type text not null,          -- 'account' | 'competitor'
  subject_id uuid not null,
  platform text,
  captured_at date not null default current_date,
  followers bigint,
  posts_count bigint,
  views bigint,
  likes bigint,
  engagement numeric,
  created_at timestamptz not null default now(),
  unique (subject_type, subject_id, captured_at)
);
create index if not exists idx_snap_subject on public.metric_snapshots(subject_type, subject_id, captured_at);

-- ---------- 同步日志 ----------
create table if not exists public.sync_logs (
  id bigint generated always as identity primary key,
  platform text not null,              -- youtube | instagram | tiktok
  scope text,                          -- accounts | competitors
  status text not null,                -- success | partial | error
  processed int default 0,
  failed int default 0,
  message text,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
do $$
declare t text;
begin
  foreach t in array array['metric_snapshots','sync_logs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists auth_read on public.%I', t);
    execute format('create policy auth_read on public.%I for select to authenticated using (true)', t);
    -- 写入由 Edge Function 用 service_role 完成（绕过 RLS），前端只读
  end loop;
end $$;
