import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  toolsDrawerOpen: boolean
  helpOpen: boolean
  compareOpen: boolean
  notificationsRead: boolean

  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
  setToolsDrawerOpen: (open: boolean) => void
  setHelpOpen: (open: boolean) => void
  setCompareOpen: (open: boolean) => void
  markNotificationsRead: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  toolsDrawerOpen: false,
  helpOpen: false,
  compareOpen: false,
  notificationsRead: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setToolsDrawerOpen: (toolsDrawerOpen) => set({ toolsDrawerOpen }),
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  setCompareOpen: (compareOpen) => set({ compareOpen }),
  markNotificationsRead: () => set({ notificationsRead: true }),
}))
