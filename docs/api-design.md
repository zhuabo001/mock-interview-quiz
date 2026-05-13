# API 接口设计文档

> 本文档定义了 P0 阶段所有 MSW Mock 接口的路由、参数、响应结构及业务关系。

---

## 实体关系总览

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   Fund   │◄──────│   Holding    │──────►│  Client  │
│  (产品)   │  1:N  │  (持仓关系)   │  N:1  │  (客户)   │
└──────────┘       └──────────────┘       └──────────┘
                                                │
                                           1:N  │
                                                ▼
                                          ┌──────────┐
                                          │ FollowUp │
                                          │ (跟进记录) │
                                          └──────────┘
```

**核心关系：**
- Fund ↔ Client 是多对多，通过 Holding 关联
- Client → FollowUp 是一对多
- 产品详情可以看到「谁持有了这个产品」（反查 Holding）
- 客户详情可以看到「持有了哪些产品」（正查 Holding）
- 这就是题目要求的「双向关联」

---

## 统一响应格式

所有接口返回统一包装：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

分页列表额外包含 pagination：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

## 接口清单

### 一、产品货架

#### `GET /api/funds` — 产品列表

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 按产品名称模糊搜索 |
| type | string | 否 | 按类型筛选：股票型/债券型/混合型/货币型/指数型 |
| status | string | 否 | 按状态筛选：募集中/运作中/已清盘 |

**响应 data：**
```json
{
  "list": [
    {
      "id": "F001",
      "name": "稳健增长一号",
      "type": "混合型",
      "status": "运作中",
      "nav": 1.2356,
      "navDate": "2025-03-15",
      "totalScale": 1250000000,
      "currentScale": 980000000,
      "fundManager": "张明",
      "establishDate": "2023-06-01",
      "riskLevel": "R3",
      "minInvestment": 100000,
      "annualReturn": 0.0823,
      "description": "以绝对收益为目标..."
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "total": 10, "totalPages": 1 }
}
```

---

#### `GET /api/funds/:id` — 产品详情（含持有人）

**响应 data：**
```json
{
  "fund": { /* Fund 完整字段 */ },
  "holders": [
    {
      "clientId": "C001",
      "clientName": "张伟",
      "tier": "钻石",
      "amount": 3000000,
      "buyDate": "2024-03-01",
      "returnRate": 0.2233
    }
  ]
}
```

> 这里的 holders 就是「某个产品被哪些客户持有」的反向查询，直接嵌在产品详情里，形成闭环。

---

### 二、客户管理

#### `GET /api/clients` — 客户列表

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 按姓名或公司模糊搜索 |
| tier | string | 否 | 按客户等级筛选 |

**响应 data：**
```json
{
  "list": [
    {
      "id": "C001",
      "name": "张伟",
      "phone": "138****1234",
      "company": "华盛投资",
      "position": "总经理",
      "tier": "钻石",
      "totalAssets": 50000000,
      "source": "渠道推荐",
      "tags": ["高净值", "机构", "长期"],
      "createdAt": "2024-01-15"
    }
  ],
  "pagination": { ... }
}
```

---

#### `GET /api/clients/:id` — 客户详情（含持仓 + 跟进）

**响应 data：**
```json
{
  "client": { /* Client 完整字段 */ },
  "holdings": [
    {
      "holdingId": "H001",
      "fundId": "F001",
      "fundName": "稳健增长一号",
      "fundType": "混合型",
      "amount": 3000000,
      "returnRate": 0.2233,
      "status": "持有中"
    }
  ],
  "recentFollowUps": [
    {
      "id": "FU001",
      "clientId": "C001",
      "type": "面谈",
      "content": "在客户公司沟通，介绍了稳健增长一号...",
      "nextAction": "发送认购协议",
      "nextActionDate": "2025-03-20",
      "createdAt": "2025-03-15 10:30:00"
    }
  ]
}
```

> 客户详情一次请求拿到「持有了哪些产品」+「最近跟进」，减少前端请求次数。

---

### 三、跟进记录

#### `GET /api/followups` — 跟进记录列表

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| clientId | string | 是 | 客户 ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| type | string | 否 | 按跟进方式筛选 |

**响应 data：** 标准分页列表，list 为 FollowUp[]

---

#### `POST /api/followups` — 新增跟进记录

**请求体：**
```json
{
  "clientId": "C001",
  "type": "电话",
  "content": "与客户沟通了新产品认购意向，客户表示需要考虑一周",
  "nextAction": "一周后回访确认意向",
  "nextActionDate": "2025-03-22"
}
```

**响应 data：** 创建成功的完整 FollowUp 对象（含生成的 id 和 createdAt）

---

### 四、Dashboard 数据概览

#### `GET /api/dashboard/overview` — 概览数字卡片

**响应 data：**
```json
{
  "totalFunds": 10,
  "activeFunds": 7,
  "totalClients": 12,
  "totalAum": 8500000000
}
```

---

#### `GET /api/dashboard/scale-by-type` — 在售产品规模按类型占比（饼图）

**响应 data：**
```json
[
  { "type": "股票型", "scale": 3200000000, "count": 3, "percentage": 0.376 },
  { "type": "债券型", "scale": 2100000000, "count": 2, "percentage": 0.247 },
  { "type": "混合型", "scale": 1800000000, "count": 2, "percentage": 0.212 },
  { "type": "货币型", "scale": 900000000,  "count": 1, "percentage": 0.106 },
  { "type": "指数型", "scale": 500000000,  "count": 1, "percentage": 0.059 }
]
```

> 选这个图的理由：销售最关心「公司产品线的结构是否均衡」「哪类产品规模最大可以重点推」。

---

#### `GET /api/dashboard/followup-trend` — 近 6 个月跟进趋势（折线图）

**响应 data：**
```json
[
  {
    "month": "2024-10",
    "count": 23,
    "byType": { "电话": 12, "面谈": 5, "微信": 4, "邮件": 2 }
  },
  {
    "month": "2024-11",
    "count": 31,
    "byType": { "电话": 15, "面谈": 8, "微信": 5, "邮件": 3 }
  }
]
```

> 选这个图的理由：跟进频次直接反映销售团队的活跃度，按方式细分能看出团队偏好和客户触达策略。

---

## 设计决策说明

### 1. 为什么详情接口做聚合而不是前端多次请求？

客户详情页需要同时展示「基本信息 + 持仓 + 跟进」，如果拆成 3 个接口：
- 前端要管理 3 个 loading 状态
- 页面会出现「信息跳动」（先出名字，再出持仓，再出跟进）
- MSW 里写 3 个 handler 也更啰嗦

聚合成一个接口，前端一个 `useQuery` 搞定，体验更好。

### 2. 为什么 Holding 不单独暴露 CRUD 接口？

P0 阶段持仓数据是只读的（展示客户买了什么、产品被谁买了），不需要在前端做「新增持仓」操作。持仓数据通过产品详情和客户详情两个聚合接口分别返回，已经满足双向查询需求。

如果 P1 要做「模拟认购」功能，再加 `POST /api/holdings` 即可。

### 3. 为什么 Dashboard 用独立聚合接口而不是前端自己算？

- 前端拿全量数据做聚合 → 数据量大时性能差，且违背「模拟真实后端」的设计意图
- 独立接口 → MSW handler 里做聚合，模拟真实后端行为，也为 P1 的 Agent 智能查询留好了数据源

### 4. 字段设计的业务考量

| 字段 | 为什么要有 |
|------|-----------|
| Fund.currentScale vs totalScale | 成立规模是历史数据，当前规模反映赎回情况，销售关心的是当前规模 |
| Fund.annualReturn | 销售推产品时最常被问的指标 |
| Client.tier | 决定服务优先级，钻石客户跟进频次应该更高 |
| Client.totalAssets | 在管资产决定客户等级，也是 Dashboard 可以用的聚合维度 |
| Holding.returnRate | 客户最关心的数字，直接算好存着，不让前端算 |
| FollowUp.nextAction/nextActionDate | 销售工作的核心：每次跟进都要有下一步，这是 CRM 的灵魂 |
