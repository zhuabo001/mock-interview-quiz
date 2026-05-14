import { useState } from 'react'
import { Table, Input, Select, Tag, Typography, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useClients } from '../hooks/useClients'
import { useUIStore } from '../stores/uiStore'
import { formatAmount } from '../utils/format'
import ClientDetailDrawer from '../components/ClientDetailDrawer'
import type { Client, ClientTier } from '../types'

const { Text } = Typography

const TIER_COLOR: Record<string, string> = {
  钻石: 'purple',
  金: 'gold',
  银: 'default',
  铜: 'orange',
  潜客: 'default',
}

const TIER_OPTIONS = [
  { label: '全部等级', value: '' },
  { label: '钻石', value: '钻石' },
  { label: '金', value: '金' },
  { label: '银', value: '银' },
  { label: '铜', value: '铜' },
  { label: '潜客', value: '潜客' },
]

export default function ClientsListPage() {
  const [keyword, setKeyword] = useState('')
  const [tier, setTier] = useState<ClientTier | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useClients({
    keyword,
    tier: tier || undefined,
    page,
    pageSize: 10,
  })

  const { openClientDrawer } = useUIStore()

  const clients = data?.data?.list ?? []
  const pagination = data?.data?.pagination

  const columns: ColumnsType<Client> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '等级',
      dataIndex: 'tier',
      key: 'tier',
      render: (v) => <Tag color={TIER_COLOR[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: '在管资产',
      dataIndex: 'totalAssets',
      key: 'totalAssets',
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatAmount(v)}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <a
          style={{ color: 'oklch(0.52 0.08 240)', fontSize: 13, cursor: 'pointer' }}
          onClick={() => openClientDrawer(record.id)}
        >
          查看
        </a>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', margin: 0, color: 'oklch(0.22 0.008 80)' }}>
          客户管理
        </h1>
      </div>

      {/* 工具栏 */}
      <Space style={{ marginBottom: 20 }}>
        <Input.Search
          placeholder="搜索客户姓名或公司..."
          allowClear
          style={{ width: 260 }}
          onSearch={(v) => { setKeyword(v); setPage(1) }}
          onChange={(e) => { if (!e.target.value) { setKeyword(''); setPage(1) } }}
        />
        <Select
          options={TIER_OPTIONS}
          value={tier}
          onChange={(v) => { setTier(v); setPage(1) }}
          style={{ width: 130 }}
        />
      </Space>

      {/* 表格 */}
      <Table
        dataSource={clients}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 10,
          total: pagination?.total ?? 0,
          onChange: (p) => setPage(p),
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: false,
        }}
        style={{ background: 'white', borderRadius: 6 }}
        locale={{ emptyText: '暂无客户数据' }}
      />

      {/* 客户详情 Drawer */}
      <ClientDetailDrawer />
    </div>
  )
}
