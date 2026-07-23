import { useEffect, useMemo, useState } from 'react'
import { Globe, RefreshCw, KeyRound, Link2, Plus, Pencil, Trash2, Link as LinkIcon, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { syncAll } from '../lib/sync'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Modal, Field, inputClass, EmptyState } from '../components/ui/Common'
import { platformMeta, PLATFORMS } from '../lib/platforms'
import { compactCN } from '../lib/format'

export default function Brands() {
  const [brands, setBrands] = useState([])
  const [accounts, setAccounts] = useState([])
  const [socials, setSocials] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [syncing, setSyncing] = useState(false)

  async function autoBind() {
    setSyncing(true)
    try {
      const res = await syncAll('accounts')
      const failed = res.filter((r) => r.error)
      if (failed.length) alert('部分平台未配置或失败：\n' + failed.map((f) => `${f.platform}: ${f.error}`).join('\n'))
      await load()
    } catch (e) {
      alert('同步失败：' + (e.message || e))
    } finally {
      setSyncing(false)
    }
  }

  async function load() {
    setLoading(true)
    const [{ data: br }, { data: acc }, { data: soc }] = await Promise.all([
      supabase.from('brands').select('*').order('created_at'),
      supabase.from('accounts').select('id, brand_id, followers, connected'),
      supabase.from('brand_socials').select('*'),
    ])
    setBrands(br || [])
    setAccounts(acc || [])
    setSocials(soc || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const stats = useMemo(() => ({
    brands: brands.length,
    accounts: accounts.length,
    connected: accounts.filter((a) => a.connected).length,
  }), [brands, accounts])

  async function createBrand(e) {
    e.preventDefault()
    if (!form.name) return
    await supabase.from('brands').insert({ name: form.name, slug: form.slug || form.name.toLowerCase() })
    setModal(false)
    setForm({ name: '', slug: '' })
    load()
  }

  async function removeBrand(id) {
    if (!confirm('确定删除该品牌？')) return
    await supabase.from('brands').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <PageHeader
        icon={<Globe size={28} />}
        title="品牌管理"
        subtitle="创建品牌、配置官方社媒账号链接，点击「自动绑定社媒链接」自动抓取真实数据"
        actions={
          <>
            <Button onClick={load}><RefreshCw size={16} /> 刷新</Button>
            <Button><KeyRound size={16} /> 更新 API Token</Button>
            <Button onClick={autoBind} disabled={syncing}><Link2 size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? '同步中…' : '自动绑定社媒链接'}</Button>
            <Button variant="primary" onClick={() => setModal(true)}><Plus size={16} /> 创建品牌</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Globe size={20} />} value={stats.brands} label="品牌数量" />
        <StatCard icon={<LinkIcon size={20} />} value={stats.accounts} label="绑定账号" />
        <StatCard icon={<CheckCircle2 size={20} />} value={stats.connected} label="已连接" />
      </div>

      {brands.length === 0 ? (
        <Card>
          <EmptyState icon={<Globe size={28} />} title={loading ? '加载中…' : '还没有品牌'} hint="点击右上角「创建品牌」开始" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {brands.map((b) => {
            const acc = accounts.filter((a) => a.brand_id === b.id)
            const soc = socials.filter((s) => s.brand_id === b.id)
            return (
              <Card key={b.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ background: b.color || '#3b6ef6' }}>
                      {b.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{b.name}</div>
                      <div className="text-sm text-slate-400">/{b.slug}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button className="hover:text-slate-600"><Pencil size={18} /></button>
                    <button className="hover:text-red-500" onClick={() => removeBrand(b.id)}><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="mt-4 flex gap-8">
                  <div><div className="text-xl font-bold text-slate-900">{acc.length}</div><div className="text-xs text-slate-400">绑定账号</div></div>
                  <div><div className="text-xl font-bold text-green-600">{acc.filter((a) => a.connected).length}</div><div className="text-xs text-slate-400">已连接</div></div>
                  <div><div className="text-xl font-bold text-slate-900">{compactCN(acc.reduce((s, a) => s + (a.followers || 0), 0))}</div><div className="text-xs text-slate-400">总粉丝</div></div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="mb-2 text-sm font-medium text-slate-600">官方社媒账号</div>
                  <div className="flex flex-wrap gap-2">
                    {soc.length === 0 && <span className="text-xs text-slate-300">暂无链接</span>}
                    {soc.map((s) => {
                      const meta = platformMeta(s.platform)
                      const { Icon } = meta
                      return (
                        <span key={s.id} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                          <Icon size={14} style={{ color: meta.color }} /> {meta.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="创建品牌"
        footer={
          <>
            <Button onClick={() => setModal(false)}>取消</Button>
            <Button variant="primary" onClick={createBrand}>创建</Button>
          </>
        }
      >
        <form onSubmit={createBrand} className="space-y-4">
          <Field label="品牌名称">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如 VIRTAVO" />
          </Field>
          <Field label="标识 (slug)">
            <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="virtavo" />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
