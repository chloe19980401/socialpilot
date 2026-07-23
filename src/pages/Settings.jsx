import { useEffect, useState } from 'react'
import { Users, Bell, Send, KeyRound, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { Button, Badge, Modal, Field, inputClass } from '../components/ui/Common'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { key: 'users', label: '用户管理', Icon: Users },
  { key: 'notify', label: '通知设置', Icon: Bell },
  { key: 'publish', label: '发布默认', Icon: Send },
  { key: 'api', label: 'API集成', Icon: KeyRound },
]

export default function Settings() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'operator' })

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setUsers(data || [])
  }
  useEffect(() => { loadUsers() }, [])

  async function createUser(e) {
    e.preventDefault()
    if (!form.email) return
    // 注意：仅写入资料表。真正的登录账号需管理员通过 Supabase 后台 / 服务端接口创建（见 README）
    await supabase.from('profiles').insert({ name: form.name || form.email.split('@')[0], email: form.email, role: form.role })
    setModal(false)
    setForm({ name: '', email: '', role: 'operator' })
    loadUsers()
  }

  return (
    <div>
      <PageHeader title="设置" subtitle="管理您的账号、团队和偏好设置" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-2">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                tab === key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </Card>

        <Card>
          {tab === 'users' && (
            <>
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Users size={20} /> 用户管理</div>
              <p className="mt-1 text-sm text-slate-400">管理员可创建账号、设置密码和权限，用户不能自行注册</p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                    {(profile?.name || 'C')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{profile?.name}</div>
                    <div className="text-sm text-slate-400">{profile?.email}</div>
                  </div>
                  <Badge color="blue">{profile?.role === 'admin' ? '管理员' : '协作者'}</Badge>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-slate-800">账号列表</div>
                  <div className="text-sm text-slate-400">所有用户由管理员创建，用户不可自行注册</div>
                </div>
                <Button variant="primary" onClick={() => setModal(true)}><UserPlus size={16} /> 创建账号</Button>
              </div>

              <div className="mt-4 space-y-2">
                {users.length === 0 && <div className="py-6 text-center text-sm text-slate-400">暂无其他账号</div>}
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">{(u.name || u.email)[0].toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                    <Badge color={u.role === 'admin' ? 'blue' : 'slate'}>{u.role === 'admin' ? '管理员' : '协作者'}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'notify' && <Placeholder icon={<Bell size={20} />} title="通知设置" desc="配置发布提醒、数据异常预警等通知偏好" />}
          {tab === 'publish' && <Placeholder icon={<Send size={20} />} title="发布默认" desc="设置默认发布平台、默认运营、内容模板等" />}
          {tab === 'api' && <Placeholder icon={<KeyRound size={20} />} title="API集成" desc="管理第三方平台 API Token 与数据抓取密钥" />}
        </Card>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="创建账号"
        footer={<><Button onClick={() => setModal(false)}>取消</Button><Button variant="primary" onClick={createUser}>创建</Button></>}
      >
        <form onSubmit={createUser} className="space-y-4">
          <Field label="姓名"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="邮箱"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" /></Field>
          <Field label="角色">
            <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="operator">协作者</option>
              <option value="admin">管理员</option>
            </select>
          </Field>
          <p className="text-xs text-slate-400">提示：此处仅写入用户资料。真正可登录的密码账号需管理员在 Supabase 后台或服务端接口创建（详见 README）。</p>
        </form>
      </Modal>
    </div>
  )
}

function Placeholder({ icon, title, desc }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">{icon} {title}</div>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">此模块占位，可按需扩展</div>
    </div>
  )
}
