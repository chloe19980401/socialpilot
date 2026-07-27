# 社媒 API 自动同步 · 接入与自动化指南

本指南教你申请三大平台的 API 凭证，并把服务端自动同步跑起来。数据流：

```
定时任务(pg_cron) ──> Supabase Edge Function ──> 各平台官方 API ──> 写入数据表 ──> 前端只读展示
```

密钥只放在服务端（Edge Function 的 Secrets），**绝不进前端、绝不进 Git 仓库**。

---

## 0. 前置：安装 Supabase CLI 并连上项目

```bash
npm install -g supabase        # 或 brew install supabase/tap/supabase
supabase login                 # 浏览器登录
supabase link --project-ref <你的项目ref>   # ref 在项目 URL 里
```

先把数据库结构建好（SQL Editor 里依次执行）：

1. `supabase/schema.sql`
2. `supabase/phase2_schema.sql`
3. `supabase/seed_competitors.sql`（门锁厂商竞品名单）

> Edge Function 里用到的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 由 Supabase 自动注入，**无需手动配置**。你只需要配下面各平台的密钥。

---

## 1. YouTube（最简单，先做这个）

只需一个 API Key，就能拉自有频道和竞品频道的粉丝/播放/视频数。

### 申请步骤

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 顶部项目下拉 → **新建项目** → 起名如 `socialpilot` → 创建
3. 左侧 **API 和服务 → 库** → 搜索 **YouTube Data API v3** → 点进去 **启用**
4. 左侧 **API 和服务 → 凭据** → 上方 **创建凭据 → API 密钥**
5. 复制生成的密钥。建议点 **修改密钥 → API 限制** 里只勾 YouTube Data API v3

### 配置 & 部署

```bash
supabase secrets set YOUTUBE_API_KEY=你复制的密钥
supabase functions deploy sync-youtube
```

### 测试

```bash
curl -X POST https://<项目ref>.supabase.co/functions/v1/sync-youtube \
  -H "Authorization: Bearer <ANON_KEY>" -H "Content-Type: application/json" \
  -d '{"scope":"all"}'
```

返回 `{"processed": N, "failed": M}` 即成功。也可以直接在前端「品牌管理 → 自动绑定社媒链接」/「竞品分析 → 同步数据」按钮触发。

> 配额：默认每天 10000 单位，拉一个频道约 1~3 单位，足够日常。

---

## 2. Instagram / Facebook（同一套 Graph API）

竞品用 **business_discovery** 接口：只要对方是**公开的商业号/创作者号**，按用户名就能查到粉丝数和贴文数。

### 前提条件

- 一个 Facebook 账号
- 一个 Facebook 主页（Page）
- 一个 Instagram **商业号或创作者号**，并**关联到那个 Page**（IG App 里：设置 → 账户类型 → 切换为专业账户 → 关联 Facebook 主页）

### 申请步骤

