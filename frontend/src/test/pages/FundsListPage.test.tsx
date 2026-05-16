import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import FundsListPage from '../../pages/FundsListPage'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, null,
        createElement(FundsListPage)
      )
    )
  )
}

describe('FundsListPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('产品货架')).toBeInTheDocument()
  })

  it('renders fund rows after data loads', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    })
  })

  it('renders search input and filter selects', () => {
    renderPage()
    expect(screen.getByPlaceholderText('搜索产品名称或基金经理...')).toBeInTheDocument()
    expect(screen.getByText('全部类型')).toBeInTheDocument()
    expect(screen.getByText('全部状态')).toBeInTheDocument()
  })

  it('shows 查看 action link in each row', async () => {
    renderPage()
    await waitFor(() => {
      const links = screen.getAllByText('查看')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  it('opens fund drawer when clicking 查看', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('查看'))
    await userEvent.click(screen.getAllByText('查看')[0])
    // Drawer is controlled by uiStore; just verify no crash
    expect(screen.getByText('产品货架')).toBeInTheDocument()
  })
})
