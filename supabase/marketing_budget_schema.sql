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

create table if not exists public.marketing_budget_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.marketing_budget_categories(id) on delete cascade,
  item_name text not null,
  q1_budget numeric(14,2) not null default 0 check (q1_budget >= 0),
  q2_budget numeric(14,2) not null default 0 check (q2_budget >= 0),
  q3_budget numeric(14,2) not null default 0 check (q3_budget >= 0),
  q4_budget numeric(14,2) not null default 0 check (q4_budget >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, item_name)
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

drop trigger if exists trg_marketing_budget_items_touch on public.marketing_budget_items;
create trigger trg_marketing_budget_items_touch before update on public.marketing_budget_items
for each row execute function public.touch_updated_at();

alter table public.marketing_budget_categories enable row level security;
alter table public.marketing_expenses enable row level security;
alter table public.marketing_budget_items enable row level security;

drop policy if exists marketing_budget_auth_all on public.marketing_budget_categories;
create policy marketing_budget_auth_all on public.marketing_budget_categories
for all to authenticated using (true) with check (true);

drop policy if exists marketing_expenses_auth_all on public.marketing_expenses;
create policy marketing_expenses_auth_all on public.marketing_expenses
for all to authenticated using (true) with check (true);

drop policy if exists marketing_budget_items_auth_all on public.marketing_budget_items;
create policy marketing_budget_items_auth_all on public.marketing_budget_items
for all to authenticated using (true) with check (true);

insert into public.marketing_budget_categories
  (year, code, name, q1_budget, q2_budget, q3_budget, q4_budget, sort_order)
values
  (2027, 'exhibitions', '三场专业门窗展', 350000, 700000, 300000, 450000, 10),
  (2027, 'ads', '线上广告投放及支付费用', 150000, 250000, 300000, 300000, 20),
  (2027, 'channel_support', '代理商展示门样、运输及渠道支持', 80000, 120000, 180000, 220000, 30),
  (2027, 'salons', '行业协会线下沙龙及筹备', 30000, 50000, 100000, 120000, 40),
  (2027, 'website', '官网年费、服务器及运营工具', 60000, 50000, 45000, 45000, 50),
  (2027, 'video', '企业宣传片实拍及多语版本', 120000, 180000, 150000, 50000, 60),
  (2027, 'ai_tool', 'AI选门工具接口、云资源及测试', 60000, 90000, 60000, 40000, 70),
  (2027, 'research', '市场数据购买、访谈及渠道核验', 60000, 40000, 30000, 20000, 80),
  (2027, 'reserve', '总体预备金', 50000, 50000, 50000, 50000, 90)
on conflict (year, code) do update set
  name = excluded.name,
  q1_budget = excluded.q1_budget,
  q2_budget = excluded.q2_budget,
  q3_budget = excluded.q3_budget,
  q4_budget = excluded.q4_budget,
  sort_order = excluded.sort_order;

