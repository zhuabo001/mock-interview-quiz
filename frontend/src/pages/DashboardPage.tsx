import { Row, Col, Card, Statistic, Spin } from 'antd'
import { Pie, Line } from '@ant-design/charts'
import { useDashboardOverview, useScaleByType, useFollowupTrend } from '../hooks/useDashboard'
import { formatAmount } from '../utils/format'
import type { FollowUpTrendItem } from '../types'

const PIE_COLORS = [
  '#5b7cff',
  '#4db8e8',
  '#52c41a',
  '#faad14',
  '#a0a0a0',
]

export default function DashboardPage() {
  const { data: overviewData, isLoading: overviewLoading } = useDashboardOverview()
  const { data: scaleData, isLoading: scaleLoading } = useScaleByType()
  const { data: trendData, isLoading: trendLoading } = useFollowupTrend()

  const overview = overviewData?.data
  const scaleItems = scaleData?.data ?? []
  const trendItems = trendData?.data ?? []

  // 饼图数据格式：{ type, value }
  const pieData = scaleItems.map((item) => ({
    type: item.type,
    value: item.scale,
    percentage: item.percentage,
  }))

  // 折线图数据：展开为长格式，每个月 × 每种类型 一条记录
  const lineData: { month: string; count: number; category: string }[] = []
  trendItems.forEach((item: FollowUpTrendItem) => {
    // 总量
    lineData.push({ month: item.month, count: item.count, category: '总计' })
    // 细分
    Object.entries(item.byType).forEach(([type, count]) => {
      lineData.push({ month: item.month, count: count as number, category: type })
    })
  })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 4px', color: 'oklch(0.22 0.008 80)' }}>
          数据概览
        </h1>
        <p style={{ fontSize: 13, color: 'oklch(0.6 0.005 80)', margin: 0 }}>业务全貌一览</p>
      </div>

      {/* 统计卡片 */}
      {overviewLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spin /></div>
      ) : (
        <Row gutter={16} style={{ marginBottom: 28 }}>
          <Col span={6}>
            <Card size="small" style={{ boxShadow: '0 1px 2px oklch(0.2 0.005 80 / 0.06)' }}>
              <Statistic
                title="产品总数"
                value={overview?.totalFunds ?? 0}
                suffix="只"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ boxShadow: '0 1px 2px oklch(0.2 0.005 80 / 0.06)' }}>
              <Statistic
                title="在售产品"
                value={overview?.activeFunds ?? 0}
                suffix="只"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ boxShadow: '0 1px 2px oklch(0.2 0.005 80 / 0.06)' }}>
              <Statistic
                title="客户总数"
                value={overview?.totalClients ?? 0}
                suffix="位"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ boxShadow: '0 1px 2px oklch(0.2 0.005 80 / 0.06)' }}>
              <Statistic
                title="管理总规模"
                value={overview ? formatAmount(overview.totalAum) : '—'}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 图表区 */}
      <Row gutter={16}>
        {/* 饼图 */}
        <Col span={12}>
          <Card
            title="在售产品规模占比"
            extra={<span style={{ fontSize: 12, color: 'oklch(0.6 0.005 80)' }}>按产品类型分组，仅统计运作中产品</span>}
            style={{ boxShadow: '0 1px 2px oklch(0.2 0.005 80 / 0.06)' }}
          >
            {scaleLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spin /></div>
            ) : (
              <Pie
                data={pieData}
                angleField="value"
                colorField="type"
                radius={0.8}
                innerRadius={0.5}
                color={PIE_COLORS}
                label={{
                  text: (d: { type: string; percentage: number }) =>
                    `${d.type}: ${(d.percentage * 100).toFixed(1)}%`,
                  position: 'outside',
                  connector: true,
                  style: { fontSize: 12 },
                }}
                tooltip={(d: { type: string; value: number }) => ({
                  name: d.type,
                  value: formatAmount(d.value),
                })}
                legend={{ position: 'bottom' }}
                height={280}
              />
            )}
          </Card>
        </Col>

        {/* 折线图 */}
        <Col span={12}>
          <Card
            title="跟进趋势"
            extra={<span style={{ fontSize: 12, color: 'oklch(0.6 0.005 80)' }}>近 6 个月跟进次数，按方式细分</span>}
            style={{ boxShadow: '0 1px 2px oklch(0.2 0.005 80 / 0.06)' }}
          >
            {trendLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spin /></div>
            ) : (
              <Line
                data={lineData}
                xField="month"
                yField="count"
                colorField="category"
                shapeField="smooth"
                height={280}
                legend={{ position: 'bottom' }}
                tooltip={{ shared: true }}
                style={{ lineWidth: 2 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
