import { http, HttpResponse } from 'msw'
import { followups as seedFollowups } from '../data/followups'
import { ok, paginate } from '../utils'
import type { CreateFollowUpBody } from '../../types'

// 内存 store：初始值为种子数据，POST 时追加，GET 时读取
const followupsStore = [...seedFollowups]

export const followupHandlers = [
  // GET /api/followups — 跟进记录列表（必须传 clientId，支持 type 筛选 + 分页）
  http.get('/api/followups', ({ request }) => {
    const url = new URL(request.url)
    const clientId = url.searchParams.get('clientId') ?? ''
    const type = url.searchParams.get('type') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    let result = [...followupsStore]

    if (clientId) {
      result = result.filter(f => f.clientId === clientId)
    }
    if (type) {
      result = result.filter(f => f.type === type)
    }

    // 按时间倒序
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return HttpResponse.json(ok(paginate(result, page, pageSize)))
  }),

  // POST /api/followups — 新增跟进记录
  http.post('/api/followups', async ({ request }) => {
    const body = await request.json() as CreateFollowUpBody

    const now = new Date()
    const createdAt = now.toISOString().replace('T', ' ').slice(0, 19)

    const newFollowUp = {
      id: `FU${Date.now()}`,
      clientId: body.clientId,
      salesPersonId: body.salesPersonId,
      type: body.type,
      content: body.content,
      nextAction: body.nextAction,
      nextActionDate: body.nextActionDate,
      createdAt,
    }

    followupsStore.push(newFollowUp)

    return HttpResponse.json(ok(newFollowUp), { status: 201 })
  }),
]
