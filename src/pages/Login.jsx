import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Compass } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { inputClass } from '../components/ui/Common'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isSupabaseConfigured) {
      setError('尚未配置 Supabase。请在 .env.local 填入 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。')
      return
    }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('登录失败：' + error.message)
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-cyan-400">
            <Compass size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SocialPilot AI</h1>
          <p className="mt-1 text-sm text-slate-400">社媒发布智能管理平台</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-7 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">登录账号</h2>
          <p className="mt-1 text-sm text-slate-400">使用你的管理员或协作者账号登录</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">密码</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? '登录中…' : '登录'}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            账号由管理员创建，用户不能自行注册
          </p>
        </form>
      </div>
    </div>
  )
}
