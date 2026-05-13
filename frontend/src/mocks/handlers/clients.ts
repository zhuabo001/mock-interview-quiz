import { http, HttpResponse } from 'msw'
import { clients } from '../data/clients'
import { holdings } from '../data/holdings'
import { funds } from '../data/funds'
import { salespersons } from '../data/salespersons'
import { ok, paginate } from '../utils'
import type { ClientHolding } from '../../types'

export const clientHandlers = [
  // GET /api/clients — 客户列表（支持 keyword/tier 筛选 + 分页）
  http.get('/api/clients', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') ?? ''
    const tier = url.searchParams.get('tier') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    let result = [...clients]

    if (keyword) {
      result = result.filter(c =>
        c.name.includes(keyword) || c.company.includes(keyword)
      )
    }
    if (tier) {
      result = result.filter(c => c.tier === tier)
    }

    return HttpResponse.json(ok(paginate(result, page, pageSize)))
  }),

  // GET /api/clients/:id — 客户详情（含持仓 + 负责业务员）
  http.get('/api/clients/:id', ({ params }) => {
    const client = clients.find(c => c.id === params.id)
    if (!client) {
      return HttpResponse.json(
        { code: 404, message: '客户不存在', data: null },
        { status: 404 }
      )
    }

    // 正查该客户的持仓
    const clientHoldings = holdings.filter(h => h.clientId === client.id)
    const holdingList: ClientHolding[] = clientHoldings.map(h => {
      const fund = funds.find(f => f.id === h.fundId)
      return {
        holdingId: h.id,
        fundId: h.fundId,
        fundName: fund?.name ?? '未知产品',
        fundType: fund?.type ?? '混合型',
        amount: h.amount,
        returnRate: h.returnRate,
        status: h.status,
      }
    })

    // 找负责业务员
    const salesPerson = salespersons.find(s => s.id === client.salesPersonId)!

    return HttpResponse.json(ok({
      client,
      holdings: holdingList,
      salesPerson,
    }))
  }),
]
