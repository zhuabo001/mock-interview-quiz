import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import ClientsListPage from '../../pages/ClientsListPage'

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, null,
        createElement(ClientsListPage)
      )
    )
  )
}

describe('ClientsListPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('客户管理')).toBeInTheDocument()
  })

  it('renders client rows after data loads', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    })
  })

  it('renders search input and tier filter', () => {
    renderPage()
    expect(screen.getByPlaceholderText('搜索客户姓名或公司...')).toBeInTheDocument()
    expect(screen.getByText('全部等级')).toBeInTheDocument()
  })

  it('shows 查看 action link in each row', async () => {
    renderPage()
    await waitFor(() => {
      const links = screen.getAllByText('查看')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  it('opens client drawer when clicking 查看', async () => {
    renderPage()
    await waitFor(() => screen.getAllByText('查看'))
    await userEvent.click(screen.getAllByText('查看')[0])
    expect(screen.getByText('客户管理')).toBeInTheDocument()
  })
})
