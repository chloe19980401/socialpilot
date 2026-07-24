# 迁移到 Mac · 启动说明

这个包是 SocialPilot AI 的完整源码（不含 `node_modules`，需在 Mac 上重新 `npm install`）。

## 1. 装 Node.js（如果 Mac 上还没有）

推荐用 Homebrew：

```bash
# 没装 Homebrew 的话先装：https://brew.sh
brew install node
```

验证：

```bash
node -v   # 建议 v18 或更高
npm -v
```

## 2. 解压并进入项目

把 zip 解压到你想放的位置，然后：

```bash
cd ~/路径/socialpilot     # 换成你解压后的实际路径
```

## 3. 装依赖

```bash
npm install
```

## 4. 配置环境变量

包里已带 `.env.local`，URL 已填好，只差 anon key：

打开 `.env.local`，把最后一行的 anon key 补上（从 Supabase 后台 → 项目 `grogrigybgimvuuunxef` → Project Settings → API → anon/public key 复制）：

```
VITE_SUPABASE_URL=https://grogrigybgimvuuunxef.supabase.co
VITE_SUPABASE_ANON_KEY=粘贴你的_anon_key
```

## 5. 启动

```bash
npm run dev
```

浏览器打开终端里显示的地址（一般 http://localhost:5173），
用 **用户名 `chloelee` / 密码 `chloe123`** 登录。

---

## 接着连 GitHub（可选，推荐）

项目已在 GitHub：`https://github.com/chloe19980401/socialpilot`
在 Mac 上直接克隆最新版更省事（就不用解压包了）：

```bash
git clone https://github.com/chloe19980401/socialpilot.git
cd socialpilot
npm install
# 再手动新建 .env.local，内容同上
npm run dev
```

> 提示：`.env.local` 不在 Git 里（安全考虑），所以克隆下来后要自己建一个。本包里的 `.env.local` 可以直接复制过去用。

## 其他文档

- `README.md` — 项目总览
- `docs/部署到GitHub-Pages.md` — 部署与域名
- `docs/API接入与自动化指南.md` — 三平台 API 自动同步
