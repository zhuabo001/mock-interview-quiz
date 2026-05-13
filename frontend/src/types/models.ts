// ============================================================
// 基础实体类型
// ============================================================

/** 产品类型 */
export type FundType = '股票型' | '债券型' | '混合型' | '货币型' | '指数型'

/** 产品状态 */
export type FundStatus = '募集中' | '运作中' | '已清盘'

/** 风险等级 */
export type RiskLevel = 'R1' | 'R2' | 'R3' | 'R4' | 'R5'

/** 客户等级（按资产规模） */
export type ClientTier = '钻石' | '金' | '银' | '铜' | '潜客'

/** 跟进方式 */
export type FollowUpType = '电话' | '面谈' | '微信' | '邮件'

/** 持仓状态 */
export type HoldingStatus = '持有中' | '已赎回' | '部分赎回'

// ============================================================
// 核心实体
// ============================================================

/** 基金产品 */
export interface Fund {
  id: string
  name: string
  type: FundType
  status: FundStatus
  nav: number              // 最新净值
  navDate: string          // 净值日期 YYYY-MM-DD
  establishNav: number     // 成立净值（行业惯例为 1.0000）
  totalReturn: number      // 成立以来总回报率（小数，由 (nav - establishNav) / establishNav 得出）
  totalScale: number       // 成立规模（元）
  currentScale: number     // 当前规模（元）
  fundManager: string      // 基金经理
  establishDate: string    // 成立日期 YYYY-MM-DD
  riskLevel: RiskLevel
  minInvestment: number    // 最低认购金额（元）
  annualReturn: number     // 年化收益率（小数，如 0.0823 = 8.23%）
  description: string
}

/** 客户 */
export interface Client {
  id: string
  name: string
  phone: string
  company: string
  position: string
  tier: ClientTier
  totalAssets: number      // 在管总资产（元）
  source: string           // 客户来源
  tags: string[]           // 标签
  salesPersonId: string    // 负责该客户的业务员 ID
  createdAt: string        // 建档日期 YYYY-MM-DD
}

/** 持仓关系（客户-产品多对多的关联表） */
export interface Holding {
  id: string
  clientId: string
  fundId: string
  amount: number           // 持有金额（元）
  shares: number           // 持有份额
  buyDate: string          // 买入日期 YYYY-MM-DD
  buyNav: number           // 买入净值
  currentNav: number       // 当前净值（冗余，方便展示）
  returnRate: number       // 浮动收益率（小数）
  status: HoldingStatus
}

/** 跟进记录 */
export interface FollowUp {
  id: string
  clientId: string
  salesPersonId: string    // 记录该跟进的业务员 ID
  type: FollowUpType
  content: string          // 跟进内容
  nextAction: string       // 下一步计划
  nextActionDate: string   // 下一步日期 YYYY-MM-DD
  createdAt: string        // 记录时间 YYYY-MM-DD HH:mm:ss
}

/** 业务员/销售 */
export interface SalesPerson {
  id: string
  name: string
  department: string
  phone: string
  email: string
  avatar?: string
}

// ============================================================
// API 通用结构
// ============================================================

/** 分页参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 分页响应元数据 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** 统一响应包装 */
export interface ApiResponse<T> {
  code: number             // 0 = 成功
  message: string
  data: T
}

/** 分页列表响应 */
export interface PaginatedResponse<T> {
  list: T[]
  pagination: PaginationMeta
}
