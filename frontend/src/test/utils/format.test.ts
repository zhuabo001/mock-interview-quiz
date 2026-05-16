import { describe, it, expect } from 'vitest'
import { formatAmount, formatPercent, formatNav, formatDate } from '../../utils/format'

describe('formatAmount', () => {
  it('converts yuan >= 1e8 to 亿', () => {
    expect(formatAmount(4780000000)).toBe('47.80 亿')
  })

  it('converts yuan < 1e8 to 万', () => {
    expect(formatAmount(50000000)).toBe('5,000.00 万')
  })

  it('handles exactly 1e8', () => {
    expect(formatAmount(1e8)).toBe('1.00 亿')
  })
})

describe('formatPercent', () => {
  it('adds + prefix for positive rate', () => {
    expect(formatPercent(0.3725)).toBe('+37.25%')
  })

  it('keeps - prefix for negative rate', () => {
    expect(formatPercent(-0.05)).toBe('-5.00%')
  })

  it('adds + prefix for zero', () => {
    expect(formatPercent(0)).toBe('+0.00%')
  })
})

describe('formatNav', () => {
  it('formats to 4 decimal places', () => {
    expect(formatNav(1.4823)).toBe('1.4823')
  })

  it('pads with zeros when needed', () => {
    expect(formatNav(1.1)).toBe('1.1000')
  })
})

describe('formatDate', () => {
  it('returns YYYY-MM-DD from full datetime string', () => {
    expect(formatDate('2024-03-15T10:30:00Z')).toBe('2024-03-15')
  })

  it('returns same string when already YYYY-MM-DD', () => {
    expect(formatDate('2024-03-15')).toBe('2024-03-15')
  })
})
