import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { createElement } from 'react'
import { handlers } from '../../mocks/handlers'
import DashboardPage from '../../pages/DashboardPage'

vi.mock('@ant-design/charts', () => ({
  Pie: () => createElement('div', { 'data-testid': 'pie-chart' }),
  Line: () => createElement('div', { 'data-testid': 'line-chart' }),
}))

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, null,
        createElement(DashboardPage)
      )
    )
  )
}

describe('DashboardPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('数据概览')).toBeInTheDocument()
  })

  it('renders overview stat cards after data loads', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('产品总数')).toBeInTheDocument()
      expect(screen.getByText('在售产品')).toBeInTheDocument()
      expect(screen.getByText('客户总数')).toBeInTheDocument()
      expect(screen.getByText('管理总规模')).toBeInTheDocument()
    })
  })

  it('renders chart section titles', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('在售产品规模占比')).toBeInTheDocument()
      expect(screen.getByText('跟进趋势')).toBeInTheDocument()
    })
  })

  it('renders pie and line charts', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
