import { useState } from 'react'
import { Table, Input, Select, Tag, Typography, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useFunds } from '../hooks/useFunds'
import { useUIStore } from '../stores/uiStore'
import { formatAmount, formatNav } from '../utils/format'
import FundDetailDrawer from '../components/FundDetailDrawer'
import type { Fund, FundType, FundStatus } from '../types'

const { Text } = Typography

const STATUS_COLOR: Record<string, string> = {
  运作中: 'green',
  募集中: 'blue',
  已清盘: 'default',
}

const TYPE_OPTIONS = [
  { label: '全部类型', value: '' },
  { label: '股票型', value: '股票型' },
  { label: '债券型', value: '债券型' },
  { label: '混合型', value: '混合型' },
  { label: '货币型', value: '货币型' },
  { label: '指数型', value: '指数型' },
]

const STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '募集中', value: '募集中' },
  { label: '运作中', value: '运作中' },
  { label: '已清盘', value: '已清盘' },
]

export default function FundsListPage() {
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState<FundType | ''>('')
  const [status, setStatus] = useState<FundStatus | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useFunds({
    keyword,
    type: type || undefined,
    status: status || undefined,
    page,
    pageSize: 10,
  })

  const { openFundDrawer } = useUIStore()

  const funds = data?.data?.list ?? []
  const pagination = data?.data?.pagination

  const columns: ColumnsType<Fund> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v) => <span style={{ fontSize: 12, color: 'oklch(0.45 0.006 80)' }}>{v}</span>,
    },
    {
      title: '最新净值',
      dataIndex: 'nav',
      key: 'nav',
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{formatNav(v)}</span>,
    },
    {
      title: '当前规模',
      dataIndex: 'currentScale',
      key: 'currentScale',
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v ? formatAmount(v) : '—'}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <a
          style={{ color: 'oklch(0.52 0.08 240)', fontSize: 13, cursor: 'pointer' }}
          onClick={() => openFundDrawer(record.id)}
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
          产品货架
        </h1>
      </div>

      {/* 工具栏 */}
      <Space style={{ marginBottom: 20 }}>
        <Input.Search
          placeholder="搜索产品名称或基金经理..."
          allowClear
          style={{ width: 260 }}
          onSearch={(v) => { setKeyword(v); setPage(1) }}
          onChange={(e) => { if (!e.target.value) { setKeyword(''); setPage(1) } }}
        />
        <Select
          options={TYPE_OPTIONS}
          value={type}
          onChange={(v) => { setType(v); setPage(1) }}
          style={{ width: 130 }}
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
          style={{ width: 120 }}
        />
      </Space>

      {/* 表格 */}
      <Table
        dataSource={funds}
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
        locale={{ emptyText: '暂无产品数据' }}
      />

      {/* 产品详情 Drawer */}
      <FundDetailDrawer />
    </div>
  )
}
