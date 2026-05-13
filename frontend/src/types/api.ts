import type {
  Fund,
  Client,
  FollowUp,
  SalesPerson,
  FundType,
  FundStatus,
  ClientTier,
  FollowUpType,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from './models'

// ============================================================
// 产品货架 API
// ============================================================

/** GET /api/funds - 产品列表查询参数 */
export interface FundListParams extends Partial<PaginationParams> {
  keyword?: string         // 按名称模糊搜索
  type?: FundType          // 按产品类型筛选
  status?: FundStatus      // 按产品状态筛选
  riskLevel?: string       // 按风险等级筛选
}

/** GET /api/funds - 产品列表响应 */
export type FundListResponse = ApiResponse<PaginatedResponse<Fund>>

/** GET /api/funds/:id - 产品详情（含持有人列表） */
export interface FundDetailData {
  fund: Fund
  holders: FundHolder[]    // 持有该产品的客户列表
}

/** 产品详情中的持有人摘要 */
export interface FundHolder {
  clientId: string
  clientName: string
  tier: ClientTier
  amount: number           // 持有金额
  buyDate: string
  returnRate: number
}

export type FundDetailResponse = ApiResponse<FundDetailData>

// ============================================================
// 客户管理 API
// ============================================================

/** GET /api/clients - 客户列表查询参数 */
export interface ClientListParams extends Partial<PaginationParams> {
  keyword?: string         // 按姓名/公司模糊搜索
  tier?: ClientTier        // 按客户等级筛选
}

/** GET /api/clients - 客户列表响应 */
export type ClientListResponse = ApiResponse<PaginatedResponse<Client>>

/** GET /api/clients/:id - 客户详情（含持仓 + 负责业务员） */
export interface ClientDetailData {
  client: Client
  holdings: ClientHolding[]     // 该客户的持仓列表
  salesPerson: SalesPerson      // 负责该客户的业务员信息
}

/** 客户详情中的持仓摘要 */
export interface ClientHolding {
  holdingId: string
  fundId: string
  fundName: string
  fundType: FundType
  amount: number
  returnRate: number
  status: string
}

export type ClientDetailResponse = ApiResponse<ClientDetailData>

// ============================================================
// 跟进记录 API
// ============================================================

/** GET /api/followups?clientId=xxx - 跟进记录列表参数 */
export interface FollowUpListParams extends Partial<PaginationParams> {
  clientId: string
  type?: FollowUpType      // 按跟进方式筛选
}

/** GET /api/followups - 跟进记录列表响应 */
export type FollowUpListResponse = ApiResponse<PaginatedResponse<FollowUp>>

/** POST /api/followups - 新增跟进记录请求体 */
export interface CreateFollowUpBody {
  clientId: string
  salesPersonId: string
  type: FollowUpType
  content: string
  nextAction: string
  nextActionDate: string
}

/** POST /api/followups - 新增跟进记录响应 */
export type CreateFollowUpResponse = ApiResponse<FollowUp>

// ============================================================
// Dashboard API
// ============================================================

/** GET /api/dashboard/overview - 概览数字 */
export interface DashboardOverview {
  totalFunds: number           // 产品总数
  activeFunds: number          // 在售产品数
  totalClients: number         // 客户总数
  totalAum: number             // 管理总规模（元）
}

export type DashboardOverviewResponse = ApiResponse<DashboardOverview>

/** GET /api/dashboard/scale-by-type - 在售产品按类型的规模占比（饼图） */
export interface ScaleByTypeItem {
  type: FundType
  scale: number                // 该类型总规模
  count: number                // 该类型产品数
  percentage: number           // 占比（小数）
}

export type ScaleByTypeResponse = ApiResponse<ScaleByTypeItem[]>

/** GET /api/dashboard/followup-trend - 近 6 个月跟进趋势（折线图） */
export interface FollowUpTrendItem {
  month: string                // YYYY-MM
  count: number                // 该月跟进次数
  byType: Record<FollowUpType, number>  // 按方式细分
}

export type FollowUpTrendResponse = ApiResponse<FollowUpTrendItem[]>
