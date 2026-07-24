# SocialPilot AI · 社媒发布智能管理平台

多品牌社媒运营管理系统。React + Vite + Tailwind 前端，Supabase 做数据库与账号密码登录鉴权。

九大模块：仪表盘、品牌管理、内容中心、日历排期、KOL 红人管理、自建站数据看板、竞品分析、绩效看板、设置（用户管理）。

## 技术栈

- React 18 + Vite 5
- React Router 6（Hash 路由，`#/xxx`）
- Tailwind CSS 3
- Recharts（图表）· lucide-react（图标）
- Supabase（Postgres 数据库 + Auth 登录）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 建一个干净的 Supabase 项目

到 [supabase.com](https://supabase.com) 新建一个项目（免费额度即可）。

打开 **SQL Editor**，把 [`supabase/schema.sql`](supabase/schema.sql) 全部粘贴进去 **Run** 一次。会创建全部空表并开启行级安全（RLS）。

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`，在 Supabase 后台 **Project Settings → API** 找到并填入：

```
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的 anon / publishable key
```

> `.env.local` 已在 `.gitignore` 中，不会被提交。anon key 是公开可用的前端 key，但仍建议只放本地。

### 4. 创建第一个登录账号

系统设计为「管理员建号、用户不能自行注册」。首个管理员账号在 Supabase 后台创建：

系统用「用户名登录」：登录页输入用户名（如 `chloelee`），前端会自动补成邮箱
`chloelee@foreverdoodle.com` 再提交（域名在 `src/lib/config.js` 的 `AUTH_EMAIL_DOMAIN` 可改）。

所以在 **Authentication → Users → Add user** 里：

- Email：`chloelee@foreverdoodle.com`
- Password：`chloe123`
- 勾选 **Auto Confirm User**

创建后设为管理员（SQL Editor 执行）：

```sql
update public.profiles set role = 'admin' where email = 'chloelee@foreverdoodle.com';
```

之后在登录页用户名填 `chloelee`、密码 `chloe123` 即可登录。

### 5. 启动

```bash
npm run dev
```

打开 http://localhost:5173 ，用刚建的账号登录。

## 数据录入

所有页面初始为空。登录后：

- **品牌管理** → 创建品牌
- **仪表盘 / 内容中心** → 数据来自 `accounts`、`posts` 表
- **设置 → 用户管理** → 创建协作者资料

可以从界面录入，也可以在 Supabase 后台直接往对应表插数据。表结构见 `supabase/schema.sql`。

### 关于「创建登录账号」

界面上的「创建账号」只写入 `profiles` 资料表，**不会**生成可登录的密码账号（前端无法安全地调用 Supabase 管理接口）。真正可登录的账号请二选一：

1. Supabase 后台 **Authentication → Users → Add user**（推荐）
2. 用 service_role key 写一个服务端 / Edge Function 调 `auth.admin.createUser`

## 部署

本项目已配好 **GitHub Pages 自动部署**，目标子域名 `socialwonly.foreverdoodle.com`（不影响根域名上的原系统）。

推到 GitHub → 配两个构建 secret → 开 Pages → 绑 DNS，完整步骤见 **[docs/部署到GitHub-Pages.md](docs/部署到GitHub-Pages.md)**。

本地手动构建：

```bash
npm run build     # 产物在 dist/，也可托管到 Vercel / Netlify / Cloudflare Pages
```

## 社媒 API 自动同步（第二阶段）

打通 YouTube / Instagram·Facebook / TikTok 官方 API，自动拉自有账号和竞品（门锁厂商）数据。
服务端用 Supabase Edge Functions，密钥只在服务端。申请凭证与部署的完整图文见
**[docs/API接入与自动化指南.md](docs/API接入与自动化指南.md)**。

```
supabase/functions/       三平台同步器（sync-youtube / sync-instagram / sync-tiktok）
supabase/phase2_schema.sql 指标快照 + 同步日志表
supabase/seed_competitors.sql 门锁厂商竞品名单
supabase/schedule_cron.sql 每日定时同步
```

## 目录结构

```
src/
  components/        侧边栏、顶栏、UI 组件
  context/           AuthContext（登录状态）
  lib/               supabase 客户端、格式化、平台元数据
  pages/             9 个页面
supabase/schema.sql  数据库建表脚本
```

## 安全提示

- 本项目用「登录用户即可读写全部数据」的简单 RLS 策略，适合内部团队工具。若要按品牌/角色细分权限，请在 `schema.sql` 里调整 policy。
- 不要把 `service_role` key 放进前端或提交到仓库。
