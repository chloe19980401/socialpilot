-- =============================================================
-- 竞品种子名单 · 智能锁 / 门锁厂商
-- 跑完 schema.sql + phase2_schema.sql 之后执行
-- 说明：handle 为各品牌公开主页用户名，可能随时间变动，
--       同步失败时请到对应平台核对后更新 handle 或直接填 external_id。
-- 同一 (name, platform) 不重复插入，可安全重复执行。
-- =============================================================

create unique index if not exists uq_competitor_name_platform
  on public.competitors (name, platform);

insert into public.competitors (name, group_name, platform, handle) values
  -- 品牌,          分组,        平台,         handle
  ('Wyze',        'Wyze',      'youtube',   'wyze'),
  ('Wyze',        'Wyze',      'instagram', 'wyze'),
  ('August Home', 'August',    'youtube',   'AugustHome'),
  ('August Home', 'August',    'instagram', 'augusthome'),
  ('Schlage',     'Schlage',   'youtube',   'schlage'),
  ('Schlage',     'Schlage',   'instagram', 'schlagelocks'),
  ('Yale Home',   'Yale',      'youtube',   'YaleHome'),
  ('Yale Home',   'Yale',      'instagram', 'yalehome'),
  ('Kwikset',     'Kwikset',   'youtube',   'Kwikset'),
  ('Kwikset',     'Kwikset',   'instagram', 'kwikset'),
  ('Ultraloq',    'U-tec',     'youtube',   'Ultraloq'),
  ('Ultraloq',    'U-tec',     'instagram', 'ultraloq'),
  ('Lockly',      'Lockly',    'youtube',   'Lockly'),
  ('Lockly',      'Lockly',    'instagram', 'locklylock'),
  ('eufy Security','Anker',    'youtube',   'eufySecurity'),
  ('eufy Security','Anker',    'instagram', 'eufyofficial'),
  ('Aqara',       'Aqara',     'youtube',   'Aqara'),
  ('Aqara',       'Aqara',     'instagram', 'aqara_global'),
  ('SwitchBot',   'SwitchBot', 'youtube',   'SwitchBot'),
  ('SwitchBot',   'SwitchBot', 'instagram', 'switchbot'),
  ('Level Home',  'Level',     'youtube',   'levelhome'),
  ('Level Home',  'Level',     'instagram', 'level'),
  ('Nuki',        'Nuki',      'youtube',   'nukismartlock'),
  ('Nuki',        'Nuki',      'instagram', 'nuki_smartlock')
on conflict (name, platform) do nothing;
