# CLAUDE.md — SocialPilot AI 社媒管理系统

给在本仓库工作的 Claude 的项目上下文。动手前先读本文件。

## 是什么

多品牌社媒运营管理系统（SocialPilot AI · 社媒发布智能管理平台）。管理员/协作者登录，
管理多个品牌的社媒账号、内容发布、数据分析、KOL 红人、自建站电商、竞品、绩效 KPI。
界面全中文。

## 技术栈

- React 18 + Vite 5，JSX（**无 TypeScript**）
- React Router 6，**HashRouter**（路由是 `#/xxx`，GitHub Pages 友好）
- Tailwind CSS 3（只用核心工具类）
- Recharts（图表）、lucide-react（图标）
- Supabase：Postgres 数据库 + Auth 登录 + Edge Functions

## 怎么跑

```bash
npm install
# 需要 .env.local（见下），已 gitignore
npm run dev        # 端口占用会自动 +1（5173→5174…），看终端输出的实际地址
```

`.env.local` 必需两个变量：

```
VITE_SUPABASE_URL=https://grogrigybgimvuuunxef.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key，sb_publishable_ 开头>
```

登录：**用户名 `chloelee` / 密码 `chloe123`**（不是邮箱）。

## 登录机制（重要）

系统是「用户名登录」，但 Supabase Auth 只认邮箱。`src/lib/config.js` 的 `toEmail()`
把用户名补成邮箱：`chloelee` → `chloelee@foreverdoodle.com`（域名常量 `AUTH_EMAIL_DOMAIN`）。
在 Supabase 建账号时邮箱要用「用户名@该域名」。账号由管理员创建，用户不能自行注册。

## 目录结构

```
src/
  main.jsx / App.jsx        入口 + 路由（9 个页面）
  context/AuthContext.jsx   登录状态、signIn/signOut、profile（角色）
  components/
    Layout / Sidebar / Topbar  外壳（侧边栏含品牌工作区+账号列表+用户菜单）
    ui/                      Card, StatCard, Common(Button/Tabs/Modal/Badge/EmptyState/Field)
  lib/
    supabase.js             Supabase 客户端 + isSupabaseConfigured
    config.js               AUTH_EMAIL_DOMAIN + toEmail()
    format.js               compactCN/compactEN/money/percent/日期
    platforms.js            平台图标与主色（instagram/youtube/...）
    sync.js                 调用 Edge Function 同步（triggerSync/syncAll）
  pages/
    Login Dashboard Brands Content Calendar Kol Ecommerce Competitors Performance Settings
supabase/
  schema.sql                主建表脚本（干净项目用）
  phase2_schema.sql         指标快照 + 同步日志（API 同步用）
  seed_competitors.sql      门锁厂商竞品名单
  schedule_cron.sql         每日定时同步（pg_cron）
  functions/                Edge Functions：sync-youtube / sync-instagram / sync-tiktok
docs/                       部署、API 接入、Mac 迁移 指南
```

路由映射（`App.jsx`）：`/`=仪表盘 `/brands`=品牌 `/content`=内容中心 `/calendar`=日历
`/logs`=KOL红人 `/trends`=自建站看板 `/competitors`=竞品 `/performance`=绩效 `/settings`=设置。

## Supabase 项目

- 项目 ref：`grogrigybgimvuuunxef`（名字「众筹和kol」，**与一个众筹应用共用同一个库**）
- 本系统的表：profiles, brands, brand_socials, accounts, posts, kols, kol_alpha_reviews,
  competitors, store_orders, product_costs, marketing_spend, kpi_goals, metric_snapshots, sync_logs
- **别碰**众筹应用的表（platforms, creators, projects, backers, users, oauth_sessions,
  keyword_tracking* 等）和 `auth.users` 触发器。
- RLS：本系统表用 `sp_auth_all`（authenticated 可全读写）。众筹表是「开 RLS 不加 policy」
  = 只有 service_role 后端能访问。Edge Function 用 service_role 写数据（绕过 RLS）。

## Edge Functions（社媒 API 同步）

- `sync-youtube`：**已部署**。用 YouTube Data API v3 拉自有账号+竞品频道数据。需密钥 `YOUTUBE_API_KEY`。
- `sync-instagram`：写好未部署。Graph API business_discovery 抓竞品。需 `IG_ACCESS_TOKEN` + `IG_BUSINESS_ID`。
- `sync-tiktok`：写好未部署。仅能抓自有授权账号；竞品官方接口拿不到。需 `TIKTOK_ACCESS_TOKEN`。
- 密钥用 `supabase secrets set` 或后台配置，**只在服务端，绝不进前端/仓库**。
- 前端「品牌管理→自动绑定社媒链接」「竞品→同步数据」按钮调用这些函数。

## 部署

- GitHub：`https://github.com/chloe19980401/socialpilot`
- GitHub Pages 自动部署（`.github/workflows/deploy.yml`），子域名 `socialwonly.foreverdoodle.com`
- 免费 Pages 需 public 仓库；构建密钥 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 配在
  仓库 Settings → Secrets → Actions。

## 约定与坑

- 页面初始为空要有 EmptyState / 「暂无数据」，不要假设有数据。
- 数字用 `format.js` 的 compactCN（1.7万）/ compactEN（2.0M）。
- 新增读表逻辑，表不存在或为空要静默降级，不要让整页崩。
- **绝不**提交 `.env.local`、`service_role` key、平台 token。
- 改动后本地验证：`npm run build` 能过；改了登录/鉴权要真的登一次。
- Windows 上 git 若报 `HEAD.lock/index.lock` 存在，先 `Remove-Item .git\*.lock`。
```
