# 技术选型蓝图（基于 P0 交付）

> 选型原则：把时间花在业务建模、双向关联、Dashboard 图表选型和 DESIGN.md 上，而不是基础设施搭建上。P0 的交付范围是四张表的 CRUD + 筛选搜索 + 双向关联 + 2 个图表 + Vercel 部署，所有技术决策都围绕这一目标收敛。

---

## 1. Mock 层：MSW（不选 json-server）

| 维度 | MSW | json-server |
|------|-----|-------------|
| 运行形态 | 浏览器 Service Worker 拦截 | 独立 Node 进程 + 端口 |
| Vercel 部署 | 纯静态，无额外配置 | 需改成 Serverless Functions，额外折腾 |
| 复杂业务逻辑 | 任意 JS，随便写聚合/连表 | RESTful 规范，复杂查询要写 middleware |
| 多模块复用 | P1 的 Mock LLM 也能用同一套 | Agent 这种非 CRUD 场景不好塞 |
| 团队体感 | "真实网络请求"，DevTools 可见 | 也可见，但本地跨端口略麻烦 |

**关键理由**：文档明确要求 Day 4 必须在 Vercel 跑通 Demo，而 Vercel 默认是静态托管。json-server 得额外搭 Serverless 或换平台，为了个 Mock 得不偿失。MSW 打包后就是静态资源，`pnpm build` 完直接 `vercel deploy` 结束战斗。另外 P1 的 AI Agent 方向（智能查询 / 辅助录入）也可以复用 MSW 做 LLM mock，一套基础设施打通两个需求。

**唯一要注意的**：MSW 在生产环境启用 Service Worker 要主动声明（通常用 `VITE_USE_MOCK=true` 开关），别让它在真实后端环境误伤。

---

## 2. 状态管理：TanStack Query + Zustand

这是目前最成熟的「服务端状态 / 客户端状态分离」组合。

### TanStack Query（服务端状态）
- P0 里 90% 的状态都是远程数据：产品列表、客户列表、持仓、跟进记录
- 自带缓存、去重、失效、乐观更新——「双向关联」场景下新增跟进记录后自动让客户详情和产品详情一起失效，一行 `invalidateQueries` 解决
- Loading / Error / Empty 三态（P1 要求）是内置的 `isLoading` / `isError` / `data` 字段，基本不用自己管
- 和 MSW 配合天然顺滑，拦截的就是它发的 fetch

### Zustand（客户端状态）
- 只管那一点点 UI 状态：全局筛选条件、侧栏开合、当前选中的客户 ID 等
- API 比 Redux Toolkit 少一半，4 天项目不想写 slice + reducer + action 三层仪式
- 无需 Provider 包裹，Store 直接 import 就能用

### 为什么不用 Redux Toolkit + RTK Query？
RTK Query 功能上等价于 TanStack Query，但绑定了 Redux 的心智负担。题目是打磨 MVP，不是演示企业级架构，选更轻的组合把时间省下来给业务逻辑和 DESIGN.md。

### 为什么不用 Context + useReducer 手搓？
持仓的双向查询、Dashboard 的聚合数据会涉及跨页面缓存共享，手搓缓存失效策略是性价比最低的选择。

---

## 3. UI 组件库：Ant Design + @ant-design/charts

### Ant Design
- 基金销售系统本质是 B 端后台，Ant Design 是这个赛道的标准答案
- `Table` 内置排序 / 筛选 / 分页 / 空态，产品货架和客户列表一把梭
- `Form` + `Modal` / `Drawer` 把跟进记录新增表单直接配齐，省掉表单库
- 中文语境原生，文案规范贴合题目场景（基金名、客户、金额）
- 题目文档里点名的两个候选之一，稳

### 为什么不用 shadcn/ui？
美学更现代，但需要自己组装 Table 的分页 / 排序 / 筛选，Form 也要配 react-hook-form + zod。4 天项目里这部分组装时间是纯损耗，拿不到加分。如果题目是 C 端产品展示，shadcn 会更合适。

### @ant-design/charts（Dashboard 两张图）
- 和 Ant Design 同厂出品，主题、字体、间距天然一致
- 饼图、折线图、柱状图 API 极简，写两张图不超过 100 行
- 底层 G2Plot 成熟，应付题目要求的「规模占比 / 跟进趋势」绰绰有余

