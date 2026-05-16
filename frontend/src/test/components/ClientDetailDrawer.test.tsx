import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import ClientDetailDrawer from '../../components/ClientDetailDrawer'
import { useUIStore } from '../../stores/uiStore'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  useUIStore.setState({ clientDrawerOpen: false, selectedClientId: null })
})
afterAll(() => server.close())

function renderDrawer() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(ClientDetailDrawer)
    )
  )
}

describe('ClientDetailDrawer', () => {
  it('renders nothing visible when drawer is closed', () => {
    renderDrawer()
    expect(screen.queryByText('基本信息')).not.toBeInTheDocument()
  })

  it('shows client detail when drawer is opened with a valid id', async () => {
    renderDrawer()
    useUIStore.getState().openClientDrawer('C001')
    await waitFor(() => {
      expect(screen.getByText('基本信息')).toBeInTheDocument()
    })
  })

  it('shows holdings and followup sections', async () => {
    renderDrawer()
    useUIStore.getState().openClientDrawer('C001')
    await waitFor(() => {
      expect(screen.getByText('持仓')).toBeInTheDocument()
      expect(screen.getByText('跟进记录')).toBeInTheDocument()
    })
  })

  it('shows 新增跟进 button', async () => {
    renderDrawer()
    useUIStore.getState().openClientDrawer('C001')
    await waitFor(() => {
      expect(screen.getByText('+ 新增跟进')).toBeInTheDocument()
    })
  })

  it('opens add followup modal when clicking 新增跟进', async () => {
    renderDrawer()
    useUIStore.getState().openClientDrawer('C001')
    await waitFor(() => screen.getByText('+ 新增跟进'))
    await userEvent.click(screen.getByText('+ 新增跟进'))
    await waitFor(() => {
      expect(screen.getByText('新增跟进记录')).toBeInTheDocument()
    })
  })
})
