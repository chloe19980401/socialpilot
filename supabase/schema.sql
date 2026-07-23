-- =============================================================
-- SocialPilot AI · 社媒管理系统  数据库结构
-- 在新的 Supabase 项目中执行：SQL Editor → 粘贴本文件 → Run
-- 全部为空表，登录后从界面录入数据即可
-- =============================================================

-- ---------- 用户资料（关联 auth.users） ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text not null default 'operator',      -- admin | operator
  created_at timestamptz not null default now()
);

-- 新用户注册 / 被管理员创建时自动生成 profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, split_part(new.email, '@', 1), 'operator')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 品牌 ----------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  color text default '#3b6ef6',
  created_at timestamptz not null default now()
);

create table if not exists public.brand_socials (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  platform text not null,          -- instagram | youtube | facebook | tiktok | twitter | linkedin
  url text
);

-- ---------- 社媒账号 ----------
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  platform text not null,
  handle text,
  display_name text,
  followers bigint default 0,
  connected boolean default false,
  created_at timestamptz not null default now()
);

-- ---------- 帖子 / 发布记录 ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  operator_email text,
  operator_name text,
  platform text,
  title text,
  thumbnail_url text,
  content text,
  published_at timestamptz,
  likes bigint default 0,
  views bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  saves bigint default 0,
  status text default 'published',   -- draft | scheduled | published
  created_at timestamptz not null default now()
);

-- ---------- KOL 红人 ----------
create table if not exists public.kols (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  platform text,
  handle text,
  product text,
  followers text,
  status text default 'unpublished',  -- published | unpublished
  free_swap boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.kol_alpha_reviews (
  id uuid primary key default gen_random_uuid(),
  kol_name text,
  product text,
  status text,
  created_at timestamptz not null default now()
);

-- ---------- 竞品 ----------
create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_name text,
  platform text,
  handle text,
  followers bigint default 0,
  posts_count int,
  engagement text,
  created_at timestamptz not null default now()
);

-- ---------- 自建站电商 ----------
create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  order_date date,
  amount numeric default 0,
  refund_amount numeric default 0,
  product_cost numeric default 0,
  is_new_customer boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_costs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  product text,
  cost numeric default 0,
  price numeric default 0
);

create table if not exists public.marketing_spend (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  date date,
  amount numeric default 0,
  channel text
);

-- ---------- KPI 绩效 ----------
create table if not exists public.kpi_goals (
  id uuid primary key default gen_random_uuid(),
  operator_email text,
  operator_name text,
  period text,          -- month | quarter | year
  metric text,
  target numeric default 0,
  actual numeric default 0,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 行级安全 (RLS)：仅登录用户可读写（团队内部工具）
-- =============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','brands','brand_socials','accounts','posts','kols',
    'kol_alpha_reviews','competitors','store_orders','product_costs',
    'marketing_spend','kpi_goals'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists auth_all on public.%I', t);
    execute format(
      'create policy auth_all on public.%I for all to authenticated using (true) with check (true)', t
    );
  end loop;
end $$;
