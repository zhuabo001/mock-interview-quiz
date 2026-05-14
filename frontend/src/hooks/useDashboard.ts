import { useQuery } from '@tanstack/react-query'
import type {
  DashboardOverviewResponse,
  ScaleByTypeResponse,
  FollowUpTrendResponse,
} from '../types'

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async (): Promise<DashboardOverviewResponse> => {
      const res = await fetch('/api/dashboard/overview')
      return res.json()
    },
  })
}

export function useScaleByType() {
  return useQuery({
    queryKey: ['dashboard', 'scale-by-type'],
    queryFn: async (): Promise<ScaleByTypeResponse> => {
      const res = await fetch('/api/dashboard/scale-by-type')
      return res.json()
    },
  })
}

export function useFollowupTrend() {
  return useQuery({
    queryKey: ['dashboard', 'followup-trend'],
    queryFn: async (): Promise<FollowUpTrendResponse> => {
      const res = await fetch('/api/dashboard/followup-trend')
      return res.json()
    },
  })
}
