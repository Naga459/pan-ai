import { create } from 'zustand'
import { api, type HealthResponse } from '../lib/api'

export type ApiStatus = 'checking' | 'online' | 'offline'

interface AppState {
  apiStatus: ApiStatus
  health: HealthResponse | null
  checkHealth: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  apiStatus: 'checking',
  health: null,
  checkHealth: async () => {
    set({ apiStatus: 'checking' })
    try {
      const health = await api.health()
      set({ apiStatus: 'online', health })
    } catch {
      set({ apiStatus: 'offline', health: null })
    }
  },
}))
