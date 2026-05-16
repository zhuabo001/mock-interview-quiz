import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import { useClients, useClientDetail } from '../../hooks/useClients'

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

describe('useClients', () => {
  it('fetches client list with default params', async () => {
    const { result } = renderHook(() => useClients(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!
    expect(data.code).toBe(0)
    expect(data.data.list.length).toBeGreaterThan(0)
    expect(data.data.pagination.page).toBe(1)
  })

  it('filters by keyword', async () => {
    const { result } = renderHook(() => useClients({ keyword: '张伟' }), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const list = result.current.data!.data.list
    expect(list.every(c => c.name.includes('张伟') || c.company.includes('张伟'))).toBe(true)
  })

  it('filters by tier', async () => {
    const { result } = renderHook(() => useClients({ tier: '钻石' }), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const list = result.current.data!.data.list
    expect(list.every(c => c.tier === '钻石')).toBe(true)
  })
})

describe('useClientDetail', () => {
  it('fetches client detail by id', async () => {
    const { result } = renderHook(() => useClientDetail('C001'), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!.data
    expect(data.client.id).toBe('C001')
    expect(data.salesPerson).toBeDefined()
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useClientDetail(null), {
      wrapper: makeWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})
