-- TikTok 同步相关的表结构（已在 grogrigybgimvuuunxef 应用过）
-- 1) posts 增加 external_id + 唯一索引，让 TikTok 视频按账号幂等 upsert
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS external_id text;
CREATE UNIQUE INDEX IF NOT EXISTS posts_account_external_uidx
  ON public.posts (account_id, external_id);

-- 2) tiktok_tokens：单行存 TikTok OAuth token，仅服务端（service_role）可读写
CREATE TABLE IF NOT EXISTS public.tiktok_tokens (
  id int primary key default 1,
  open_id text,
  access_token text,
  refresh_token text,
  scope text,
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  updated_at timestamptz default now(),
  CONSTRAINT tiktok_tokens_singleton CHECK (id = 1)
);
ALTER TABLE public.tiktok_tokens ENABLE ROW LEVEL SECURITY;
-- 不加 policy = 只有 service_role（Edge Function）能访问，token 绝不暴露给前端
