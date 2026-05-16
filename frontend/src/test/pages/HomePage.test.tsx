import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../../pages/HomePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  it('renders the page title', () => {
    renderHomePage()
    expect(screen.getByText('基金销售管理工具')).toBeInTheDocument()
  })

  it('renders all three nav cards', () => {
    renderHomePage()
    expect(screen.getByText('数据概览')).toBeInTheDocument()
    expect(screen.getByText('产品货架')).toBeInTheDocument()
    expect(screen.getByText('客户管理')).toBeInTheDocument()
  })

  it('navigates to /dashboard when clicking 数据概览', async () => {
    renderHomePage()
    await userEvent.click(screen.getByText('数据概览'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('navigates to /funds when clicking 产品货架', async () => {
    renderHomePage()
    await userEvent.click(screen.getByText('产品货架'))
    expect(mockNavigate).toHaveBeenCalledWith('/funds')
  })

  it('navigates to /clients when clicking 客户管理', async () => {
    renderHomePage()
    await userEvent.click(screen.getByText('客户管理'))
    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })
})