1. 打开 [developers.facebook.com](https://developers.facebook.com/) → 右上 **我的应用 → 创建应用**
2. 类型选 **企业 / Business** → 填名称 → 创建
3. 应用面板 → **添加产品** → 加上 **Instagram Graph API**（和 **Facebook Login**）
4. 打开 [Graph API 浏览器](https://developers.facebook.com/tools/explorer/)：
   - 选中你的应用
   - **权限**勾选：`instagram_basic`、`pages_show_list`、`business_management`、`instagram_manage_insights`
   - 生成 User Token
5. 拿到你自己的 **IG 商业号 id**：在 Graph API 浏览器里请求
   `me/accounts` → 找到你的 Page → 再请求 `<page-id>?fields=instagram_business_account`
   返回的 `instagram_business_account.id` 就是 **IG_BUSINESS_ID**
6. **换长期 Token**（默认 token 一小时过期）：
   ```
   GET https://graph.facebook.com/v19.0/oauth/access_token?
     grant_type=fb_exchange_token&client_id=<APP_ID>&
     client_secret=<APP_SECRET>&fb_exchange_token=<短期token>
   ```
   返回的就是约 60 天有效的长期 token（到期需刷新）。

### 配置 & 部署

```bash
supabase secrets set IG_ACCESS_TOKEN=长期token
supabase secrets set IG_BUSINESS_ID=你的IG商业号id
supabase functions deploy sync-instagram
```

### 注意

- **竞品**（business_discovery）：对方必须是公开商业号，个人号查不到。
- **自有账号**：需在 `accounts` 表里把该 IG 账号的 `external_id` 填成它的 ig user id。
- 想在「你自己团队之外的正式环境」长期使用，需要走 Facebook 的 **App Review** 申请高级权限；仅内部测试用 Graph API 浏览器的 token 即可。

---

## 3. TikTok（限制最多，务必先看这段）

**官方接口只能读“已授权登录的那个账号自己”的数据，无法按用户名查任意竞品。**
所以：

- ✅ 自有 TikTok 账号：可通过官方 Display API 自动拉粉丝/点赞/视频数
- ❌ 竞品 TikTok 数据：官方无合规接口，只能**手动录入**，或接第三方付费数据商（有 ToS 风险，需自行评估）

### 自有账号申请步骤

1. 打开 [developers.tiktok.com](https://developers.tiktok.com/) → 注册开发者
2. **Manage apps → Create an app**
3. 添加产品 **Login Kit**（Display API 能力已并入 Login Kit 的 scope）
4. 申请 scope：`user.info.basic`、`user.info.stats`、**`video.list`**
   （`video.list` 是拉「帖子/视频列表」必需的，缺它只能拿到账号粉丝/点赞总数）
5. 走一遍 OAuth 授权流程（用你的 TikTok 账号登录授权），拿到 **access_token**
   - OAuth 回调、换 token 的细节见 TikTok 文档 *Login Kit → Manage User Access Tokens*
   - 详细图文步骤见 `docs/TikTok接入指南.md`

### 配置 & 部署

```bash
supabase secrets set TIKTOK_ACCESS_TOKEN=授权拿到的token
supabase functions deploy sync-tiktok
```

### 本函数会同步什么

- **账号级**：粉丝数 → `accounts.followers`；粉丝/点赞/视频数 → `metric_snapshots`
- **帖子级**：`POST /v2/video/list/` 拉最近视频（最多 60 条），逐条写入 `posts` 表
  （标题、描述、封面、发布时间、播放/点赞/评论/分享）。按 `account_id + external_id`
  幂等 upsert，重复同步不会产生重复行。

> ⚠️ TikTok 的 access_token 有效期仅 **24 小时**，refresh_token 约 365 天。手动贴的
> token 第二天就失效。要长期自动跑，需保存 refresh_token 定期续期（可让我加一个
> OAuth + 自动刷新的辅助函数）。竞品 TikTok 官方接口拿不到，仍需手动录入。

---

## 4. 定时自动同步

编辑 `supabase/schedule_cron.sql`，把 `<PROJECT_REF>` 和 `<ANON_KEY>` 换成你的值，在 SQL Editor 执行。
默认每天凌晨各拉一次。查看/取消：

```sql
select * from cron.job;
select cron.unschedule('sync-youtube-daily');
```

需要先在 **Database → Extensions** 开启 `pg_cron` 和 `pg_net`。

---

## 5. 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| 返回「未配置 XXX」 | 对应 secret 没设，`supabase secrets set` 后重新 deploy |
| YouTube `failed` 很多 | handle 解析不到，去频道页复制 channelId 填到 `accounts/competitors.external_id` |
| IG business_discovery 返回空 | 对方不是公开商业号，或你的 token 权限不足 |
| IG token 突然失效 | 长期 token 约 60 天过期，重新换一次 |
| TikTok 竞品没数据 | 官方不支持，属预期，手动录入 |

---

## 6. 密钥安全清单

- ✅ 所有平台密钥都在 `supabase secrets`（服务端），不在前端
- ✅ `.env.local` 只放前端 URL 和 anon key，且已被 `.gitignore` 忽略
- ❌ 绝不要把 `service_role` key 或平台 token 写进代码或提交到 GitHub
