-- =============================================================
-- SocialPilot AI · 排期系统  数据库结构
-- 独立的「发布规划」表，带审批流程。发布后可选择性关联到 posts。
-- 在 Supabase 项目执行：SQL Editor → 粘贴本文件 → Run
-- =============================================================

create table if not exists public.content_plans (
  id uuid primary key default gen_random_uuid(),

  -- 归属
  brand_id    uuid references public.brands(id)   on delete set null,
  account_id  uuid references public.accounts(id) on delete set null,
  platforms   text[] default '{}',               -- 可多选：instagram | youtube | facebook | tiktok | twitter | linkedin
  platform    text,                              -- 兼容旧字段（存首个平台）

  -- 内容主体
  title         text,
  content       text,                            -- 文案
  thumbnail_url text,                            -- 配图链接
  asset_url     text,                            -- 素材/网盘链接
  content_type  text,                            -- image | video | reels | story | live | article
  tags          text[] default '{}',             -- 标签
  notes         text,                            -- 备注

  -- 负责与排期
  assignee_email text,                           -- 负责运营
  assignee_name  text,
  scheduled_at   timestamptz,                    -- 计划发布时间（精确到时分）

  -- 审批流程：draft(草稿) -> pending(待审核) -> approved(已通过) -> published(已发布)
  --           rejected(已驳回) 可从 pending 分支
  status      text not null default 'draft',
  review_note text,                              -- 审批意见
  reviewed_by text,                              -- 审批人邮箱
  reviewed_at timestamptz,

  -- 发布后关联（可选）
  post_id uuid references public.posts(id) on delete set null,

  -- 审计
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 常用索引
create index if not exists idx_content_plans_scheduled_at on public.content_plans (scheduled_at);
create index if not exists idx_content_plans_status       on public.content_plans (status);
create index if not exists idx_content_plans_brand        on public.content_plans (brand_id);

-- updated_at 自动维护
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_content_plans_touch on public.content_plans;
create trigger trg_content_plans_touch
  before update on public.content_plans
  for each row execute function public.touch_updated_at();

-- RLS：仅登录用户可读写（与现有表策略一致）
alter table public.content_plans enable row level security;
drop policy if exists auth_all on public.content_plans;
create policy auth_all on public.content_plans
  for all to authenticated using (true) with check (true);
