import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../../stores/uiStore'

beforeEach(() => {
  useUIStore.setState({
    fundDrawerOpen: false,
    selectedFundId: null,
    clientDrawerOpen: false,
    selectedClientId: null,
  })
})

describe('uiStore - fund drawer', () => {
  it('opens fund drawer with given id', () => {
    useUIStore.getState().openFundDrawer('F001')
    const state = useUIStore.getState()
    expect(state.fundDrawerOpen).toBe(true)
    expect(state.selectedFundId).toBe('F001')
  })

  it('closes fund drawer and clears id', () => {
    useUIStore.getState().openFundDrawer('F001')
    useUIStore.getState().closeFundDrawer()
    const state = useUIStore.getState()
    expect(state.fundDrawerOpen).toBe(false)
    expect(state.selectedFundId).toBeNull()
  })
})

describe('uiStore - client drawer', () => {
  it('opens client drawer with given id', () => {
    useUIStore.getState().openClientDrawer('C001')
    const state = useUIStore.getState()
    expect(state.clientDrawerOpen).toBe(true)
    expect(state.selectedClientId).toBe('C001')
  })

  it('closes client drawer and clears id', () => {
    useUIStore.getState().openClientDrawer('C001')
    useUIStore.getState().closeClientDrawer()
    const state = useUIStore.getState()
    expect(state.clientDrawerOpen).toBe(false)
    expect(state.selectedClientId).toBeNull()
  })

  it('fund and client drawers are independent', () => {
    useUIStore.getState().openFundDrawer('F001')
    useUIStore.getState().openClientDrawer('C001')
    const state = useUIStore.getState()
    expect(state.fundDrawerOpen).toBe(true)
    expect(state.clientDrawerOpen).toBe(true)
  })
})
