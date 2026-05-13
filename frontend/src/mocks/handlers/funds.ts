import { http, HttpResponse } from 'msw'
import { funds } from '../data/funds'
import { holdings } from '../data/holdings'
import { clients } from '../data/clients'
import { ok, paginate } from '../utils'
import type { FundHolder } from '../../types'

export const fundHandlers = [
  // GET /api/funds — 产品列表（支持 keyword/type/status/riskLevel 筛选 + 分页）
  http.get('/api/funds', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') ?? ''
    const type = url.searchParams.get('type') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const riskLevel = url.searchParams.get('riskLevel') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    let result = [...funds]

    if (keyword) {
      result = result.filter(f =>
        f.name.includes(keyword) || f.fundManager.includes(keyword)
      )
    }
    if (type) {
      result = result.filter(f => f.type === type)
    }
    if (status) {
      result = result.filter(f => f.status === status)
    }
    if (riskLevel) {
      result = result.filter(f => f.riskLevel === riskLevel)
    }

    return HttpResponse.json(ok(paginate(result, page, pageSize)))
  }),

  // GET /api/funds/:id — 产品详情（含持有人列表）
  http.get('/api/funds/:id', ({ params }) => {
    const fund = funds.find(f => f.id === params.id)
    if (!fund) {
      return HttpResponse.json(
        { code: 404, message: '产品不存在', data: null },
        { status: 404 }
      )
    }

    // 反查持有该产品的客户
    const fundHoldings = holdings.filter(h => h.fundId === fund.id)
    const holders: FundHolder[] = fundHoldings.map(h => {
      const client = clients.find(c => c.id === h.clientId)
      return {
        clientId: h.clientId,
        clientName: client?.name ?? '未知客户',
        tier: client?.tier ?? '潜客',
        amount: h.amount,
        buyDate: h.buyDate,
        returnRate: h.returnRate,
      }
    })

    return HttpResponse.json(ok({ fund, holders }))
  }),
]
