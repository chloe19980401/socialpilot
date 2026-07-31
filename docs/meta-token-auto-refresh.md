# Meta（Instagram / Facebook）Token 长期自动化方案

> 目标：让 Meta Graph API 的访问令牌长期有效、无需人工手动更换，
> 使 IG / FB 的账号与数据能持续自动同步。

## 一、现状诊断（2026-07-31）

| 平台 | 账号同步 | 结论 |
|------|----------|------|
| Instagram | ✅ 成功（`success`, failed=0） | **token 有效**。IG 帖子显示 0 是"手动帖 external_id=链接短码，API=媒体数字 id，对不上"导致刷新匹配不到，**不是 token 问题**。 |
| Facebook | ❌ 一直失败（`partial`, failed=1, processed=0） | `pageStats` 取不到数据，多半是 **token 过期 / 权限不足 / Page external_id 未填**。 |

Meta 的 IG 和 FB 共用同一套 Graph Token（App / 用户 / 系统用户令牌），所以一套方案同时覆盖两者。

## 二、为什么 Meta Token 会失效

- **短期用户令牌**：1~2 小时过期。
- **长效用户令牌**：60 天过期。
- **主页（Page）令牌**：由长效用户令牌派生的 Page 令牌本身"长期有效"，但一旦源用户改密码 / 退出授权 / 60 天到期链条断掉，就失效。
- 结论：靠"个人账号手动生成的令牌"必然会周期性失效——这就是 FB 现在挂掉的根因。

## 三、方案 A（推荐）：Business 系统用户 + 永不过期 Token —— 零维护

用 Meta 商务管理平台的"系统用户（System User）"生成令牌，可设为**永不过期**，且不绑定任何个人账号（改密码也不受影响）。这是生产环境的标准做法，**不需要任何自动续期代码**。

步骤：

1. 打开 **business.facebook.com** → 商务设置（Business Settings）。
2. 左侧「用户 → 系统用户」→ 新建一个系统用户（角色选「管理员」）。
3. 「添加资产」把 **Facebook 主页** 和 **Instagram 账号** 都分配给这个系统用户，权限勾全（管理 + 查看数据）。
4. 点「生成令牌」，选择你的 App，勾选权限：
   `pages_show_list, pages_read_engagement, read_insights, instagram_basic, instagram_manage_insights, business_management`
   过期时间选 **「永不」（Never）**。
5. 复制这个令牌，配到后端密钥（**只在服务端，绝不进前端 / 仓库**）：
   - `FB_PAGE_TOKEN` = 该令牌
   - `IG_ACCESS_TOKEN` = 该令牌（同一个即可，只要含 IG 权限）
   - 确认 `IG_BUSINESS_ID`（IG 商业账号 id）已配。
6. 确认 `accounts` 表里 FB / IG 账号的 `external_id` 填了正确的 **Page ID / IG Business ID**。

配好后 FB 账号同步就会成功，且令牌不再过期。**推荐优先走这条。**

## 四、方案 B（备选）：60 天长效 Token + 定时自动续期

如果没法用系统用户永不过期令牌，就用"60 天长效令牌 + 每周自动续期"，完全复用现有 TikTok 的那套模式（`tiktok_tokens` 表 + `token-refresh` 函数 + `getToken` 里自动刷新）。

要做的东西：

1. **建表 `meta_tokens`**（只 service_role 可读）：
   ```sql
   create table if not exists public.meta_tokens (
     id int primary key default 1,
     access_token text,
     expires_at timestamptz,
     updated_at timestamptz default now()
   );
   alter table public.meta_tokens enable row level security;
   ```
2. **新 Edge Function `meta-token-refresh`**：调用 Graph 的令牌交换接口拿新的 60 天令牌并写回表：
   ```
   GET https://graph.facebook.com/v19.0/oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id={APP_ID}
       &client_secret={APP_SECRET}
       &fb_exchange_token={当前长效令牌}
   ```
   返回的新令牌 + 过期时间写入 `meta_tokens`。
3. **pg_cron 每周跑一次**（远早于 60 天，避免踩线），复用现有 `feishu_cron.sql` 里的 `net.http_post` 写法定时触发上面的函数。
4. **改 `sync-instagram` / `sync-facebook`**：token 从 `meta_tokens` 表读（读不到再回退到 env 变量），像 TikTok 的 `getToken(db)` 那样。

需要你提供（配成后端密钥，我不接触）：
- **Meta App ID / App Secret**
- 一个**初始的长效令牌**（60 天的即可，系统会自动往后续）

## 五、附带问题：IG / FB "帖子级"互动量刷新

即使 token 修好，IG / FB 的**单条帖子**互动量目前也刷不到，因为：
- 手动上传时存的 `external_id` 是链接里的短码（如 `DbaDNt0MWEi`）；
- Graph API 返回的是媒体数字 id（如 `18164672368459388`）；
- 两者对不上，按 external_id 匹配不到。

解决办法：把 IG / FB 的同步刷新改成**按帖子链接（permalink）匹配**（标准化去掉 query 参数后比对），而不是 external_id。这是独立的一小步，可在 token 修好后单独做。

## 六、建议路线

1. **先走方案 A**（系统用户永不过期令牌）——最省事，FB 立刻能同步，IG 也更稳。
2. 若坚持 60 天令牌，再让我按**方案 B**把自动续期的表 + 函数 + 定时任务搭好。
3. 最后再补 **IG/FB 帖子按链接匹配刷新**（第五节）。
