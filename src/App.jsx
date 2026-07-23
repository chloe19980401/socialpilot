import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Brands from './pages/Brands'
import Content from './pages/Content'
import Calendar from './pages/Calendar'
import Kol from './pages/Kol'
import Ecommerce from './pages/Ecommerce'
import Competitors from './pages/Competitors'
import Performance from './pages/Performance'
import Settings from './pages/Settings'

function Protected({ children }) {
  const { session, loading } = useAuth()
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        加载中…
      </div>
    )
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/content" element={<Content />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/logs" element={<Kol />} />
        <Route path="/trends" element={<Ecommerce />} />
        <Route path="/competitors" element={<Competitors />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
