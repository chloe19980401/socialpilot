-- 2027 海外营销费用台账
-- 金额统一存人民币元，前端按元录入、按万元汇总展示。

create table if not exists public.marketing_budget_categories (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  code text not null,
  name text not null,
  q1_budget numeric(14,2) not null default 0 check (q1_budget >= 0),
  q2_budget numeric(14,2) not null default 0 check (q2_budget >= 0),
  q3_budget numeric(14,2) not null default 0 check (q3_budget >= 0),
  q4_budget numeric(14,2) not null default 0 check (q4_budget >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (year, code)
);

create table if not exists public.marketing_expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.marketing_budget_categories(id) on delete restrict,
  expense_date date not null default current_date,
  item text not null,
  amount numeric(14,2) not null check (amount >= 0),
  vendor text,
  payment_status text not null default 'paid' check (payment_status in ('paid', 'pending', 'reimbursing')),
  invoice_no text,
  owner text,
  receipt_url text,
  receipt_path text,
  receipt_name text,
  receipt_type text,
  receipt_size bigint check (receipt_size is null or receipt_size >= 0),
  buyer_name text,
  seller_name text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_budget_categories add column if not exists q1_budget numeric(14,2) not null default 0 check (q1_budget >= 0);
alter table public.marketing_expenses add column if not exists receipt_path text;
alter table public.marketing_expenses add column if not exists receipt_name text;
alter table public.marketing_expenses add column if not exists receipt_type text;
alter table public.marketing_expenses add column if not exists receipt_size bigint check (receipt_size is null or receipt_size >= 0);
alter table public.marketing_expenses add column if not exists buyer_name text;
alter table public.marketing_expenses add column if not exists seller_name text;

create index if not exists idx_marketing_expenses_date on public.marketing_expenses (expense_date desc);
create index if not exists idx_marketing_expenses_category on public.marketing_expenses (category_id);

drop trigger if exists trg_marketing_budget_categories_touch on public.marketing_budget_categories;
create trigger trg_marketing_budget_categories_touch before update on public.marketing_budget_categories
for each row execute function public.touch_updated_at();

drop trigger if exists trg_marketing_expenses_touch on public.marketing_expenses;
create trigger trg_marketing_expenses_touch before update on public.marketing_expenses
for each row execute function public.touch_updated_at();

alter table public.marketing_budget_categories enable row level security;
alter table public.marketing_expenses enable row level security;

drop policy if exists marketing_budget_auth_all on public.marketing_budget_categories;
create policy marketing_budget_auth_all on public.marketing_budget_categories
for all to authenticated using (true) with check (true);

drop policy if exists marketing_expenses_auth_all on public.marketing_expenses;
create policy marketing_expenses_auth_all on public.marketing_expenses
for all to authenticated using (true) with check (true);

insert into public.marketing_budget_categories
  (year, code, name, q1_budget, q2_budget, q3_budget, q4_budget, sort_order)
values
  (2027, 'exhibitions', '三场专业门窗展', 0, 1050000, 300000, 450000, 10),
  (2027, 'ads', '线上广告投放及支付费用', 0, 200000, 350000, 450000, 20),
  (2027, 'channel_support', '代理商展示门样、运输及渠道支持', 0, 100000, 200000, 300000, 30),
  (2027, 'salons', '行业协会线下沙龙及筹备', 0, 50000, 100000, 150000, 40),
  (2027, 'website', '官网年费、服务器及运营工具', 0, 80000, 60000, 60000, 50),
  (2027, 'video', '企业宣传片实拍及多语版本', 0, 200000, 250000, 50000, 60),
  (2027, 'ai_tool', 'AI选门工具接口、云资源及测试', 0, 50000, 120000, 80000, 70),
  (2027, 'research', '市场数据购买、访谈及渠道核验', 0, 70000, 50000, 30000, 80),
  (2027, 'reserve', '总体预备金', 0, 50000, 50000, 100000, 90)
on conflict (year, code) do nothing;

-- 发票、合同等凭证使用私有存储桶，只通过短时签名链接查看。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketing-documents',
  'marketing-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'marketing_documents_auth_select') then
    create policy marketing_documents_auth_select on storage.objects for select to authenticated using (bucket_id = 'marketing-documents');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'marketing_documents_auth_insert') then
    create policy marketing_documents_auth_insert on storage.objects for insert to authenticated with check (bucket_id = 'marketing-documents');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'marketing_documents_auth_update') then
    create policy marketing_documents_auth_update on storage.objects for update to authenticated using (bucket_id = 'marketing-documents') with check (bucket_id = 'marketing-documents');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'marketing_documents_auth_delete') then
    create policy marketing_documents_auth_delete on storage.objects for delete to authenticated using (bucket_id = 'marketing-documents');
  end if;
end $$;

