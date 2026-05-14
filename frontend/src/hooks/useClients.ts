import { useQuery } from '@tanstack/react-query'
import type { ClientListParams, ClientListResponse, ClientDetailResponse } from '../types'

export function useClients(params: ClientListParams = {}) {
  const { keyword = '', tier, page = 1, pageSize = 10 } = params
  return useQuery({
    queryKey: ['clients', { keyword, tier, page, pageSize }],
    queryFn: async (): Promise<ClientListResponse> => {
      const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (keyword) p.set('keyword', keyword)
      if (tier) p.set('tier', tier)
      const res = await fetch(`/api/clients?${p}`)
      return res.json()
    },
  })
}

export function useClientDetail(id: string | null) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async (): Promise<ClientDetailResponse> => {
      const res = await fetch(`/api/clients/${id}`)
      return res.json()
    },
    enabled: !!id,
  })
}
