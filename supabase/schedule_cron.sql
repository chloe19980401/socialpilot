-- =============================================================
-- 定时自动同步（每天拉一次各平台数据）
-- 依赖 Supabase 的 pg_cron + pg_net 扩展（Dashboard → Database → Extensions 开启）
-- 把下面的 <PROJECT_REF> 和 <ANON_KEY> 换成你的项目值再执行
-- =============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 每天 03:00 (UTC) 同步 YouTube（自有账号 + 竞品）
select cron.schedule(
  'sync-youtube-daily', '0 3 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/sync-youtube',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
    body := '{"scope":"all"}'::jsonb
  );
  $$
);

-- 每天 03:10 同步 Instagram
select cron.schedule(
  'sync-instagram-daily', '10 3 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/sync-instagram',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
    body := '{"scope":"all"}'::jsonb
  );
  $$
);

-- 每天 03:20 同步 TikTok（仅自有账号）
select cron.schedule(
  'sync-tiktok-daily', '20 3 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/sync-tiktok',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
    body := '{"scope":"accounts"}'::jsonb
  );
  $$
);

-- 查看已建任务： select * from cron.job;
-- 取消任务：     select cron.unschedule('sync-youtube-daily');
