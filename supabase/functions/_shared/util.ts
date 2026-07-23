// 各 Edge Function 共用的工具：CORS、Supabase 服务端客户端、日志、快照写入
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// 用 service_role 建客户端（绕过 RLS，可写入所有表）
export function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )
}

export async function writeLog(
  db: ReturnType<typeof admin>,
  platform: string,
  scope: string,
  status: string,
  processed: number,
  failed: number,
  message = ''
) {
  await db.from('sync_logs').insert({ platform, scope, status, processed, failed, message })
}

// 记录一条指标快照（同一天 upsert）
export async function snapshot(
  db: ReturnType<typeof admin>,
  subjectType: 'account' | 'competitor',
  subjectId: string,
  platform: string,
  metrics: { followers?: number; posts_count?: number; views?: number; likes?: number; engagement?: number }
) {
  await db.from('metric_snapshots').upsert(
    { subject_type: subjectType, subject_id: subjectId, platform, captured_at: new Date().toISOString().slice(0, 10), ...metrics },
    { onConflict: 'subject_type,subject_id,captured_at' }
  )
}
