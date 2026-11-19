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

function cleanDiagnostics(value: unknown) {
  if (!Array.isArray(value)) return []
  const fields = ['date', 'activeUsers', 'sessions', 'views', 'newUsers', 'engagedSessions', 'baselineUsers', 'lift']
  return value.slice(0, 3).map((item: any) => ({
    ...Object.fromEntries(fields.map((field) => [field, item?.[field]])),
    sources: cleanRows(item?.sources, 12),
    landingPages: cleanRows(item?.landingPages, 10),
    countries: cleanRows(item?.countries, 10),
    devices: cleanRows(item?.devices, 10),
  }))
}

function median(values: number[]) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function inferDiagnostics(gaDaily: any[], searchDaily: any[]) {
  return gaDaily.map((row, index) => {
    const previous = gaDaily.slice(Math.max(0, index - 14), index).map((item) => Number(item.activeUsers || 0))
    const baselineUsers = median(previous)
    const activeUsers = Number(row.activeUsers || 0)
    const search = searchDaily.find((item) => item.date === row.date) || {}
    return { ...row, baselineUsers, lift: baselineUsers ? activeUsers / baselineUsers : 0, organicClicks: Number(search.clicks || 0), organicImpressions: Number(search.impressions || 0), sources: [], landingPages: [], countries: [], devices: [] }
  }).filter((row) => row.baselineUsers >= 3 && row.activeUsers >= Math.max(30, row.baselineUsers * 2.5) && row.activeUsers - row.baselineUsers >= 25)
    .sort((a, b) => (b.activeUsers - b.baselineUsers) - (a.activeUsers - a.baselineUsers))
    .slice(0, 3)
}

function fallbackAnomalies(diagnostics: any[], searchDaily: any[]) {
  return diagnostics.map((item) => {
    const topSource = item.sources?.[0]
    const topLanding = item.landingPages?.[0]
    const search = searchDaily.find((row) => row.date === item.date) || {}
    const organicClicks = Number(item.organicClicks ?? search.clicks ?? 0)
    const organicImpressions = Number(item.organicImpressions ?? search.impressions ?? 0)
    const share = topSource && item.activeUsers ? Number(topSource.activeUsers || 0) / Number(item.activeUsers) : 0
    const sourceEvidence = topSource ? `最大来源“${topSource.key}”带来 ${topSource.activeUsers} 个活跃用户${share ? `（占 ${Math.round(share * 100)}%）` : ''}` : '本次数据未返回来源/媒介明细'
    const sourceKey = String(topSource?.key || '').toLowerCase()
    let likelyCause = '该峰值明显不是自然搜索点击直接带来，但缺少渠道明细，无法确认具体来源。'
    if (/paid|cpc|ppc|display/.test(sourceKey)) likelyCause = '峰值主要与付费广告流量同期出现，更可能由投放活动带来。'
    else if (/social|facebook|instagram|linkedin|tiktok|youtube/.test(sourceKey)) likelyCause = '峰值主要与社媒渠道流量同期出现，更可能由社媒内容或推广带来。'
    else if (/referral/.test(sourceKey)) likelyCause = '峰值主要来自引荐流量，应进一步核对对应外部网站或合作链接。'
    else if (/organic/.test(sourceKey)) likelyCause = '峰值与自然流量来源同期出现，但需结合 Search Console 点击数核对是否真为 Google 搜索贡献。'
    else if (/direct|\(none\)/.test(sourceKey)) likelyCause = '峰值主要被归类为直接访问，可能包含未加 UTM 的广告/社媒链接、内部访问或异常流量。'
    return {
      date: item.date,
      title: `${item.activeUsers} 个活跃用户的异常峰值`,
      evidence: `当日 ${item.activeUsers} 个活跃用户，过去 14 个数据日中位数约 ${Number(item.baselineUsers || 0).toFixed(1)}，约为平时的 ${Number(item.lift || 0).toFixed(1)} 倍；自然搜索仅 ${organicClicks} 次点击 / ${organicImpressions} 次曝光。${sourceEvidence}${topLanding ? `；最大落地页为“${topLanding.key}”` : ''}。`,
      likely_cause: likelyCause,
      confidence: topSource ? (share >= 0.6 ? '高' : '中') : '低',
      verification: topSource ? '对照当日广告、社媒和活动发布记录，并检查主要落地页的参与率、转化和 UTM 标记。' : '重新点击“同步”获取异常日的来源/媒介、落地页、国家和设备明细，再核对内部 IP 与活动记录。',
    }
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
  const gaDaily = cleanRows(body.gaDaily, 200) as any[]
  const searchDaily = cleanRows(body.searchDaily, 200) as any[]
  const providedDiagnostics = cleanDiagnostics(body.anomalyDiagnostics)
  const anomalyDiagnostics = providedDiagnostics.length ? providedDiagnostics : inferDiagnostics(gaDaily, searchDaily)
  const input = {
    period: body.period || {},
    metrics: body.metrics || {},
    gaDaily,
    searchDaily,
    topQueries: cleanRows(body.topQueries, 30),
    topPages: cleanRows(body.topPages, 30),
    anomalyDiagnostics,
    comparisons: body.comparisons || {},
  }

  const system = `你是资深国际站 SEO 与增长分析师。请根据提供的 GA4 和 Google Search Console 数据，输出简体中文、证据驱动、可执行的分析。不得虚构数据，不得把相关性说成因果。必须使用 comparisons.previous 做上一等长周期环比，使用 comparisons.yoy 做去年同期同比；若基期为 0，要明确写无法计算百分比，不得臆造。摘要、亮点、机会与风险应优先引用有意义的同比或环比变化。重点识别：流量质量、自然搜索表现、低 CTR 高曝光机会、接近首页的关键词、落地页机会、异常和下一步动作。

对 anomalyDiagnostics 中的异常流量峰值必须单独归因：结合渠道/来源媒介、落地页、国家、设备、会话与参与质量，区分自然搜索、广告、社媒、引荐、直接访问、内部流量和可疑机器人。只有数据能支持时才给出原因；否则明确写“无法确认”并列出验证步骤。confidence 仅能是高、中或低。

必须只返回一个 JSON 对象，结构严格如下：
{
  "health_score": 0到100的整数,
  "summary": "120字以内的管理层摘要",
  "anomalies": [{"date":"YYYY-MM-DD", "title":"", "evidence":"", "likely_cause":"", "confidence":"高|中|低", "verification":""}],
  "highlights": [{"title":"", "evidence":"", "meaning":""}],
  "opportunities": [{"priority":"高|中|低", "type":"关键词|落地页|内容|技术|转化", "title":"", "evidence":"", "action":"", "expected_impact":""}],
  "risks": [{"level":"高|中|低", "title":"", "evidence":"", "action":""}],
  "next_steps": [{"order":1, "action":"", "owner":"SEO|内容|网站|投放", "success_metric":""}]
}
anomalies 对每个输入异常日期各输出1项，无异常时返回空数组。highlights 2到4项，opportunities 3到6项，risks 0到4项，next_steps 3到5项。所有 evidence 必须引用输入中的具体数字、关键词或 URL。`

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
    const analysis = parseJson(content)
    analysis.current_metrics = input.metrics
    analysis.comparisons = input.comparisons
    if (anomalyDiagnostics.length && (!Array.isArray(analysis.anomalies) || !analysis.anomalies.length)) analysis.anomalies = fallbackAnomalies(anomalyDiagnostics, searchDaily)
    return json({ analysis, model, generated_at: new Date().toISOString() })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502)
  }
})
