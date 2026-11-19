import { admin, corsHeaders, json } from '../_shared/util.ts'

async function currentUser(req: Request) {
  const auth = req.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  const { data: { user } } = await admin().auth.getUser(auth.slice(7))
  return user || null
}

function cleanRows(rows: unknown, limit: number) {
  if (!Array.isArray(rows)) return []
  return rows.slice(0, limit).map((row) => {
    if (!row || typeof row !== 'object') return row
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.slice(0, 500) : value,
    ]))
  })
}

function parseJson(content: string) {
  const normalized = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(normalized)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!await currentUser(req)) return json({ error: '未登录' }, 401)

  const apiKey = Deno.env.get('GEMINI_API_KEY') || ''
  if (!apiKey) return json({ error: 'AI 分析服务尚未配置' }, 503)

  const body = await req.json().catch(() => ({}))
  const input = {
    period: body.period || {},
    metrics: body.metrics || {},
    gaDaily: cleanRows(body.gaDaily, 200),
    searchDaily: cleanRows(body.searchDaily, 200),
    topQueries: cleanRows(body.topQueries, 30),
    topPages: cleanRows(body.topPages, 30),
  }

  const system = `你是资深国际站 SEO 与增长分析师。请根据提供的 GA4 和 Google Search Console 数据，输出简体中文、证据驱动、可执行的分析。不得虚构数据，不得把相关性说成因果。数据只有当前周期时，可比较周期前后半段，但必须明确口径。重点识别：流量质量、自然搜索表现、低 CTR 高曝光机会、接近首页的关键词、落地页机会、异常和下一步动作。

必须只返回一个 JSON 对象，结构严格如下：
{
  "health_score": 0到100的整数,
  "summary": "120字以内的管理层摘要",
  "highlights": [{"title":"", "evidence":"", "meaning":""}],
  "opportunities": [{"priority":"高|中|低", "type":"关键词|落地页|内容|技术|转化", "title":"", "evidence":"", "action":"", "expected_impact":""}],
  "risks": [{"level":"高|中|低", "title":"", "evidence":"", "action":""}],
  "next_steps": [{"order":1, "action":"", "owner":"SEO|内容|网站|投放", "success_metric":""}]
}
highlights 2到4项，opportunities 3到6项，risks 0到4项，next_steps 3到5项。所有 evidence 必须引用输入中的具体数字、关键词或 URL。`

  try {
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-3.1-flash-lite'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${system}\n\n待分析数据：\n${JSON.stringify(input)}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) return json({ error: result?.error?.message || `Gemini 服务 HTTP ${response.status}` }, 502)
    const content = result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part?.text || '').join('')
    if (!content) return json({ error: 'AI 未返回分析结果' }, 502)
    return json({ analysis: parseJson(content), model, generated_at: new Date().toISOString() })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502)
  }
})
