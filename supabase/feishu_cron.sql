-- =============================================================
-- 飞书日报定时任务：每天 09:00（北京时间 = 01:00 UTC）
-- 依赖 pg_cron + pg_net 扩展；调用 feishu-daily-report Edge Function
-- Webhook 与 token 存在 app_config 表（前端读不到）
-- =============================================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- app_config：存飞书 webhook 与调用 token（仅 service_role 可读）
create table if not exists public.app_config (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
alter table public.app_config enable row level security;

-- 配置（示例；实际值请在 SQL Editor 里替换）
-- insert into public.app_config(key,value) values
--   ('feishu_webhook','https://open.feishu.cn/open-apis/bot/v2/hook/xxxx'),
--   ('feishu_cron_token', replace(gen_random_uuid()::text,'-',''))
-- on conflict (key) do update set value = excluded.value;

-- 每天 09:00 北京时间发送日报
select cron.unschedule('feishu-daily-report')
  where exists (select 1 from cron.job where jobname = 'feishu-daily-report');

select cron.schedule(
  'feishu-daily-report', '0 1 * * *',
  $$
  select net.http_post(
    url := 'https://grogrigybgimvuuunxef.supabase.co/functions/v1/feishu-daily-report?token=<CRON_TOKEN>',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- 手动测试：浏览器/命令行 GET
--   https://grogrigybgimvuuunxef.supabase.co/functions/v1/feishu-daily-report?token=<CRON_TOKEN>
-- 查看任务： select * from cron.job where jobname='feishu-daily-report';
-- 取消任务： select cron.unschedule('feishu-daily-report');
