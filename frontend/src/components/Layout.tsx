import { Outlet } from 'react-router-dom'
import { Layout as AntLayout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

const { Sider, Content } = AntLayout

const NAV_ITEMS = [
  {
    key: '/dashboard',
    label: '数据概览',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: '/funds',
    label: '产品货架',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    ),
  },
  {
    key: '/clients',
    label: '客户管理',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems: MenuProps['items'] = NAV_ITEMS.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }))

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        width={200}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          background: 'oklch(0.965 0.007 80)',
          borderRight: '1px solid oklch(0.9 0.005 80)',
        }}
      >
        <div
          style={{
            padding: '20px 20px 24px',
            fontSize: 15,
            fontWeight: 600,
            color: 'oklch(0.22 0.008 80)',
            letterSpacing: '-0.01em',
          }}
        >
          基金销售管理
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none' }}
        />
      </Sider>
      <AntLayout style={{ marginLeft: 200 }}>
        <Content style={{ padding: 32, background: 'oklch(0.985 0.006 80)', minHeight: '100vh' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
