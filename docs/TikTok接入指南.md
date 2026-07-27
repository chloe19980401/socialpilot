# TikTok 接入指南 · 自动授权 + 同步账号帖子

系统的 TikTok 同步已就绪。我已经帮你在 TikTok 开发者后台建好应用并配好了大部分东西,
Supabase 端也建好了「自动换 token + 自动续期」的整套流程。**剩下的只有几步需要你本人做**
(填几个必填信息、设两个密钥、用 @wonlyglobal 点一次授权)。

> 现实限制:
> - ✅ 只能拉**你自己授权的账号**(@wonlyglobal)的数据。
> - ❌ 竞品 TikTok 官方接口拿不到,只能手动录入。

---

## 我已经做好的部分

TikTok 开发者应用 **SocialPilot WONLY**(App ID 7667011710670342164):
- 已添加产品 **Login Kit**
- 已申请 scope:`user.info.basic`、`user.info.stats`、`video.list`
- 已启用 **Web** 平台,回调地址(Redirect URI)已填:
  `https://grogrigybgimvuuunxef.supabase.co/functions/v1/tiktok-oauth`

Supabase 端:
- `tiktok-oauth` 函数:接收授权回调,自动用 code 换 token 并保存(已部署)
- `tiktok_tokens` 表:安全存放 token/refresh_token(仅服务端可读)
- `sync-tiktok` 函数:同步前自动检查 token,过期就用 refresh_token 换新的,再拉账号统计 + 最近视频写入 posts 表(已部署,v6)

---

## 你需要做的(约 5 步)

### 第 1 步:补全应用必填信息
后台保存时提示「8 个错误」,是这些提交审核前必填的字段(在 App details → Basic information):
应用图标、应用简介、类目、**隐私政策 URL**、**服务条款 URL** 等。
可以用你自己的站点(如 foreverdoodle.com 下的对应页面)。填完点 **Save**。

### 第 2 步:拿 Client key / Client secret
应用页顶部 **App details → Credentials** 里,点眼睛图标显示并复制 **Client key** 和 **Client secret**。

### 第 3 步:把两个密钥填进 Supabase
Supabase 项目 → **Edge Functions → Manage secrets** → 新增两条:
- `TIKTOK_CLIENT_KEY` = 你的 Client key
- `TIKTOK_CLIENT_SECRET` = 你的 Client secret

保存即可,函数不用重新部署。

### 第 4 步:走一次授权(只需一次)
用 @wonlyglobal 登录 TikTok 后,在浏览器打开下面这串(把 `<CLIENT_KEY>` 换成第 2 步的 Client key):

```
https://www.tiktok.com/v2/auth/authorize/?client_key=<CLIENT_KEY>&scope=user.info.basic,user.info.stats,video.list&response_type=code&redirect_uri=https://grogrigybgimvuuunxef.supabase.co/functions/v1/tiktok-oauth&state=wonly
```

点「同意授权」后会自动跳到我们的回调页,显示「✅ 授权成功」——这时 token 已自动存好,
以后会自动续期,**不用再手动贴 token**。

> 想不走完整审核先测试:把应用切到 **Sandbox** 模式,在 Sandbox → Target users 里
> 把 @wonlyglobal 加为测试用户,同样能授权自己的账号。审核通过后再切回 Production。

### 第 5 步:同步
系统前端点 TikTok 同步按钮,或:

```bash
curl -X POST 'https://grogrigybgimvuuunxef.supabase.co/functions/v1/sync-tiktok' \
  -H 'Authorization: Bearer <ANON_KEY>' -H 'Content-Type: application/json' \
  -d '{"scope":"accounts"}'
```

成功返回类似 `{"processed":1,"failed":0,"posts_upserted":23}`,@wonlyglobal 的粉丝数会更新,
最近视频出现在「内容中心」。

---

## 常见问题

| 现象 | 处理 |
|---|---|
| 回调页显示「未配置密钥」 | 第 3 步的两个 secret 没设 |
| 回调页「换 token 失败」 | Client key/secret 填错,或 redirect_uri 不一致 |
| 授权页 scope 无效 | 应用还在沙盒但没把自己加为测试用户 |
| 同步「未授权」 | 还没走第 4 步授权 |
| 同步成功但没帖子 | 确认 scope 含 video.list;账号需有公开视频 |
| 竞品没数据 | 官方不支持,属预期,手动录入 |
