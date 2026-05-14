# 基金销售管理工具 — 页面组件开发实现方案

> P0 交付范围：产品货架 + 客户管理 + 数据概览三个模块的完整页面组件开发，基于已有的 MSW Mock 层和 TypeScript 类型定义。

---

## 一、Context

当前项目已具备：
- 技术骨架：Vite + React 19 + TypeScript + React Router v7 + TanStack Query + Zustand + Ant Design 6.x + @ant-design/charts + MSW
- 数据层：完整的 Mock API handlers（funds / clients / followups / dashboard）和 TypeScript 类型定义
- Mock 环境：`public/mockServiceWorker.js` 已就位，`enableMocking.ts` 通过 `VITE_USE_MOCK=true` 启用

需要开发的部分：
- 路由配置与页面入口
- 4 个页面组件（Home / Dashboard / FundsList / ClientsList）
- 2 个侧边详情 Drawer（FundDetail / ClientDetail）
- 1 个公共侧边栏 Layout
- API Hooks 层（封装 TanStack Query）
- 样式重置与 AntD 主题定制

---

## 二、路由设计

采用 **BrowserRouter**（Vercel 部署时配合 `vercel.json` SPA fallback）。

| 路径 | 页面 | 布局 |
|------|------|------|
| `/` | `HomePage` | 无侧边栏，居中 |
| `/dashboard` | `DashboardPage` | 带侧边栏 Layout |
| `/funds` | `FundsListPage` | 带侧边栏 Layout |
| `/clients` | `ClientsListPage` | 带侧边栏 Layout |

---

## 三、目录结构与新建/修改文件

```
frontend/src/
├── main.tsx                    # [保持] 已有 QueryClient + Router
├── App.tsx                     # [修改] 配置路由 + ConfigProvider
├── style.css                   # [修改] 重置为基础样式
├── lib/
│   └── queryClient.ts          # [保持]
├── types/                      # [保持]
├── mocks/                      # [保持]
├── stores/
│   └── uiStore.ts              # [新建] Zustand：drawer 开关、当前选中 ID
├── hooks/
│   ├── useFunds.ts             # [新建] useFunds / useFundDetail
│   ├── useClients.ts           # [新建] useClients / useClientDetail
│   ├── useFollowups.ts         # [新建] useFollowups / useCreateFollowup
│   └── useDashboard.ts         # [新建] useDashboardOverview / useScaleByType / useFollowupTrend
├── components/
│   ├── Layout.tsx              # [新建] 侧边栏导航（dashboard/funds/clients 共用）
│   ├── FundDetailDrawer.tsx    # [新建] 产品详情 Drawer
│   └── ClientDetailDrawer.tsx  # [新建] 客户详情 Drawer（含跟进记录 + 新增表单）
├── pages/
│   ├── HomePage.tsx            # [新建] 首页导航入口
│   ├── DashboardPage.tsx       # [新建] 数据概览（统计卡片 + 饼图 + 折线图）
│   ├── FundsListPage.tsx       # [新建] 产品货架（搜索 + 筛选 + 表格 + 分页）
│   └── ClientsListPage.tsx     # [新建] 客户管理（搜索 + 筛选 + 表格 + 分页）
└── utils/
    └── format.ts               # [新建] 金额、百分比、日期格式化工具
```

---

## 四、状态管理（Zustand）

仅管理客户端 UI 状态，服务端状态全部走 TanStack Query：

```typescript
// stores/uiStore.ts
interface UIState {
  fundDrawerOpen: boolean
  selectedFundId: string | null
  openFundDrawer: (id: string) => void
  closeFundDrawer: () => void

  clientDrawerOpen: boolean
  selectedClientId: string | null
  openClientDrawer: (id: string) => void
  closeClientDrawer: () => void
}
```

---

## 五、API Hooks 层

### 5.1 useFunds.ts
- `useFunds(params)` → `GET /api/funds`（keyword/type/status/page）
- `useFundDetail(id)` → `GET /api/funds/:id`（enabled: !!id）

### 5.2 useClients.ts
- `useClients(params)` → `GET /api/clients`（keyword/tier/page）
- `useClientDetail(id)` → `GET /api/clients/:id`（enabled: !!id）

### 5.3 useFollowups.ts
- `useFollowups(clientId, params)` → `GET /api/followups`（enabled: !!clientId）
- `useCreateFollowup()` → `POST /api/followups`（onSuccess: invalidateQueries）

