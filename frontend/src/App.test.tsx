import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useAppStore } from './store/appStore'

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, ...response })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    useAppStore.setState({ apiStatus: 'checking', health: null })
  })

  it('renders PAN AI branding and navigation', () => {
    mockFetch({ json: async () => ({}) })
    render(<App />)
    expect(screen.getByRole('heading', { name: 'PAN AI' })).toBeInTheDocument()
    expect(screen.getByText("Hello! I'm PAN AI")).toBeInTheDocument()
    for (const label of ['Chat', 'New Chat', 'Chat History', 'Uploaded Documents']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('shows Online when the API health check succeeds', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ status: 'ok', service: 'PAN AI API', version: '0.1.0', environment: 'test' }),
    })
    render(<App />)
    expect(await screen.findByText('Online')).toBeInTheDocument()
    expect(screen.getByTestId('api-version')).toHaveTextContent('PAN AI API v0.1.0')
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/health', expect.anything())
  })

  it('shows API offline when the health check fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))
    render(<App />)
    expect(await screen.findByText('API offline')).toBeInTheDocument()
  })
})
