import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  WalletCards, Plus, Pencil, Trash2, Search, SlidersHorizontal,
  CircleDollarSign, ReceiptText, Gauge, PiggyBank,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Badge, Button, EmptyState, Field, Modal, inputClass } from '../components/ui/Common'

const CATEGORY_ITEMS = {
  exhibitions: ['展位租赁、注册及基础管理费', '展台搭建、承重、灯光及拆除', '展示门样、演示装置及出口包装', '国际运输、清关、搬运及仓储', '人员差旅及当地交通', '当地翻译及现场协助', '电力、网络、清洁、保险及印刷', '税费及附加费'],
  ads: ['Google 搜索广告', 'Facebook、Instagram 广告', 'YouTube 视频广告', '再营销广告', '广告支付、汇兑及不可抵扣税费'],
  channel_support: ['渠道展示门样及五金配置', '样品包装、国际运输及清关', '门店展示架、品牌标识及安装', '渠道拜访差旅', '产品培训、翻译及场地', '产品册、选材板及快递'],
  salons: ['协会合作及定向邀约', '场地、音响、屏幕及现场设备', '茶歇、餐饮及接待', '当地翻译及主持', '活动人员专项差旅', '展示件运输、布置及印刷'],
  website: ['官网服务器、数据库及备份', '官网年费、域名及授权续费', 'CDN、对象存储及视频流量', '安全防护、监测及恢复服务', 'SEO、网站分析及工具订阅', '邮件发送及询盘通知'],
  video: ['海外表达策划、导演及脚本', '摄影团队、灯光、器材及拍摄', '演员、场景及美术布置', '剪辑、调色、声音及特效', '多语配音及母语审校', '音乐、素材及肖像授权', '广告尺寸适配及补剪'],
  ai_tool: ['模型、图片处理及 OCR 接口', '云资源、存储及流量', '兼容性、性能及安全测试', '用户访谈及测试激励', '隐私条款及用户协议审阅', '开发者账户、通知及插件', '渠道试用培训及演示'],
  research: ['海关贸易数据及企业资料', '渠道访谈、口译及信息核验', '重点市场实地核验差旅', '企业信用、登记及付款风险查询'],
  reserve: ['汇率及跨境付款成本超支', '机票、住宿价格超支', '运输、税费及样品补寄超支', '应急修复或有效项目追加测试'],
}

const STATUS = {
  paid: { label: '已支付', color: 'green' },
  pending: { label: '待付款', color: 'orange' },
  reimbursing: { label: '报销中', color: 'blue' },
}

const emptyExpense = () => ({ id: null, category_id: '', expense_date: new Date().toISOString().slice(0, 10), item: '', amount: '', vendor: '', payment_status: 'paid', invoice_no: '', owner: '', receipt_url: '', notes: '' })
const emptyBudget = () => ({ id: null, name: '', q2: '', q3: '', q4: '' })
const money = (n) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(Number(n || 0))
const wan = (n) => `${(Number(n || 0) / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 1 })} 万`
const pct = (used, budget) => budget > 0 ? (used / budget) * 100 : 0
const quarter = (date) => {
  const month = Number(String(date || '').slice(5, 7))
  if (month >= 4 && month <= 6) return 'Q2'
  if (month >= 7 && month <= 9) return 'Q3'
  if (month >= 10 && month <= 12) return 'Q4'
  return '其他'
}

