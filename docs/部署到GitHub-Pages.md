# 部署到 GitHub Pages（子域名 socialwonly.foreverdoodle.com）

本项目用 Hash 路由（`#/`），天然适配 GitHub Pages，无需服务器重写。

管理员登录邮箱：`socialwonly@foreverdoodle.com`（在 Supabase 后台创建，见下方第 5 步）。

---

## 1. 推到 GitHub 仓库

```bash
cd 社媒管理系统新
git init
git add .
git commit -m "SocialPilot AI 初始版本"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> `.env.local`、`node_modules` 已被 `.gitignore` 忽略，不会上传。密钥不会进仓库。

## 2. 配置构建密钥（Supabase 连接信息）

仓库页 **Settings → Secrets and variables → Actions → New repository secret**，加两条：

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<你的项目ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | 你的 anon / publishable key |

> anon key 本就是前端公开 key，会打进构建产物，属正常。**不要**把 service_role key 放这里。

## 3. 开启 Pages

仓库页 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

之后每次 push 到 `main`，`.github/workflows/deploy.yml` 会自动构建并发布。第一次也可到 **Actions** 手动 Run。

## 4. 绑定子域名 socialwonly.foreverdoodle.com

项目里已有 `public/CNAME` 文件（内容为 `socialwonly.foreverdoodle.com`），构建时会自动带上。若想用别的子域名（如 `new.`），改这个文件即可。

**再到你的 DNS 服务商**（域名在哪买的 / 或 Cloudflare）加一条记录：

| 类型 | 名称 | 值 |
|---|---|---|
| CNAME | `socialwonly` | `<你的GitHub用户名>.github.io` |

> 用组织 / 用户名，不带仓库名。若用 Cloudflare，代理开关(小云朵)先设为「仅 DNS / DNS only」，等 Pages 签好证书再开代理。

回到 **Settings → Pages → Custom domain** 填 `socialwonly.foreverdoodle.com`，勾选 **Enforce HTTPS**（证书签发要等几分钟到一小时）。

完成后访问：`https://socialwonly.foreverdoodle.com`
根域名 `foreverdoodle.com` 不受影响，原系统照常运行。

## 5. 创建管理员账号

系统用「用户名登录」（输入 `chloelee`，前端自动补成 `chloelee@foreverdoodle.com`）。

Supabase 后台 **Authentication → Users → Add user**：

- Email：`chloelee@foreverdoodle.com`
- Password：`chloe123`
- 勾选 **Auto Confirm User**

然后到 **SQL Editor** 把它设为管理员：

```sql
update public.profiles set role = 'admin'
where email = 'chloelee@foreverdoodle.com';
```

之后在 `https://socialwonly.foreverdoodle.com` 登录页填 用户名 `chloelee` / 密码 `chloe123` 即可。

---

## 常见问题

| 现象 | 处理 |
|---|---|
| 打开是 404 / 白屏 | 确认 Pages Source 选了「GitHub Actions」，且 Actions 跑成功 |
| 页面能开但登录报错 | 两个 `VITE_` secret 没配或填错，改完重新触发一次 Actions |
| 自定义域名一直 "not properly configured" | DNS 的 CNAME 没生效，等 DNS 传播；Cloudflare 先关代理 |
| 证书 / HTTPS 报错 | 等 GitHub 自动签发，通常几分钟到 1 小时 |
| 刷新子路由 404 | 本项目用 Hash 路由不会有此问题；若你改成 BrowserRouter 才需要额外配置 |
