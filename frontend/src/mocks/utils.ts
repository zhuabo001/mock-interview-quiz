import type { ApiResponse, PaginatedResponse } from '../types'

/**
 * 统一响应包装
 */
export function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'success', data }
}

/**
 * 分页切片工具
 */
export function paginate<T>(
  list: T[],
  page = 1,
  pageSize = 10
): PaginatedResponse<T> {
  const total = list.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    list: list.slice(start, end),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  }
}