export default function MarketingExpenses() {
  const { profile } = useAuth()
  const [year, setYear] = useState(2027)
  const [categories, setCategories] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expenseModal, setExpenseModal] = useState(false)
  const [budgetModal, setBudgetModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState(emptyExpense())
  const [budgetForm, setBudgetForm] = useState(emptyBudget())
  const [saving, setSaving] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [{ data: cats, error: catError }, { data: rows, error: expenseError }] = await Promise.all([
      supabase.from('marketing_budget_categories').select('*').eq('year', year).order('sort_order'),
      supabase.from('marketing_expenses').select('*').order('expense_date', { ascending: false }).order('created_at', { ascending: false }),
    ])
    if (catError || expenseError) setError(catError?.message || expenseError?.message || '加载失败')
    setCategories(cats || [])
    const ids = new Set((cats || []).map((c) => c.id))
    setExpenses((rows || []).filter((r) => ids.has(r.category_id)))
    setLoading(false)
  }, [year])
  useEffect(() => { load() }, [load])

  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const totalBudget = useMemo(() => categories.reduce((s, c) => s + Number(c.q2_budget) + Number(c.q3_budget) + Number(c.q4_budget), 0), [categories])
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses])
  const pendingAmount = useMemo(() => expenses.filter((e) => e.payment_status !== 'paid').reduce((s, e) => s + Number(e.amount), 0), [expenses])
  const usage = pct(totalSpent, totalBudget)

  const quarterData = useMemo(() => ['Q2', 'Q3', 'Q4'].map((q) => ({
    quarter: q,
    budget: categories.reduce((s, c) => s + Number(c[`${q.toLowerCase()}_budget`] || 0), 0) / 10000,
    actual: expenses.filter((e) => quarter(e.expense_date) === q).reduce((s, e) => s + Number(e.amount), 0) / 10000,
  })), [categories, expenses])

  const categoryRows = useMemo(() => categories.map((c) => {
    const budget = Number(c.q2_budget) + Number(c.q3_budget) + Number(c.q4_budget)
    const actual = expenses.filter((e) => e.category_id === c.id).reduce((s, e) => s + Number(e.amount), 0)
    return { ...c, budget, actual, usage: pct(actual, budget) }
  }), [categories, expenses])

  const filteredExpenses = useMemo(() => expenses.filter((e) => {
    if (categoryFilter !== 'all' && e.category_id !== categoryFilter) return false
    if (statusFilter !== 'all' && e.payment_status !== statusFilter) return false
    const haystack = `${e.item} ${e.vendor || ''} ${e.invoice_no || ''} ${e.owner || ''}`.toLowerCase()
    return !query.trim() || haystack.includes(query.trim().toLowerCase())
  }), [expenses, categoryFilter, statusFilter, query])

  function openExpense(row = null) {
    setExpenseForm(row ? { ...row, amount: String(row.amount) } : { ...emptyExpense(), category_id: categories[0]?.id || '' })
    setExpenseModal(true)
  }
  function openBudget(c) {
    setBudgetForm({ id: c.id, name: c.name, q2: Number(c.q2_budget) / 10000, q3: Number(c.q3_budget) / 10000, q4: Number(c.q4_budget) / 10000 })
    setBudgetModal(true)
  }

  async function saveExpense(e) {
    e?.preventDefault()
    if (!expenseForm.category_id || !expenseForm.expense_date || !expenseForm.item.trim() || Number(expenseForm.amount) < 0 || expenseForm.amount === '') return alert('请完整填写项目、日期、费用明细和金额')
    setSaving(true)
    const payload = {
      category_id: expenseForm.category_id, expense_date: expenseForm.expense_date, item: expenseForm.item.trim(), amount: Number(expenseForm.amount),
      vendor: expenseForm.vendor.trim() || null, payment_status: expenseForm.payment_status, invoice_no: expenseForm.invoice_no.trim() || null,
      owner: expenseForm.owner.trim() || null, receipt_url: expenseForm.receipt_url.trim() || null, notes: expenseForm.notes.trim() || null,
      created_by: expenseForm.id ? undefined : profile?.email || null,
    }
    if (expenseForm.id) delete payload.created_by
    const { error: saveError } = expenseForm.id
      ? await supabase.from('marketing_expenses').update(payload).eq('id', expenseForm.id)
      : await supabase.from('marketing_expenses').insert(payload)
    setSaving(false)
    if (saveError) return alert(`保存失败：${saveError.message}`)
    setExpenseModal(false); load()
  }

  async function saveBudget(e) {
    e?.preventDefault()
    const values = [budgetForm.q2, budgetForm.q3, budgetForm.q4].map(Number)
    if (values.some((v) => Number.isNaN(v) || v < 0)) return alert('季度预算不能小于 0')
    setSaving(true)
    const { error: saveError } = await supabase.from('marketing_budget_categories').update({ q2_budget: values[0] * 10000, q3_budget: values[1] * 10000, q4_budget: values[2] * 10000 }).eq('id', budgetForm.id)
    setSaving(false)
    if (saveError) return alert(`保存失败：${saveError.message}`)
    setBudgetModal(false); load()
  }

  async function removeExpense(row) {
    if (!window.confirm(`确定删除费用记录「${row.item}」？删除后预算占用会立即减少。`)) return
    const { error: removeError } = await supabase.from('marketing_expenses').delete().eq('id', row.id)
    if (removeError) return alert(`删除失败：${removeError.message}`)
    load()
  }

  return (
    <div>
      <PageHeader icon={<WalletCards size={26} />} title="营销费用" subtitle="逐笔记录营销支出，查看预算使用率和季度执行进度"
        actions={<><select className={`${inputClass} w-auto`} value={year} onChange={(e) => setYear(Number(e.target.value))}><option value={2027}>2027 年</option></select><Button variant="primary" onClick={() => openExpense()}><Plus size={16} /> 记一笔费用</Button></>} />

      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">费用表尚未就绪：{error}</div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<PiggyBank size={22} />} label="年度预算" value={wan(totalBudget)} sub="规划基线 500 万元，可调整" />
        <StatCard icon={<CircleDollarSign size={22} />} label="已录入费用" value={wan(totalSpent)} sub={`${expenses.length} 笔，含待付款和报销中`} />
        <StatCard icon={<WalletCards size={22} />} label="剩余预算" value={wan(totalBudget - totalSpent)} sub={`待付款 / 报销中 ${wan(pendingAmount)}`} />
        <StatCard icon={<Gauge size={22} />} label="预算使用率" value={`${usage.toFixed(1)}%`} sub={usage > 100 ? `超预算 ${wan(totalSpent - totalBudget)}` : `还可使用 ${wan(totalBudget - totalSpent)}`} />
      </div>

      <Card className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">年度预算进度</span><span className={usage > 100 ? 'font-semibold text-red-600' : 'font-semibold text-brand-600'}>{money(totalSpent)} / {money(totalBudget)}</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${usage > 100 ? 'bg-red-500' : usage > 85 ? 'bg-orange-500' : 'bg-brand-600'}`} style={{ width: `${Math.min(usage, 100)}%` }} /></div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_1.95fr]">
        <Card>
          <div className="mb-4 font-semibold text-slate-800">季度预算与实际</div>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={quarterData} margin={{ top: 5, right: 5, left: -12, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="quarter" /><YAxis unit="万" /><Tooltip formatter={(v) => [`${Number(v).toFixed(1)} 万元`]} /><Legend /><Bar dataKey="budget" name="预算" fill="#94a3b8" radius={[6, 6, 0, 0]} /><Bar dataKey="actual" name="已录入" fill="#3b6ef6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><div className="font-semibold text-slate-800">项目预算执行</div><div className="text-xs text-slate-400">点击“调预算”修改各季度额度</div></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-4 py-3 font-medium">项目</th><th className="px-4 py-3 font-medium">预算</th><th className="px-4 py-3 font-medium">已录入</th><th className="px-4 py-3 font-medium">使用率</th><th className="px-4 py-3 font-medium text-right">操作</th></tr></thead><tbody>{categoryRows.map((c) => <tr key={c.id} className="border-b border-slate-50"><td className="px-4 py-3 font-medium text-slate-700">{c.name}</td><td className="px-4 py-3 text-slate-500">{wan(c.budget)}</td><td className="px-4 py-3 text-slate-700">{wan(c.actual)}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${c.usage > 100 ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(c.usage, 100)}%` }} /></div><span className={c.usage > 100 ? 'text-red-600' : 'text-slate-500'}>{c.usage.toFixed(1)}%</span></div></td><td className="px-4 py-3 text-right"><button onClick={() => openBudget(c)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-brand-600 hover:bg-brand-50"><SlidersHorizontal size={13} />调预算</button></td></tr>)}</tbody></table></div>
        </Card>
      </div>

      <Card className="mt-4 p-0 overflow-hidden">
        <div className="border-b border-slate-100 p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-semibold text-slate-800">费用明细</div><div className="text-xs text-slate-400">当前筛选 {filteredExpenses.length} 笔，共 {money(filteredExpenses.reduce((s, e) => s + Number(e.amount), 0))}</div></div><Button variant="primary" onClick={() => openExpense()}><Plus size={16} />记一笔费用</Button></div><div className="mt-4 grid gap-2 md:grid-cols-[1fr_220px_160px]"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索费用明细、供应商、票据号或经办人" /></div><select className={inputClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">全部项目</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">全部状态</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div></div>
        {loading ? <div className="py-16 text-center text-slate-400">加载中…</div> : filteredExpenses.length === 0 ? <EmptyState icon={<ReceiptText size={30} />} title="暂无费用记录" hint="点击“记一笔费用”，录入后看板和预算使用率会自动更新。" /> : <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-4 py-3 font-medium">日期</th><th className="px-4 py-3 font-medium">项目 / 明细</th><th className="px-4 py-3 font-medium">供应商</th><th className="px-4 py-3 font-medium">金额</th><th className="px-4 py-3 font-medium">状态</th><th className="px-4 py-3 font-medium">票据 / 经办人</th><th className="px-4 py-3 font-medium text-right">操作</th></tr></thead><tbody>{filteredExpenses.map((e) => { const st = STATUS[e.payment_status] || STATUS.paid; return <tr key={e.id} className="border-b border-slate-50"><td className="px-4 py-3 text-slate-500">{e.expense_date}<div className="text-[11px] text-slate-300">{quarter(e.expense_date)}</div></td><td className="px-4 py-3"><div className="font-medium text-slate-700">{e.item}</div><div className="mt-0.5 text-xs text-slate-400">{categoryMap[e.category_id]?.name || '未分类'}{e.notes ? ` · ${e.notes}` : ''}</div></td><td className="px-4 py-3 text-slate-500">{e.vendor || '—'}</td><td className="px-4 py-3 font-semibold text-slate-800">{money(e.amount)}</td><td className="px-4 py-3"><Badge color={st.color}>{st.label}</Badge></td><td className="px-4 py-3 text-xs text-slate-500"><div>{e.invoice_no || '无票据号'}</div><div className="text-slate-400">{e.owner || '未填经办人'}</div>{e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">查看凭证</a>}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => openExpense(e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil size={14} /></button><button onClick={() => removeExpense(e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button></div></td></tr> })}</tbody></table></div>}
      </Card>

      <Modal open={expenseModal} onClose={() => !saving && setExpenseModal(false)} title={expenseForm.id ? '编辑费用' : '记一笔费用'} footer={<><Button onClick={() => setExpenseModal(false)} disabled={saving}>取消</Button><Button variant="primary" onClick={saveExpense} disabled={saving}>{saving ? '保存中…' : '保存'}</Button></>}>
        <form onSubmit={saveExpense} className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="预算项目 *"><select className={inputClass} value={expenseForm.category_id} onChange={(e) => setExpenseForm({ ...expenseForm, category_id: e.target.value, item: '' })}><option value="">请选择</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field></div>
          <div className="col-span-2"><Field label="费用明细 *"><input list="marketing-expense-items" className={inputClass} value={expenseForm.item} onChange={(e) => setExpenseForm({ ...expenseForm, item: e.target.value })} placeholder="选择规划科目或直接输入" /><datalist id="marketing-expense-items">{(CATEGORY_ITEMS[categoryMap[expenseForm.category_id]?.code] || []).map((x) => <option key={x} value={x} />)}</datalist></Field></div>
          <Field label="发生日期 *"><input type="date" className={inputClass} value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} /></Field>
          <Field label="金额（元）*"><input type="number" min="0" step="0.01" className={inputClass} value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="例如 12500" /></Field>
          <Field label="付款状态"><select className={inputClass} value={expenseForm.payment_status} onChange={(e) => setExpenseForm({ ...expenseForm, payment_status: e.target.value })}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
          <Field label="供应商"><input className={inputClass} value={expenseForm.vendor} onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })} /></Field>
          <Field label="票据 / 合同号"><input className={inputClass} value={expenseForm.invoice_no} onChange={(e) => setExpenseForm({ ...expenseForm, invoice_no: e.target.value })} /></Field>
          <Field label="经办人"><input className={inputClass} value={expenseForm.owner} onChange={(e) => setExpenseForm({ ...expenseForm, owner: e.target.value })} /></Field>
          <div className="col-span-2"><Field label="凭证链接"><input className={inputClass} value={expenseForm.receipt_url} onChange={(e) => setExpenseForm({ ...expenseForm, receipt_url: e.target.value })} placeholder="网盘、审批单或发票链接" /></Field></div>
          <div className="col-span-2"><Field label="备注"><textarea rows={2} className={inputClass} value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} /></Field></div>
        </form>
      </Modal>

      <Modal open={budgetModal} onClose={() => !saving && setBudgetModal(false)} title={`调整预算 · ${budgetForm.name}`} footer={<><Button onClick={() => setBudgetModal(false)} disabled={saving}>取消</Button><Button variant="primary" onClick={saveBudget} disabled={saving}>{saving ? '保存中…' : '保存预算'}</Button></>}>
        <form onSubmit={saveBudget} className="space-y-3"><p className="text-sm text-slate-500">单位：人民币万元。年度预算将按三个季度自动合计。</p><Field label="Q2（4—6月）"><input type="number" min="0" step="0.01" className={inputClass} value={budgetForm.q2} onChange={(e) => setBudgetForm({ ...budgetForm, q2: e.target.value })} /></Field><Field label="Q3（7—9月）"><input type="number" min="0" step="0.01" className={inputClass} value={budgetForm.q3} onChange={(e) => setBudgetForm({ ...budgetForm, q3: e.target.value })} /></Field><Field label="Q4（10—12月）"><input type="number" min="0" step="0.01" className={inputClass} value={budgetForm.q4} onChange={(e) => setBudgetForm({ ...budgetForm, q4: e.target.value })} /></Field><div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">调整后年度预算：<strong>{(Number(budgetForm.q2 || 0) + Number(budgetForm.q3 || 0) + Number(budgetForm.q4 || 0)).toLocaleString('zh-CN')} 万元</strong></div></form>
      </Modal>
    </div>
  )
}

