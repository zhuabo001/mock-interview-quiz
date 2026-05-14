import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  FollowUpListParams,
  FollowUpListResponse,
  CreateFollowUpBody,
  CreateFollowUpResponse,
} from '../types'

export function useFollowups(clientId: string | null, params: Partial<FollowUpListParams> = {}) {
  const { type, page = 1, pageSize = 10 } = params
  return useQuery({
    queryKey: ['followups', clientId, { type, page, pageSize }],
    queryFn: async (): Promise<FollowUpListResponse> => {
      const p = new URLSearchParams({ clientId: clientId!, page: String(page), pageSize: String(pageSize) })
      if (type) p.set('type', type)
      const res = await fetch(`/api/followups?${p}`)
      return res.json()
    },
    enabled: !!clientId,
  })
}

export function useCreateFollowup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateFollowUpBody): Promise<CreateFollowUpResponse> => {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['followups', variables.clientId] })
    },
  })
}
