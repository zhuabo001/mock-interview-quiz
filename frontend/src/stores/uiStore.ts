import { create } from 'zustand'

interface UIState {
  // Fund Detail Drawer
  fundDrawerOpen: boolean
  selectedFundId: string | null
  openFundDrawer: (id: string) => void
  closeFundDrawer: () => void

  // Client Detail Drawer
  clientDrawerOpen: boolean
  selectedClientId: string | null
  openClientDrawer: (id: string) => void
  closeClientDrawer: () => void
}

export const useUIStore = create<UIState>((set) => ({
  fundDrawerOpen: false,
  selectedFundId: null,
  openFundDrawer: (id) => set({ fundDrawerOpen: true, selectedFundId: id }),
  closeFundDrawer: () => set({ fundDrawerOpen: false, selectedFundId: null }),

  clientDrawerOpen: false,
  selectedClientId: null,
  openClientDrawer: (id) => set({ clientDrawerOpen: true, selectedClientId: id }),
  closeClientDrawer: () => set({ clientDrawerOpen: false, selectedClientId: null }),
}))
