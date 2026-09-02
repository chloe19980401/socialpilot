-- 管理员禁用账号功能：记录禁用状态；真正的登录封禁由 admin-user-status Edge Function 完成。
alter table public.profiles
  add column if not exists disabled_at timestamptz;

