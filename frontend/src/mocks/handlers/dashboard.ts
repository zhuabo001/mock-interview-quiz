import { http, HttpResponse } from 'msw'
import { funds } from '../data/funds'
import { clients } from '../data/clients'
import { holdings } from '../data/holdings'
import { followups } from '../data/followups'
import { ok } from '../utils'
import type { ScaleByTypeItem, FollowUpTrendItem, FundType, FollowUpType } from '../../types'

export const dashboardHandlers = [
  // GET /api/dashboard/overview — 概览数字卡片
  http.get('/api/dashboard/overview', () => {
    const activeFunds = funds.filter(
      f => f.status === '运作中' || f.status === '募集中'
    ).length

    const totalAum = holdings
      .filter(h => h.status === '持有中')
      .reduce((sum, h) => sum + h.amount, 0)

    return HttpResponse.json(ok({
      totalFunds: funds.length,
      activeFunds,
      totalClients: clients.length,
      totalAum,
    }))
  }),

  // GET /api/dashboard/scale-by-type — 在售产品规模按类型占比（饼图）
  http.get('/api/dashboard/scale-by-type', () => {
    const activeFunds = funds.filter(f => f.status === '运作中')

    const typeMap = new Map<FundType, { scale: number; count: number }>()

    for (const fund of activeFunds) {
      const existing = typeMap.get(fund.type) ?? { scale: 0, count: 0 }
      typeMap.set(fund.type, {
        scale: existing.scale + fund.currentScale,
        count: existing.count + 1,
      })
    }

    const totalScale = Array.from(typeMap.values()).reduce(
      (sum, v) => sum + v.scale,
      0
    )

    const result: ScaleByTypeItem[] = Array.from(typeMap.entries()).map(
      ([type, { scale, count }]) => ({
        type,
        scale,
        count,
        percentage: totalScale > 0 ? Number((scale / totalScale).toFixed(4)) : 0,
      })
    )

    // 按规模降序
    result.sort((a, b) => b.scale - a.scale)

    return HttpResponse.json(ok(result))
  }),

  // GET /api/dashboard/followup-trend — 近 6 个月跟进趋势（折线图）
  http.get('/api/dashboard/followup-trend', () => {
    // 生成近 6 个月的月份列表
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push(month)
    }

    const followUpTypes: FollowUpType[] = ['电话', '面谈', '微信', '邮件']

    const result: FollowUpTrendItem[] = months.map(month => {
      const monthFollowups = followups.filter(f =>
        f.createdAt.startsWith(month)
      )

      const byType = followUpTypes.reduce(
        (acc, type) => {
          acc[type] = monthFollowups.filter(f => f.type === type).length
          return acc
        },
        {} as Record<FollowUpType, number>
      )

      return {
        month,
        count: monthFollowups.length,
        byType,
      }
    })

    return HttpResponse.json(ok(result))
  }),
]
