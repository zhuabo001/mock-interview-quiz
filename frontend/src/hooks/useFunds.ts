import { useQuery } from '@tanstack/react-query'
import type { FundListParams, FundListResponse, FundDetailResponse } from '../types'

export function useFunds(params: FundListParams = {}) {
  const { keyword = '', type, status, riskLevel, page = 1, pageSize = 10 } = params
  return useQuery({
    queryKey: ['funds', { keyword, type, status, riskLevel, page, pageSize }],
    queryFn: async (): Promise<FundListResponse> => {
      const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (keyword) p.set('keyword', keyword)
      if (type) p.set('type', type)
      if (status) p.set('status', status)
      if (riskLevel) p.set('riskLevel', riskLevel)
      const res = await fetch(`/api/funds?${p}`)
      return res.json()
    },
  })
}

export function useFundDetail(id: string | null) {
  return useQuery({
    queryKey: ['fund', id],
    queryFn: async (): Promise<FundDetailResponse> => {
      const res = await fetch(`/api/funds/${id}`)
      return res.json()
    },
    enabled: !!id,
  })
}
