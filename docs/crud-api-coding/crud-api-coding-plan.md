# MSW API 完整实现计划

## Context

已有完整的类型定义（`frontend/src/types/`）和接口设计文档（`docs/api-design.md`），MSW 的入口文件（`frontend/src/mocks/browser.ts` 和 `handlers/index.ts`）已搭好骨架但 handlers 数组为空。

目标：实现 8 个 API 端点的 MSW handlers + 配套 Mock 数据，让前端可以发真实 fetch 请求并拿到符合类型定义的响应。

---

## 文件结构规划

```
frontend/src/mocks/
├── browser.ts                  ← 已有，不改
├── data/                       ← 新增：种子数据
│   ├── salespersons.ts         ← 3 个业务员
│   ├── funds.ts                ← 10 个基金产品
│   ├── clients.ts              ← 10 个客户
│   ├── holdings.ts             ← 持仓关系（约 20 条）
│   └── followups.ts            ← 跟进记录（约 40 条，每客户 3-5 条）
├── handlers/
│   ├── index.ts                ← 已有，汇总所有 handler
│   ├── funds.ts                ← 新增：产品相关 handlers
│   ├── clients.ts              ← 新增：客户相关 handlers
│   ├── followups.ts            ← 新增：跟进记录 handlers
│   └── dashboard.ts            ← 新增：Dashboard 聚合 handlers
└── utils.ts                    ← 新增：通用工具函数
```

---

## 实现步骤

### Step 1：种子数据（`mocks/data/`）

**salespersons.ts** — 3 条
- S001 张晓华 / 华东区渠道一部
- S002 李明远 / 华南区渠道二部
- S003 王芳 / 华北区渠道三部

**funds.ts** — 10 条，覆盖 5 种类型 × 3 种状态
- 数据要"可信"：真实感的基金名（XX增长/XX稳健/XX价值）、合理的净值范围（0.8-2.5）、合理的规模（5亿-50亿）
- 确保筛选演示有效：至少 3 个"运作中"、2 个"募集中"、1 个"已清盘"
- `totalReturn` 由 `(nav - establishNav) / establishNav` 计算，直接写死在数据里

**clients.ts** — 10 条
- 覆盖 5 个 tier（钻石 2、金 3、银 2、铜 2、潜客 1）
- `salesPersonId` 分配到 3 个业务员
- 真实感：公司名（XX投资/XX资产/XX家族办公室）、职位（总经理/CFO/投资总监）

**holdings.ts** — 约 20 条
- 每个客户至少 1 条持仓，部分客户 2-3 条（体现多产品持有）
- 每个产品至少被 2 个客户持有（体现反向查询有数据）
- `returnRate` 要有正有负（体现真实性）

**followups.ts** — 约 40 条
- 每个客户 3-5 条，时间跨度覆盖近 6 个月（支撑 Dashboard 趋势图）
- 4 种 type 都要有，分布合理（电话最多，面谈其次）

---

### Step 2：通用工具（`mocks/utils.ts`）

```typescript
// 分页切片
function paginate<T>(list: T[], page = 1, pageSize = 10): PaginatedResponse<T>

// 统一响应包装
function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'success', data }
}
```

---

### Step 3：Handler 实现

所有 handler 使用 MSW 的 `http.get` / `http.post`，响应统一用 `ok()` 包装。

**handlers/funds.ts**
- `GET /api/funds`：按 keyword/type/status/riskLevel 过滤 funds 数组，调用 `paginate()` 返回
- `GET /api/funds/:id`：找到对应 fund，从 holdings 反查持有该产品的客户，组装 `FundDetailData`（含 holders 列表）

**handlers/clients.ts**
- `GET /api/clients`：按 keyword/tier 过滤 clients 数组，调用 `paginate()` 返回
- `GET /api/clients/:id`：找到对应 client，从 holdings 正查该客户持仓，从 salespersons 找负责人，组装 `ClientDetailData`

**handlers/followups.ts**
- `GET /api/followups`：按 clientId 过滤，支持 type 筛选，调用 `paginate()` 返回
- `POST /api/followups`：从请求体解析，生成 id（`FU${Date.now()}`）和 createdAt，push 到内存 store，返回新建对象

**handlers/dashboard.ts**
- `GET /api/dashboard/overview`：统计 funds/clients 总数、activeFunds（status 为运作中或募集中）、totalAum（所有 holdings.amount 求和）
- `GET /api/dashboard/scale-by-type`：按 type 分组 funds，计算各组 currentScale 之和、count、percentage
- `GET /api/dashboard/followup-trend`：按月分组 followups，统计近 6 个月每月 count 和 byType 分布

**handlers/index.ts**（修改现有文件）
- 导入并合并 4 个 handler 文件的数组

---

## 关键实现细节

### POST /api/followups 的内存持久化

MSW handler 里维护一个模块级的 `followupsStore` 数组（初始值 = followups 种子数据），POST 时 push 进去，GET 时从这个数组读。这样在同一个浏览器 session 内新增的跟进记录能被后续 GET 查到，模拟真实行为。

其余数据（funds、clients、holdings）P0 阶段只读，不需要内存 store。

---

## 文件改动汇总

| 文件 | 操作 |
|------|------|
| `frontend/src/mocks/handlers/index.ts` | 修改：导入并合并 4 个 handler 模块 |
| `frontend/src/mocks/utils.ts` | 新增：`paginate()`、`ok()` |
| `frontend/src/mocks/data/salespersons.ts` | 新增：3 条业务员种子数据 |
| `frontend/src/mocks/data/funds.ts` | 新增：10 条基金产品种子数据 |
| `frontend/src/mocks/data/clients.ts` | 新增：10 条客户种子数据 |
| `frontend/src/mocks/data/holdings.ts` | 新增：~20 条持仓关系种子数据 |
| `frontend/src/mocks/data/followups.ts` | 新增：~40 条跟进记录种子数据 |
| `frontend/src/mocks/handlers/funds.ts` | 新增：产品 handlers（2 个端点） |
| `frontend/src/mocks/handlers/clients.ts` | 新增：客户 handlers（2 个端点） |
| `frontend/src/mocks/handlers/followups.ts` | 新增：跟进记录 handlers（2 个端点） |
| `frontend/src/mocks/handlers/dashboard.ts` | 新增：Dashboard handlers（3 个端点） |

共 1 个文件修改，10 个文件新增。

---

## 验证方式

1. `pnpm dev` 启动开发服务器，确认控制台出现 `[MSW] Mocking enabled`
2. 浏览器 DevTools Network 面板中能看到各接口的请求和响应
3. `npx tsc --noEmit` 类型检查通过
4. 手动验证关键场景：
   - 产品列表按类型/状态筛选返回正确子集
   - 产品详情的 `holders` 列表非空（反向查询验证）
   - 客户详情的 `holdings` 列表非空（正向查询验证）
   - 新增跟进后 `GET /api/followups?clientId=xxx` 能查到新记录（内存持久化验证）
   - Dashboard 三个接口返回有意义的聚合数据