with item_seed(code, item_name, q1, q2, q3, q4, sort_order) as (values
  ('exhibitions','展位租赁、注册及基础管理费',24,0,10,5,10),
  ('exhibitions','展台搭建、承重、灯光及拆除',7,21,5,12,20),
  ('exhibitions','展示门样、演示装置及出口包装',4,5,5,0,30),
  ('exhibitions','国际运输、清关、搬运及仓储',0,15,5,10,40),
  ('exhibitions','人员差旅及当地交通',0,20.2,0,10.7,50),
  ('exhibitions','当地翻译及现场协助',0,2,3,3,60),
  ('exhibitions','电力、网络、清洁、保险及印刷',0,4,0,2,70),
  ('exhibitions','税费及附加费',0,2.8,2,2.3,80),
  ('ads','Google 搜索广告',8,12,15,15,10),
  ('ads','Facebook、Instagram 广告',4,8,9,9,20),
  ('ads','YouTube 视频广告',1,2,3,4,30),
  ('ads','再营销广告',1,2,2,1,40),
  ('ads','广告支付、汇兑及不可抵扣税费',1,1,1,1,50),
  ('channel_support','渠道展示门样及五金配置',3,4,5,6,10),
  ('channel_support','样品包装、国际运输及清关',1.5,2.5,3.5,4.5,20),
  ('channel_support','门店展示架、品牌标识及安装',1,2,3,4,30),
  ('channel_support','渠道拜访差旅',1.5,2,4,4.5,40),
  ('channel_support','产品培训、翻译及场地',0.5,1,1.5,2,50),
  ('channel_support','产品册、选材板及快递',0.5,0.5,1,1,60),
  ('salons','协会合作及定向邀约',2,1,1.5,1.5,10),
  ('salons','场地、音响、屏幕及现场设备',0,1,3,2,20),
  ('salons','茶歇、餐饮及接待',0,0,2,4,30),
  ('salons','当地翻译及主持',0,0.5,1,1.5,40),
  ('salons','活动人员专项差旅',0.5,1.5,2,2,50),
  ('salons','展示件运输、布置及印刷',0.5,1,0.5,1,60),
  ('website','官网服务器、数据库及备份',1.5,1.5,1.75,1.75,10),
  ('website','官网年费、域名及授权续费',2,0,0,0,20),
  ('website','CDN、对象存储及视频流量',0.5,1.5,1,1,30),
  ('website','安全防护、监测及恢复服务',0.75,0.75,0.75,0.75,40),
  ('website','SEO、网站分析及工具订阅',0.75,0.75,0.75,0.75,50),
  ('website','邮件发送及询盘通知',0.5,0.5,0.25,0.25,60),
  ('video','海外表达策划、导演及脚本',5,1,0,0,10),
  ('video','摄影团队、灯光、器材及拍摄',3,10,5,0,20),
  ('video','演员、场景及美术布置',1,3,2,0,30),
  ('video','剪辑、调色、声音及特效',1,2,5,2,40),
  ('video','多语配音及母语审校',0,1,2,2,50),
  ('video','音乐、素材及肖像授权',1,1,0,0,60),
  ('video','广告尺寸适配及补剪',1,0,1,1,70),
  ('ai_tool','模型、图片处理及 OCR 接口',1,2,2,2,10),
  ('ai_tool','云资源、存储及流量',0.5,1,1,1.5,20),
  ('ai_tool','兼容性、性能及安全测试',0.5,2,1,0.5,30),
  ('ai_tool','用户访谈及测试激励',2,1.5,0.5,0,40),
  ('ai_tool','隐私条款及用户协议审阅',1,1,0,0,50),
  ('ai_tool','开发者账户、通知及插件',1,0.5,0.5,0,60),
  ('ai_tool','渠道试用培训及演示',0,1,1,0,70),
  ('research','海关贸易数据及企业资料',2.5,1,0.5,0,10),
  ('research','渠道访谈、口译及信息核验',1,1,1,1,20),
  ('research','重点市场实地核验差旅',1.5,1.5,1,1,30),
  ('research','企业信用、登记及付款风险查询',1,0.5,0.5,0,40),
  ('reserve','汇率及跨境付款成本超支',1,1,1,2,10),
  ('reserve','机票、住宿价格超支',1,2,1,1,20),
  ('reserve','运输、税费及样品补寄超支',2,1,1,1,30),
  ('reserve','应急修复或有效项目追加测试',1,1,2,1,40)
)
insert into public.marketing_budget_items (category_id, item_name, q1_budget, q2_budget, q3_budget, q4_budget, sort_order)
select c.id, s.item_name, s.q1 * 10000, s.q2 * 10000, s.q3 * 10000, s.q4 * 10000, s.sort_order
from item_seed s join public.marketing_budget_categories c on c.year = 2027 and c.code = s.code
on conflict (category_id, item_name) do update set
  q1_budget = excluded.q1_budget, q2_budget = excluded.q2_budget,
  q3_budget = excluded.q3_budget, q4_budget = excluded.q4_budget,
  sort_order = excluded.sort_order;

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

