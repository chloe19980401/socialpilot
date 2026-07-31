import { supabase } from './supabase'

// 调用服务端 Edge Function 触发平台数据同步
// platform: 'youtube' | 'instagram' | 'tiktok'
// scope: 'accounts' | 'competitors' | 'all'
export async function triggerSync(platform, scope = 'all') {
  const { data, error } = await supabase.functions.invoke(`sync-${platform}`, {
    body: { scope },
  })
  if (error) throw error
  return data
}

// 一次性同步全部平台，返回汇总结果
export async function syncAll(scope = 'all') {
  const platforms = ['youtube', 'instagram', 'tiktok', 'facebook']
  const results = await Promise.allSettled(platforms.map((p) => triggerSync(p, scope)))
  return results.map((r, i) => ({
    platform: platforms[i],
    ...(r.status === 'fulfilled' ? r.value : { error: String(r.reason?.message || r.reason) }),
  }))
}
