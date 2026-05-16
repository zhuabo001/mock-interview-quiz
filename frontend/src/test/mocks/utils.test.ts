import { describe, it, expect } from 'vitest'
import { ok, paginate } from '../../mocks/utils'

describe('ok', () => {
  it('wraps data with code 0 and success message', () => {
    const result = ok({ id: '1' })
    expect(result).toEqual({ code: 0, message: 'success', data: { id: '1' } })
  })

  it('works with array data', () => {
    const result = ok([1, 2, 3])
    expect(result.data).toEqual([1, 2, 3])
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }))

  it('returns first page correctly', () => {
    const result = paginate(items, 1, 10)
    expect(result.list).toHaveLength(10)
    expect(result.list[0]).toEqual({ id: 1 })
    expect(result.pagination).toEqual({ page: 1, pageSize: 10, total: 25, totalPages: 3 })
  })

  it('returns last page with remaining items', () => {
    const result = paginate(items, 3, 10)
    expect(result.list).toHaveLength(5)
    expect(result.list[0]).toEqual({ id: 21 })
  })

  it('returns empty list for out-of-range page', () => {
    const result = paginate(items, 10, 10)
    expect(result.list).toHaveLength(0)
  })

  it('uses defaults when page/pageSize omitted', () => {
    const result = paginate(items)
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.pageSize).toBe(10)
  })
})
