import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  {
    path: '/dashboard',
    title: '数据概览',
    sub: '产品规模分布、跟进趋势、核心业务指标一览',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/funds',
    title: '产品货架',
    sub: '查阅在售基金产品，按类型、状态筛选，查看产品详情及持有人',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <path d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    ),
  },
  {
    path: '/clients',
    title: '客户管理',
    sub: '维护客户信息，查看持仓关联，记录跟进动态',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        background: 'oklch(0.985 0.006 80)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 12px', color: 'oklch(0.22 0.008 80)' }}>
            基金销售管理工具
          </h1>
          <p style={{ fontSize: 15, color: 'oklch(0.45 0.006 80)', lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
            为渠道销售团队打造的内部工具。集中管理基金产品信息、客户关系和跟进记录，快速查询持仓关联，通过数据概览把握业务全貌。
          </p>
        </div>

        {/* Nav cards */}
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '20px 24px',
                    background: 'white',
                    border: '1px solid oklch(0.9 0.005 80)',
                    borderRadius: 6,
                    boxShadow: '0 1px 2px oklch(0.2 0.005 80 / 0.06)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s ease-out, box-shadow 0.15s ease-out',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(0.82 0.02 240)'
                    e.currentTarget.style.boxShadow = '0 2px 8px oklch(0.2 0.005 80 / 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(0.9 0.005 80)'
                    e.currentTarget.style.boxShadow = '0 1px 2px oklch(0.2 0.005 80 / 0.06)'
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 4,
                      background: 'oklch(0.94 0.025 240)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'oklch(0.52 0.08 240)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'oklch(0.22 0.008 80)', marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'oklch(0.6 0.005 80)', lineHeight: 1.5 }}>
                      {item.sub}
                    </div>
                  </div>
                  <span style={{ color: 'oklch(0.6 0.005 80)', marginTop: 2, flexShrink: 0 }}>→</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <footer style={{ marginTop: 48, fontSize: 12, color: 'oklch(0.6 0.005 80)' }}>
          内部系统，仅限授权人员使用
        </footer>
      </div>
    </div>
  )
}