### 5.4 useDashboard.ts
- `useDashboardOverview()` → `GET /api/dashboard/overview`
- `useScaleByType()` → `GET /api/dashboard/scale-by-type`
- `useFollowupTrend()` → `GET /api/dashboard/followup-trend`

---

## 六、公共组件

### Layout.tsx
- 固定左侧 200px 侧边栏（品牌名 + 三个导航项 + active 状态）
- Main 区域 `margin-left: 200px`，`padding: 32px`
- active 状态通过 `useLocation().pathname` 判断

### FundDetailDrawer.tsx
- 宽度 520px，右侧滑出
- 内容：基本信息网格（10 个字段）+ 描述 + 持有人 Table
- 数据来源：`useFundDetail(fundId)`

### ClientDetailDrawer.tsx
- 宽度 560px，右侧滑出
- 内容三段：基本信息 + 持仓 Table + 跟进记录时间线
- 跟进记录含「+ 新增跟进」按钮 → Modal 表单 → `useCreateFollowup()`
- 数据来源：`useClientDetail(clientId)` + `useFollowups(clientId)`

---

## 七、页面组件

### HomePage.tsx（对应 ui-design/index.html）
- 无侧边栏，全屏 flex 居中
- 标题 + 描述 + 三个导航卡片 + 底部声明

### DashboardPage.tsx（对应 ui-design/dashboard.html）
- 统计卡片区：4 张（产品总数 / 在售产品 / 客户总数 / 管理总规模）
- 图表区两列：
  - 饼图：`@ant-design/charts` Pie，在售产品规模按类型占比
  - 折线图：`@ant-design/charts` Line，近 6 个月跟进趋势（总量实线 + 细分虚线）

### FundsListPage.tsx（对应 ui-design/funds-list.html）
- 工具栏：搜索 + 类型筛选 + 状态筛选
- AntD Table：产品名称 / 类型 / 最新净值 / 当前规模 / 状态 / 操作
- 点击「查看」→ 弹出 FundDetailDrawer

### ClientsListPage.tsx（对应 ui-design/clients-list.html）
- 工具栏：搜索 + 等级筛选
- AntD Table：姓名 / 公司 / 职位 / 等级 / 在管资产 / 操作
- 点击「查看」→ 弹出 ClientDetailDrawer

---

## 八、样式与主题

### 全局样式重置
`style.css` 替换为基础 normalize（去掉 Vite 样板样式）。

### Ant Design 主题定制
通过 `ConfigProvider` 设置主题色贴近设计稿：
- `colorPrimary`: `#5b7cff`（接近 oklch(0.52 0.08 240)）
- `colorBgLayout`: `#faf9f7`
- `borderRadius`: 6
- `fontFamily`: Inter, -apple-system, system-ui, sans-serif

---

## 九、关键数据流

### 双向关联（P0 核心需求）
- **正向**：客户详情 → 持仓列表（该客户买了哪些产品）
- **反向**：产品详情 → 持有人列表（该产品被哪些客户持有）
- 实现：MSW handler 通过 `holdings` 关联表联查 `clients` / `funds`

### 新增跟进记录
- ClientDetailDrawer → Modal Form → `POST /api/followups` → invalidateQueries → 列表自动刷新

---

## 十、部署配置

- `vercel.json`：SPA fallback rewrite
- `.env`：`VITE_USE_MOCK=true`
- `public/mockServiceWorker.js`：已存在，确保提交到 Git

---

## 十一、实现步骤

| 步骤 | 内容 | 产出 |
|------|------|------|
| 1 | 基础设施：重置 style.css、index.html title、.env | 开发环境就绪 |
| 2 | 工具层：format.ts + uiStore.ts | 格式化 + 状态管理 |
| 3 | API Hooks：4 个 hook 文件 | 数据获取层 |
| 4 | 公共组件：Layout + 2 个 Drawer | 可复用组件 |
| 5 | 页面组件：4 个 Page | 完整页面 |
| 6 | 路由入口：App.tsx 配置路由 + ConfigProvider | 应用可运行 |
| 7 | 验证：dev 启动 + 功能验证 + build 检查 | 交付确认 |

---

## 十二、P0 交付对照

| P0 要求 | 对应实现 |
|---------|----------|
| 产品货架：列表 + 筛选 + 搜索 + 详情 | FundsListPage + FundDetailDrawer |
| 客户管理：列表 + 双向关联 + 跟进记录 | ClientsListPage + ClientDetailDrawer |
| 数据概览：2 个有业务价值的图表 | DashboardPage（规模占比饼图 + 跟进趋势折线图） |
| 双向关联闭环 | Fund→Holders / Client→Holdings |