### 备选
如果对 ECharts 更熟，换成 `echarts-for-react` 也完全可以，但要自己调一下色板匹配 AntD 主题。

---

## 完整技术栈一览

```
Vite + React 18 + TypeScript
├─ 数据层    MSW + TanStack Query
├─ UI 状态   Zustand
├─ UI 组件   Ant Design 5.x
├─ 图表      @ant-design/charts
├─ 路由      React Router v6
└─ 部署      Vercel（静态）
```

---

## 选型背后的共性判断

1. **静态优先**：所有选择都确保 `pnpm build` 产物能直接丢到 Vercel，不引入任何需要运行时服务的组件，规避 Day 4 部署翻车风险。
2. **成熟配套优先**：TanStack Query + Zustand、Ant Design + @ant-design/charts，都是官方或社区广泛验证的组合拳，避免自己拼接生态造成的隐性成本。
3. **留空间给业务**：基础设施越轻，越能把时间投到「双向关联的数据建模」「Dashboard 图表的业务选型」「DESIGN.md 的取舍论述」这些真正拉开评分差距的地方。

---

## 部署方案：Vercel Hobby 计划

### 一、前置动作清单

**1. 账号注册（2 个，都免费）**
- **GitHub 账号**：代码托管。Vercel 最顺滑的部署方式是绑定 Git 仓库，push 即自动部署
- **Vercel 账号**：直接用 GitHub OAuth 登录即可，不用单独注册。选 Hobby（个人版）计划

**2. 代码侧准备**
- 项目推到 GitHub 仓库（public 或 private 都可以，Hobby 计划都支持）
- 确保 `package.json` 里有 `build` 脚本（Vite 默认就是 `vite build`）
- 产物目录是 `dist`（Vite 默认），Vercel 会自动识别 Vite 项目
- **MSW 的 Service Worker 文件**（`public/mockServiceWorker.js`）要提交到 Git,别被 `.gitignore` 掉——这是最容易踩的坑
- 根目录加个 `vercel.json`（可选）处理 SPA 路由回退:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

**3. 部署动作**
- 在 Vercel 控制台点 "Import Project" → 选 GitHub 仓库 → 基本一路 Next
- 首次部署完成后会得到形如 `your-project-xxx.vercel.app` 的地址，**这就是交付 Demo 的 URL**

### 二、需要申请 API Key 或域名吗？

**都不需要。**

- **API Key**：Vercel 自身不需要。项目是纯前端 + MSW，无外部服务依赖。P1 阶段若接真实 LLM 才需要 OpenAI / Anthropic key
- **域名**：默认给 `*.vercel.app` 二级域名，演示完全够用。自定义域名才需要花钱买（年费约 $10-15），本次 MVP 用不着

### 三、收费情况

**本场景：0 元，且不会被扣费。**

Hobby 计划（免费版）限额：
- **100 GB 带宽 / 月** — 演示级项目用不掉 1%
- **6000 分钟构建时间 / 月** — Vite 构建一次几十秒，随便推
- **商用限制** — Hobby 计划不允许商业用途，个人项目 / 作品集 / 面试 Demo 完全 OK

**超限机制**：Hobby 计划不是「超了就扣钱」，而是超限后暂停服务,等 30 天周期重置。即便代码有 bug 被流量打爆，最坏结果也只是 Demo 临时挂掉,**不会产生任何费用**。

**何时才需要付费**：
- 商业化 → Pro 计划 $20 / 月 / 人
- 团队协作需要 seat → Pro
- 需要密码保护预览、自定义分析 → Pro

以上与当前需求均无关。

### 四、交付前的最后一公里

题目文档专门警告「Day 4 部署挂了基本等于没交」，因此:

1. **别等到 Day 4 才第一次部署**：Day 1 骨架搭完就先推一次，确认 CI 通路畅通
2. **MSW 在生产环境的启用开关要测一次**：本地 dev 用 Vite proxy 没事，部署上去如果 Service Worker 没注册，所有接口会 404
3. **录屏兜底**：即便 Vercel 正常，网络抽风也可能影响面试官访问，本地录个 2-3 分钟的演示视频塞进交付物里
