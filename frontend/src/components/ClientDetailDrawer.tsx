import { useState } from 'react'
import {
  Drawer, Tag, Descriptions, Table, Spin, Typography,
  Button, Modal, Form, Select, Input, DatePicker, Timeline, message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useClientDetail } from '../hooks/useClients'
import { useFollowups, useCreateFollowup } from '../hooks/useFollowups'
import { useUIStore } from '../stores/uiStore'
import { formatAmount, formatPercent, formatDate } from '../utils/format'
import type { ClientHolding, FollowUp, FollowUpType } from '../types'

const { Text } = Typography
const { TextArea } = Input

const TIER_COLOR: Record<string, string> = {
  钻石: 'purple',
  金: 'gold',
  银: 'default',
  铜: 'orange',
  潜客: 'default',
}

const holdingColumns: ColumnsType<ClientHolding> = [
  {
    title: '产品',
    dataIndex: 'fundName',
    key: 'fundName',
    render: (v) => <Text style={{ color: 'oklch(0.52 0.08 240)', fontWeight: 500, cursor: 'pointer' }}>{v}</Text>,
  },
  { title: '类型', dataIndex: 'fundType', key: 'fundType' },
  { title: '金额', dataIndex: 'amount', key: 'amount', render: (v) => formatAmount(v) },
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

const FOLLOWUP_TYPE_OPTIONS: { label: string; value: FollowUpType }[] = [
  { label: '电话', value: '电话' },
  { label: '面谈', value: '面谈' },
  { label: '微信', value: '微信' },
  { label: '邮件', value: '邮件' },
]

export default function ClientDetailDrawer() {
  const { clientDrawerOpen, selectedClientId, closeClientDrawer } = useUIStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: clientData, isLoading: clientLoading } = useClientDetail(selectedClientId)
  const { data: followupData, isLoading: followupLoading } = useFollowups(selectedClientId)
  const { mutate: createFollowup, isPending } = useCreateFollowup()

  const client = clientData?.data?.client
  const holdings = clientData?.data?.holdings ?? []
  const salesPerson = clientData?.data?.salesPerson
  const followups = followupData?.data?.list ?? []

  const isLoading = clientLoading || followupLoading

  function handleAddFollowup(values: {
    type: FollowUpType
    content: string
    nextAction: string
    nextActionDate: { format: (f: string) => string }
  }) {
    if (!selectedClientId || !salesPerson) return
    createFollowup(
      {
        clientId: selectedClientId,
        salesPersonId: salesPerson.id,
        type: values.type,
        content: values.content,
        nextAction: values.nextAction,
        nextActionDate: values.nextActionDate.format('YYYY-MM-DD'),
      },
      {
        onSuccess: () => {
          message.success('跟进记录已添加')
          setAddModalOpen(false)
          form.resetFields()
        },
      }
    )
  }

  const sectionTitle = (text: string) => (
    <div style={{ fontSize: 12, fontWeight: 500, color: 'oklch(0.6 0.005 80)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid oklch(0.9 0.005 80)' }}>
      {text}
    </div>
  )

  return (
    <>
      <Drawer
        open={clientDrawerOpen}
        onClose={closeClientDrawer}
        styles={{ body: { padding: 32 }, wrapper: { width: 560 } }}
        closeIcon={null}
      >
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <Spin size="large" />
          </div>
        ) : client ? (
          <>
            {/* 标题 + badges */}
            <div style={{ marginBottom: 24, paddingRight: 32 }}>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
                {client.name}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Tag color={TIER_COLOR[client.tier] ?? 'default'}>{client.tier}</Tag>
                {client.source && <Tag>{client.source}</Tag>}
              </div>
            </div>

            {/* 基本信息 */}
            <div style={{ marginBottom: 28 }}>
              {sectionTitle('基本信息')}
              <Descriptions column={2} size="small" styles={{ label: { color: 'oklch(0.6 0.005 80)', fontSize: 12 }, content: { fontWeight: 500, fontSize: 14 } }}>
                <Descriptions.Item label="公司">{client.company}</Descriptions.Item>
                <Descriptions.Item label="职位">{client.position}</Descriptions.Item>
                <Descriptions.Item label="电话">{client.phone}</Descriptions.Item>
                <Descriptions.Item label="在管资产">{formatAmount(client.totalAssets)}</Descriptions.Item>
                <Descriptions.Item label="建档日期">{formatDate(client.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="负责业务员">{salesPerson?.name ?? '—'}</Descriptions.Item>
              </Descriptions>
              {client.tags?.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {client.tags.map((tag) => (
                    <Tag key={tag} style={{ background: 'oklch(0.955 0.004 80)', border: 'none', color: 'oklch(0.45 0.006 80)' }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            {/* 持仓 */}
            <div style={{ marginBottom: 28 }}>
              {sectionTitle('持仓')}
              <Table
                dataSource={holdings}
                columns={holdingColumns}
                rowKey="holdingId"
                size="small"
                pagination={false}
                locale={{ emptyText: '暂无持仓' }}
              />
            </div>

            {/* 跟进记录 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'oklch(0.6 0.005 80)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  跟进记录
                </div>
                <Button type="primary" size="small" onClick={() => setAddModalOpen(true)}>
                  + 新增跟进
                </Button>
              </div>
              {followups.length === 0 ? (
                <div style={{ color: 'oklch(0.6 0.005 80)', fontSize: 13, padding: '12px 0' }}>暂无跟进记录</div>
              ) : (
                <Timeline
                  items={followups.map((fu: FollowUp, idx: number) => ({
                    color: idx === 0 ? 'blue' : 'gray',
                    content: (
                      <div>
                        <div style={{ fontSize: 12, color: 'oklch(0.6 0.005 80)', marginBottom: 4 }}>
                          {fu.createdAt.slice(0, 16)} · <span style={{ fontWeight: 500, color: 'oklch(0.45 0.006 80)' }}>{fu.type}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'oklch(0.45 0.006 80)', lineHeight: 1.6 }}>{fu.content}</div>
                        {fu.nextAction && (
                          <div style={{ fontSize: 12, color: 'oklch(0.6 0.005 80)', marginTop: 4, fontStyle: 'italic' }}>
                            下一步: {fu.nextAction}
                          </div>
                        )}
                      </div>
                    ),
                  }))}
                />
              )}
            </div>
          </>
        ) : null}
      </Drawer>

      {/* 新增跟进 Modal */}
      <Modal
        title="新增跟进记录"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields() }}
        onOk={() => form.submit()}
        okText="提交"
        cancelText="取消"
        confirmLoading={isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleAddFollowup} style={{ marginTop: 16 }}>
          <Form.Item name="type" label="跟进方式" rules={[{ required: true, message: '请选择跟进方式' }]}>
            <Select options={FOLLOWUP_TYPE_OPTIONS} placeholder="请选择" />
          </Form.Item>
          <Form.Item name="content" label="跟进内容" rules={[{ required: true, message: '请填写跟进内容' }]}>
            <TextArea rows={4} placeholder="请描述本次跟进情况..." />
          </Form.Item>
          <Form.Item name="nextAction" label="下一步计划" rules={[{ required: true, message: '请填写下一步计划' }]}>
            <Input placeholder="例：一周后电话跟进确认意向" />
          </Form.Item>
          <Form.Item name="nextActionDate" label="下一步日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
