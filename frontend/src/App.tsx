import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppLayout from './components/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import FundsListPage from './pages/FundsListPage'
import ClientsListPage from './pages/ClientsListPage'

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#5b7cff',
          colorBgLayout: '#faf9f7',
          colorText: '#2a2825',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        },
        components: {
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'oklch(0.94 0.025 240)',
            itemSelectedColor: 'oklch(0.52 0.08 240)',
          },
        },
      }}
    >
      <Routes>
        {/* 首页：无侧边栏 */}
        <Route path="/" element={<HomePage />} />

        {/* 功能页：带侧边栏 Layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/funds" element={<FundsListPage />} />
          <Route path="/clients" element={<ClientsListPage />} />
        </Route>

        {/* 未匹配路由重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  )
}
