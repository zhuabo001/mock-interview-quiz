import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import App from '../App'

function renderApp(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [initialPath] },
        createElement(App)
      )
    )
  )
}

describe('App routing', () => {
  it('renders HomePage at /', () => {
    renderApp('/')
    expect(screen.getByText('基金销售管理工具')).toBeInTheDocument()
  })

  it('renders Layout sidebar at /dashboard', () => {
    renderApp('/dashboard')
    expect(screen.getByText('基金销售管理')).toBeInTheDocument()
  })

  it('renders Layout sidebar at /funds', () => {
    renderApp('/funds')
    expect(screen.getByText('基金销售管理')).toBeInTheDocument()
  })

  it('redirects unknown routes to /', () => {
    renderApp('/unknown-route')
    expect(screen.getByText('基金销售管理工具')).toBeInTheDocument()
  })
})
