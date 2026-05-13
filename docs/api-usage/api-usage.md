# API 使用手册

> 所有接口均由 MSW 拦截，基础路径为 `/api`。响应统一格式：`{ code: 0, message: "success", data: T }`。
> 前端通过 `fetch` 或 TanStack Query 的 `useQuery` / `useMutation` 调用。

---

## 目录

- [产品货架](#一产品货架)
  - [GET /api/funds](#get-apifunds--产品列表)
  - [GET /api/funds/:id](#get-apifundsid--产品详情)
- [客户管理](#二客户管理)
  - [GET /api/clients](#get-apiclients--客户列表)
  - [GET /api/clients/:id](#get-apiclientsid--客户详情)
- [跟进记录](#三跟进记录)
  - [GET /api/followups](#get-apifollowups--跟进记录列表)
  - [POST /api/followups](#post-apifollowups--新增跟进记录)
- [Dashboard](#四dashboard)
  - [GET /api/dashboard/overview](#get-apidashboardoverview--概览数字)
  - [GET /api/dashboard/scale-by-type](#get-apidashboardscale-by-type--产品规模占比)
  - [GET /api/dashboard/followup-trend](#get-apidashboardfollowup-trend--跟进趋势)

---

## 一、产品货架

### `GET /api/funds` — 产品列表

**作用**

获取基金产品列表，支持按名称关键词搜索、按产品类型/状态/风险等级筛选，支持分页。

**传入参数**（URL Query String，均为可选）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `keyword` | string | — | 按产品名称或基金经理姓名模糊搜索 |
| `type` | string | — | 按产品类型筛选：`股票型` / `债券型` / `混合型` / `货币型` / `指数型` |
| `status` | string | — | 按状态筛选：`募集中` / `运作中` / `已清盘` |
| `riskLevel` | string | — | 按风险等级筛选：`R1` ~ `R5` |
| `page` | number | `1` | 页码 |
| `pageSize` | number | `10` | 每页条数 |

**如何获取返回值**

```typescript
// 方式一：TanStack Query（推荐）
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, isError } = useQuery({
  queryKey: ['funds', { keyword, type, status, page }],
  queryFn: async () => {
    const params = new URLSearchParams({ page: String(page), ...(type && { type }) })
    const res = await fetch(`/api/funds?${params}`)
    return res.json()  // FundListResponse
  },
})
const funds = data?.data.list        // Fund[]
const pagination = data?.data.pagination  // PaginationMeta

// 方式二：原生 fetch
const res = await fetch('/api/funds?type=混合型&status=运作中&page=1&pageSize=10')
const json = await res.json()  // FundListResponse
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "F001",
        "name": "华夏稳健增长混合型基金",
        "type": "混合型",
        "status": "运作中",
        "nav": 1.4823,
        "navDate": "2025-03-14",
        "establishNav": 1.0000,
        "totalReturn": 0.4823,
        "totalScale": 3200000000,
        "currentScale": 2850000000,
        "fundManager": "陈志远",
        "establishDate": "2021-06-15",
        "riskLevel": "R3",
        "minInvestment": 10000,
        "annualReturn": 0.1156,
        "description": "以绝对收益为目标..."
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

### `GET /api/funds/:id` — 产品详情

**作用**

获取单个基金产品的完整信息，同时返回持有该产品的客户列表（反向关联），实现「某产品被哪些客户持有」的双向查询。

**传入参数**

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `id` | URL Path | string | 是 | 产品 ID，如 `F001` |

**如何获取返回值**

```typescript
// TanStack Query
const { data } = useQuery({
  queryKey: ['fund', id],
  queryFn: async () => {
    const res = await fetch(`/api/funds/${id}`)
    return res.json()  // FundDetailResponse
  },
})
const fund = data?.data.fund        // Fund
const holders = data?.data.holders  // FundHolder[]
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "fund": { /* Fund 完整字段，同列表项 */ },
    "holders": [
      {
        "clientId": "C001",
        "clientName": "张伟",
        "tier": "钻石",
        "amount": 3000000,
        "buyDate": "2023-03-15",
        "returnRate": 0.3725
      }
    ]
  }
}
```

> 产品不存在时返回 `{ code: 404, message: "产品不存在", data: null }`，HTTP 状态码 404。

---

## 二、客户管理

### `GET /api/clients` — 客户列表

**作用**

获取客户列表，支持按姓名或公司关键词搜索、按客户等级筛选，支持分页。

**传入参数**（URL Query String，均为可选）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `keyword` | string | — | 按客户姓名或公司名称模糊搜索 |
| `tier` | string | — | 按客户等级筛选：`钻石` / `金` / `银` / `铜` / `潜客` |
| `page` | number | `1` | 页码 |
| `pageSize` | number | `10` | 每页条数 |

**如何获取返回值**

```typescript
const { data } = useQuery({
  queryKey: ['clients', { keyword, tier, page }],
  queryFn: async () => {
    const params = new URLSearchParams({ page: String(page), ...(tier && { tier }) })
    const res = await fetch(`/api/clients?${params}`)
    return res.json()  // ClientListResponse
  },
})
const clients = data?.data.list
const pagination = data?.data.pagination
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "C001",
        "name": "张伟",
        "phone": "138****1001",
        "company": "华盛私募投资基金",
        "position": "总经理",
        "tier": "钻石",
        "totalAssets": 50000000,
        "source": "渠道推荐",
        "tags": ["高净值", "机构", "长期持有"],
        "salesPersonId": "S001",
        "createdAt": "2023-02-10"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

### `GET /api/clients/:id` — 客户详情

**作用**

获取单个客户的完整信息，同时返回该客户的持仓列表（正向关联）和负责业务员信息，实现「某客户买了哪些产品」的双向查询。

**传入参数**

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `id` | URL Path | string | 是 | 客户 ID，如 `C001` |

**如何获取返回值**

```typescript
const { data } = useQuery({
  queryKey: ['client', id],
  queryFn: async () => {
    const res = await fetch(`/api/clients/${id}`)
    return res.json()  // ClientDetailResponse
  },
})
const client = data?.data.client          // Client
const holdings = data?.data.holdings      // ClientHolding[]
const salesPerson = data?.data.salesPerson  // SalesPerson
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "client": { /* Client 完整字段，同列表项 */ },
    "holdings": [
      {
        "holdingId": "H001",
        "fundId": "F001",
        "fundName": "华夏稳健增长混合型基金",
        "fundType": "混合型",
        "amount": 3000000,
        "returnRate": 0.3725,
        "status": "持有中"
      }
    ],
    "salesPerson": {
      "id": "S001",
      "name": "张晓华",
      "department": "华东区渠道一部",
      "phone": "13812340001",
      "email": "zhang.xiaohua@fund.com"
    }
  }
}
```

> 客户不存在时返回 `{ code: 404, message: "客户不存在", data: null }`，HTTP 状态码 404。

---

## 三、跟进记录

### `GET /api/followups` — 跟进记录列表

**作用**

获取指定客户的跟进记录列表，按时间倒序排列，支持按跟进方式筛选和分页。

**传入参数**（URL Query String）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `clientId` | string | **是** | 客户 ID，如 `C001` |
| `type` | string | 否 | 按跟进方式筛选：`电话` / `面谈` / `微信` / `邮件` |
| `page` | number | 否 | 页码，默认 `1` |
| `pageSize` | number | 否 | 每页条数，默认 `10` |

**如何获取返回值**

```typescript
const { data } = useQuery({
  queryKey: ['followups', clientId, { type, page }],
  queryFn: async () => {
    const params = new URLSearchParams({ clientId, page: String(page) })
    if (type) params.set('type', type)
    const res = await fetch(`/api/followups?${params}`)
    return res.json()  // FollowUpListResponse
  },
  enabled: !!clientId,  // clientId 存在时才发请求
})
const followups = data?.data.list        // FollowUp[]
const pagination = data?.data.pagination
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "FU004",
        "clientId": "C001",
        "salesPersonId": "S001",
        "type": "电话",
        "content": "跟进新产品认购意向，客户表示暂时观望...",
        "nextAction": "4月初再次跟进市场情况",
        "nextActionDate": "2025-04-05",
        "createdAt": "2025-03-05 11:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

---

### `POST /api/followups` — 新增跟进记录

**作用**

为指定客户新增一条跟进记录。新增的记录会写入内存 store，在同一浏览器 session 内可被后续 GET 查到。

**传入参数**（Request Body，JSON 格式，均为必填）

| 字段 | 类型 | 说明 |
|------|------|------|
| `clientId` | string | 客户 ID |
| `salesPersonId` | string | 跟进业务员 ID |
| `type` | string | 跟进方式：`电话` / `面谈` / `微信` / `邮件` |
| `content` | string | 跟进内容 |
| `nextAction` | string | 下一步计划 |
| `nextActionDate` | string | 下一步日期，格式 `YYYY-MM-DD` |

**如何获取返回值**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateFollowUpBody } from '../types'

const queryClient = useQueryClient()

const { mutate, isPending } = useMutation({
  mutationFn: async (body: CreateFollowUpBody) => {
    const res = await fetch('/api/followups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()  // CreateFollowUpResponse
  },
  onSuccess: (_, variables) => {
    // 新增成功后让跟进列表缓存失效，触发重新请求
    queryClient.invalidateQueries({ queryKey: ['followups', variables.clientId] })
  },
})

// 调用
mutate({
  clientId: 'C001',
  salesPersonId: 'S001',
  type: '电话',
  content: '与客户沟通了新产品认购意向',
  nextAction: '一周后回访确认意向',
  nextActionDate: '2025-03-22',
})
```

**返回值**（HTTP 201）

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "FU1741234567890",
    "clientId": "C001",
    "salesPersonId": "S001",
    "type": "电话",
    "content": "与客户沟通了新产品认购意向",
    "nextAction": "一周后回访确认意向",
    "nextActionDate": "2025-03-22",
    "createdAt": "2025-03-15 14:30:00"
  }
}
```

> `id` 由服务端生成（`FU${Date.now()}`），`createdAt` 为服务端当前时间，无需前端传入。

---

## 四、Dashboard

### `GET /api/dashboard/overview` — 概览数字

**作用**

获取业务全局概览数字，用于 Dashboard 顶部的统计卡片展示。

**传入参数**

无。

**如何获取返回值**

```typescript
const { data } = useQuery({
  queryKey: ['dashboard', 'overview'],
  queryFn: async () => {
    const res = await fetch('/api/dashboard/overview')
    return res.json()  // DashboardOverviewResponse
  },
})
const overview = data?.data  // DashboardOverview
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalFunds": 10,
    "activeFunds": 8,
    "totalClients": 10,
    "totalAum": 47800000
  }
}
```

| 字段 | 说明 |
|------|------|
| `totalFunds` | 产品总数 |
| `activeFunds` | 在售产品数（状态为「运作中」或「募集中」） |
| `totalClients` | 客户总数 |
| `totalAum` | 当前持仓总规模（元），仅统计状态为「持有中」的持仓 |

---

### `GET /api/dashboard/scale-by-type` — 产品规模占比

**作用**

获取在售产品（状态为「运作中」）按产品类型分组的规模占比数据，用于饼图/环形图展示，帮助销售了解产品线结构。

**传入参数**

无。

**如何获取返回值**

```typescript
const { data } = useQuery({
  queryKey: ['dashboard', 'scale-by-type'],
  queryFn: async () => {
    const res = await fetch('/api/dashboard/scale-by-type')
    return res.json()  // ScaleByTypeResponse
  },
})
const items = data?.data  // ScaleByTypeItem[]，已按规模降序排列
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "type": "货币型", "scale": 13500000000, "count": 1, "percentage": 0.3812 },
    { "type": "指数型", "scale": 5980000000,  "count": 1, "percentage": 0.1688 },
    { "type": "股票型", "scale": 8700000000,  "count": 2, "percentage": 0.2456 },
    { "type": "混合型", "scale": 2850000000,  "count": 1, "percentage": 0.0805 },
    { "type": "债券型", "scale": 13300000000, "count": 2, "percentage": 0.3755 }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `type` | 产品类型 |
| `scale` | 该类型所有在售产品的当前规模之和（元） |
| `count` | 该类型在售产品数量 |
| `percentage` | 占所有在售产品总规模的比例（小数，保留 4 位） |

---

### `GET /api/dashboard/followup-trend` — 跟进趋势

**作用**

获取近 6 个月的跟进记录趋势数据，按月统计总次数及各跟进方式的细分数量，用于折线图展示，帮助销售团队了解跟进活跃度变化。

**传入参数**

无。

**如何获取返回值**

```typescript
const { data } = useQuery({
  queryKey: ['dashboard', 'followup-trend'],
  queryFn: async () => {
    const res = await fetch('/api/dashboard/followup-trend')
    return res.json()  // FollowUpTrendResponse
  },
})
const trend = data?.data  // FollowUpTrendItem[]，按月份升序排列
```

**返回值**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "month": "2024-10",
      "count": 5,
      "byType": { "电话": 2, "面谈": 1, "微信": 1, "邮件": 1 }
    },
    {
      "month": "2024-11",
      "count": 4,
      "byType": { "电话": 2, "面谈": 0, "微信": 1, "邮件": 0 }
    },
    {
      "month": "2024-12",
      "count": 6,
      "byType": { "电话": 3, "面谈": 1, "微信": 1, "邮件": 1 }
    },
    {
      "month": "2025-01",
      "count": 7,
      "byType": { "电话": 3, "面谈": 2, "微信": 1, "邮件": 1 }
    },
    {
      "month": "2025-02",
      "count": 5,
      "byType": { "电话": 2, "面谈": 1, "微信": 2, "邮件": 0 }
    },
    {
      "month": "2025-03",
      "count": 3,
      "byType": { "电话": 2, "面谈": 1, "微信": 0, "邮件": 0 }
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `month` | 月份，格式 `YYYY-MM` |
| `count` | 该月跟进总次数 |
| `byType` | 按跟进方式细分的次数，4 种方式均会出现（无记录时为 `0`） |
