import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import { useFunds, useFundDetail } from '../../hooks/useFunds'

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

describe('useFunds', () => {
  it('fetches fund list with default params', async () => {
    const { result } = renderHook(() => useFunds(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!
    expect(data.code).toBe(0)
    expect(data.data.list.length).toBeGreaterThan(0)
  })

  it('filters by type', async () => {
    const { result } = renderHook(() => useFunds({ type: '股票型' }), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const list = result.current.data!.data.list
    expect(list.every(f => f.type === '股票型')).toBe(true)
  })

  it('filters by status', async () => {
    const { result } = renderHook(() => useFunds({ status: '运作中' }), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const list = result.current.data!.data.list
    expect(list.every(f => f.status === '运作中')).toBe(true)
  })
})

describe('useFundDetail', () => {
  it('fetches fund detail by id', async () => {
    const { result } = renderHook(() => useFundDetail('F001'), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!.data
    expect(data.fund.id).toBe('F001')
    expect(Array.isArray(data.holders)).toBe(true)
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useFundDetail(null), {
      wrapper: makeWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})
