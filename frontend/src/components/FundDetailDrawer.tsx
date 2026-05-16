import { Drawer, Tag, Descriptions, Table, Spin, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useFundDetail } from '../hooks/useFunds'
import { useUIStore } from '../stores/uiStore'
import { formatAmount, formatPercent, formatNav, formatDate } from '../utils/format'
import type { FundHolder } from '../types'

const { Text } = Typography

const STATUS_COLOR: Record<string, string> = {
  运作中: 'green',
  募集中: 'blue',
  已清盘: 'default',
}

const RISK_COLOR: Record<string, string> = {
  R1: 'green',
  R2: 'cyan',
  R3: 'gold',
  R4: 'orange',
  R5: 'red',
}

const holderColumns: ColumnsType<FundHolder> = [
  { title: '客户', dataIndex: 'clientName', key: 'clientName', render: (v) => <Text strong>{v}</Text> },
  {
    title: '等级',
    dataIndex: 'tier',
    key: 'tier',
    render: (v) => <Tag>{v}</Tag>,
  },
  {
    title: '持有金额',
    dataIndex: 'amount',
    key: 'amount',
    render: (v) => formatAmount(v),
  },
  {
    title: '买入日期',
    dataIndex: 'buyDate',
    key: 'buyDate',
    render: (v) => formatDate(v),
  },
  {
    title: '收益率',
    dataIndex: 'returnRate',
    key: 'returnRate',
    render: (v) => (
      <Text style={{ color: v >= 0 ? 'oklch(0.45 0.12 155)' : 'oklch(0.5 0.12 25)', fontWeight: 500 }}>
        {formatPercent(v)}
      </Text>
    ),
  },
]

export default function FundDetailDrawer() {
  const { fundDrawerOpen, selectedFundId, closeFundDrawer } = useUIStore()
  const { data, isLoading } = useFundDetail(selectedFundId)

  const fund = data?.data?.fund
  const holders = data?.data?.holders ?? []

  return (
    <Drawer
      open={fundDrawerOpen}
      onClose={closeFundDrawer}
      styles={{ body: { padding: 32 }, wrapper: { width: 520 } }}
      closeIcon={null}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spin size="large" />
        </div>
      ) : fund ? (
        <>
          {/* 标题 + badges */}
          <div style={{ marginBottom: 24, paddingRight: 32 }}>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
              {fund.name}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag color={STATUS_COLOR[fund.status] ?? 'default'}>{fund.status}</Tag>
              <Tag color={RISK_COLOR[fund.riskLevel] ?? 'default'}>{fund.riskLevel} 风险</Tag>
            </div>
          </div>

          {/* 基本信息 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'oklch(0.6 0.005 80)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid oklch(0.9 0.005 80)' }}>
              基本信息
            </div>
            <Descriptions column={2} size="small" styles={{ label: { color: 'oklch(0.6 0.005 80)', fontSize: 12 }, content: { fontWeight: 500, fontSize: 14 } }}>
              <Descriptions.Item label="产品类型">{fund.type}</Descriptions.Item>
              <Descriptions.Item label="基金经理">{fund.fundManager}</Descriptions.Item>
              <Descriptions.Item label="成立日期">{formatDate(fund.establishDate)}</Descriptions.Item>
              <Descriptions.Item label="最低认购">{formatAmount(fund.minInvestment)}</Descriptions.Item>
              <Descriptions.Item label="最新净值">{formatNav(fund.nav)}</Descriptions.Item>
              <Descriptions.Item label="成立净值">{formatNav(fund.establishNav)}</Descriptions.Item>
              <Descriptions.Item label="成立以来总回报">
                <Text style={{ color: fund.totalReturn >= 0 ? 'oklch(0.45 0.12 155)' : 'oklch(0.5 0.12 25)', fontWeight: 500 }}>
                  {formatPercent(fund.totalReturn)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="年化收益">
                <Text style={{ color: fund.annualReturn >= 0 ? 'oklch(0.45 0.12 155)' : 'oklch(0.5 0.12 25)', fontWeight: 500 }}>
                  {formatPercent(fund.annualReturn)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="成立规模">{formatAmount(fund.totalScale)}</Descriptions.Item>
              <Descriptions.Item label="当前规模">{formatAmount(fund.currentScale)}</Descriptions.Item>
            </Descriptions>
            {fund.description && (
              <div style={{ marginTop: 12, fontSize: 13, color: 'oklch(0.45 0.006 80)', lineHeight: 1.6 }}>
                {fund.description}
              </div>
            )}
          </div>

          {/* 持有人 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'oklch(0.6 0.005 80)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid oklch(0.9 0.005 80)' }}>
              持有人
            </div>
            <Table
              dataSource={holders}
              columns={holderColumns}
              rowKey="clientId"
              size="small"
              pagination={false}
              locale={{ emptyText: '暂无持有人' }}
            />
          </div>
        </>
      ) : null}
    </Drawer>
  )
}
