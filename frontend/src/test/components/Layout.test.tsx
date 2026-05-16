import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AppLayout from '../../components/Layout'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLayout(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppLayout />
    </MemoryRouter>
  )
}

describe('AppLayout', () => {
  it('renders the sidebar brand title', () => {
    renderLayout()
    expect(screen.getByText('基金销售管理')).toBeInTheDocument()
  })

  it('renders all nav menu items', () => {
    renderLayout()
    expect(screen.getByText('数据概览')).toBeInTheDocument()
    expect(screen.getByText('产品货架')).toBeInTheDocument()
    expect(screen.getByText('客户管理')).toBeInTheDocument()
  })

  it('navigates when clicking a menu item', async () => {
    renderLayout()
    await userEvent.click(screen.getByText('产品货架'))
    expect(mockNavigate).toHaveBeenCalledWith('/funds')
  })
})
