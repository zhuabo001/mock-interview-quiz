import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import FundDetailDrawer from '../../components/FundDetailDrawer'
import { useUIStore } from '../../stores/uiStore'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  useUIStore.setState({ fundDrawerOpen: false, selectedFundId: null })
})
afterAll(() => server.close())

function renderDrawer() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(FundDetailDrawer)
    )
  )
}

describe('FundDetailDrawer', () => {
  it('renders nothing visible when drawer is closed', () => {
    renderDrawer()
    expect(screen.queryByText('基本信息')).not.toBeInTheDocument()
  })

  it('shows fund detail when drawer is opened with a valid id', async () => {
    renderDrawer()
    useUIStore.getState().openFundDrawer('F001')
    await waitFor(() => {
      expect(screen.getByText('基本信息')).toBeInTheDocument()
    })
  })

  it('shows holders section when drawer is open', async () => {
    renderDrawer()
    useUIStore.getState().openFundDrawer('F001')
    await waitFor(() => {
      expect(screen.getByText('持有人')).toBeInTheDocument()
    })
  })
})
