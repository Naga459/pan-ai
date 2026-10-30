import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorInfo: '#2563eb',
    colorSuccess: '#16a34a',
    borderRadius: 10,
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#0b1b3f',
      bodyBg: '#f4f7fc',
      headerBg: '#ffffff',
    },
  },
}
