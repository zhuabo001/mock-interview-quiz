import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import { useFollowups, useCreateFollowup } from '../../hooks/useFollowups'

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

describe('useFollowups', () => {
  it('fetches followups for a client', async () => {
    const { result } = renderHook(() => useFollowups('C001'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const data = result.current.data!.data
    expect(data.list.every(f => f.clientId === 'C001')).toBe(true)
  })

  it('does not fetch when clientId is null', () => {
    const { result } = renderHook(() => useFollowups(null), { wrapper: makeWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateFollowup', () => {
  it('creates a new followup record', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useCreateFollowup(), { wrapper })

    await act(async () => {
      result.current.mutate({
        clientId: 'C001',
        salesPersonId: 'S001',
        type: '电话',
        content: '测试跟进内容',
        nextAction: '发送产品资料',
        nextActionDate: '2026-06-01',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const created = result.current.data!.data
    expect(created.clientId).toBe('C001')
    expect(created.type).toBe('电话')
  })
})
