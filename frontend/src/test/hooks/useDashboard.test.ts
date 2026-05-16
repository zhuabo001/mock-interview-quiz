import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import { useDashboardOverview, useScaleByType, useFollowupTrend } from '../../hooks/useDashboard'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDashboardOverview', () => {
  it('fetches overview data', async () => {
    const { result } = renderHook(() => useDashboardOverview(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!.data
    expect(typeof data.totalFunds).toBe('number')
    expect(typeof data.totalClients).toBe('number')
    expect(typeof data.totalAum).toBe('number')
  })
})

describe('useScaleByType', () => {
  it('fetches scale-by-type data as array', async () => {
    const { result } = renderHook(() => useScaleByType(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!.data
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(typeof data[0].type).toBe('string')
    expect(typeof data[0].percentage).toBe('number')
  })
})

describe('useFollowupTrend', () => {
  it('fetches followup trend data as array', async () => {
    const { result } = renderHook(() => useFollowupTrend(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!.data
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(typeof data[0].month).toBe('string')
    expect(typeof data[0].count).toBe('number')
  })
})
