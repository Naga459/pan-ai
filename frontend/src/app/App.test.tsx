import { App as AntApp, ConfigProvider } from 'antd'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../store/appStore'
import { useChatStore } from '../store/chatStore'
import { useUiStore } from '../store/uiStore'
import App from './App'

function renderApp() {
  const user = userEvent.setup({ applyAccept: false })
  render(
    <ConfigProvider>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>,
  )
  return user
}

function stubHealth(ok: boolean) {
  vi.stubGlobal(
    'fetch',
    ok
      ? vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ status: 'ok', service: 'PAN AI API', version: '0.1.0', environment: 'test' }),
        })
      : vi.fn().mockRejectedValue(new TypeError('network down')),
  )
}

const composer = () => screen.getByRole('textbox', { name: 'Message PAN AI' })
const conversationLog = () => screen.getByRole('log', { name: 'Conversation' })

function pngFile(name = 'my_pan.png', size = 4096) {
  const f = new File(['png'], name, { type: 'image/png' })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

beforeEach(() => {
  useChatStore.getState().resetDemo()
  useChatStore.setState({ responseDelayMs: 0 })
  useUiStore.setState({ sidebarCollapsed: false, mobileNavOpen: false, toolsDrawerOpen: false, compareOpen: false, helpOpen: false })
  useAppStore.setState({ apiStatus: 'checking', health: null })
  stubHealth(true)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('PAN AI chatbot UI', () => {
  it('renders the mockup layout with synthetic demo data', async () => {
    renderApp()
    expect(await screen.findByText('Online · Demo')).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    for (const label of ['Chat', 'New Chat', 'Chat History', 'Uploaded Documents']) {
      expect(within(nav).getByRole('button', { name: label })).toBeInTheDocument()
    }
    const recent = screen.getByRole('list', { name: 'Recent chats' })
    expect(within(recent).getAllByRole('button')).toHaveLength(5)

    expect(screen.getByRole('heading', { name: "Hello! I'm PAN AI" })).toBeInTheDocument()
    const welcome = screen.getByRole('region', { name: "Hello! I'm PAN AI" })
    for (const title of ['Extract from PAN', 'Extract PAN Number', 'Validate PAN', 'Ask PAN Question']) {
      expect(within(welcome).getByRole('button', { name: new RegExp(`^${title}`) })).toBeInTheDocument()
    }

    const card = screen.getByTestId('pan-extraction-card')
    expect(within(card).getAllByText('ABCPS1234F').length).toBeGreaterThan(0)
    expect(within(card).getByText('Format Valid')).toBeInTheDocument()
    expect(within(card).getByText('Demo data')).toBeInTheDocument()
    expect(within(card).getByText('Not checked')).toBeInTheDocument()
    expect(within(card).getByText(/not government verification/)).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Attached Document' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Chat Tools' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Example Questions' })).toBeInTheDocument()
  })

  it('shows an offline demo status when the API is unreachable', async () => {
    stubHealth(false)
    renderApp()
    expect(await screen.findByText('Offline · Demo')).toBeInTheDocument()
  })

  it('creates a new chat, sends with Enter and renders a labelled demo reply', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'New Chat' }))
    expect(screen.getByText('Start a new PAN conversation')).toBeInTheDocument()

    await user.type(composer(), 'What is PAN?')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(composer()).toHaveValue('What is PAN?\n')
    await user.keyboard('{Enter}')

    const log = conversationLog()
    expect(within(log).getByText('What is PAN?')).toBeInTheDocument()
    expect(await within(log).findByText(/10-character alphanumeric identifier/)).toBeInTheDocument()
    expect(within(log).getByText('Demo response')).toBeInTheDocument()
    expect(composer()).toHaveValue('')
    // The new chat is titled from its first message, alongside the sample "What is PAN?" chat.
    const recent = screen.getByRole('list', { name: 'Recent chats' })
    expect(within(recent).getAllByText('What is PAN?', { selector: 'span' })).toHaveLength(2)
  })

  it('disables sending while a reply is pending', async () => {
    useChatStore.setState({ responseDelayMs: 200 })
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'New Chat' }))
    await user.type(composer(), 'What is PAN?{Enter}')
    expect(screen.getByRole('button', { name: 'Waiting for response' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(/preparing a demo response/)
    expect(await screen.findByText(/10-character alphanumeric identifier/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled() // empty draft
  })

  it('switches between saved conversations', async () => {
    const user = renderApp()
    const recent = screen.getByRole('list', { name: 'Recent chats' })
    await user.click(within(recent).getByRole('button', { name: /Documents required/ }))
    expect(within(conversationLog()).getByText(/Proof of identity/)).toBeInTheDocument()
    expect(screen.queryByTestId('pan-extraction-card')).not.toBeInTheDocument()

    await user.click(within(recent).getByRole('button', { name: /Extract PAN details/ }))
    expect(screen.getByTestId('pan-extraction-card')).toBeInTheDocument()
  })

  it('validates PAN format locally and never claims government verification', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'New Chat' }))
    await user.type(composer(), 'Validate ABCDE1234F{Enter}')
    const card = await screen.findByTestId('pan-validation-card')
    expect(within(card).getByText('Format Invalid')).toBeInTheDocument()
    expect(within(card).getByText('Unknown')).toBeInTheDocument()
    expect(within(card).getByText('Not checked')).toBeInTheDocument()

    await user.type(composer(), 'Is AAACC1234A valid?{Enter}')
    await waitFor(() => expect(screen.getAllByTestId('pan-validation-card')).toHaveLength(2))
    const second = screen.getAllByTestId('pan-validation-card')[1]
    expect(within(second).getByText('Format Valid')).toBeInTheDocument()
    expect(within(second).getByText('Company (C)')).toBeInTheDocument()
  })

  it('refuses questions outside the PAN scope', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'New Chat' }))
    await user.type(composer(), 'Tell me a joke about cricket{Enter}')
    expect(await screen.findByText(/can only help with/)).toBeInTheDocument()
  })

  it('attaches, previews and removes a document', async () => {
    const user = renderApp()
    await user.upload(screen.getByTestId('file-input'), pngFile())
    const panel = screen.getByRole('region', { name: 'Attached Document' })
    expect(within(panel).getByText('my_pan.png')).toBeInTheDocument()
    expect(within(panel).getByText('4.0 KB')).toBeInTheDocument()

    // Same attachment is previewed above the composer too; remove it from there.
    await user.click(screen.getByRole('button', { name: 'Remove attachment' }))
    expect(screen.queryByText('my_pan.png')).not.toBeInTheDocument()
  })

  it('rejects unsupported and oversized files', async () => {
    const user = renderApp()
    await user.upload(screen.getByTestId('file-input'), new File(['x'], 'notes.txt', { type: 'text/plain' }))
    const inlineError = () => screen.getByText(/not supported|The limit is/, { selector: 'p' })
    expect(inlineError()).toHaveTextContent('"notes.txt" is not supported')

    await user.upload(screen.getByTestId('file-input'), pngFile('huge.png', 11 * 1024 * 1024))
    expect(inlineError()).toHaveTextContent('The limit is 10 MB')
    expect(screen.queryByRole('button', { name: 'Remove attachment' })).not.toBeInTheDocument()
  })

  it('sends a document, shows the extraction card, copies and exports JSON', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'New Chat' }))
    await user.upload(screen.getByTestId('file-input'), pngFile('my_pan.png'))
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    const card = await screen.findByTestId('pan-extraction-card')
    expect(within(conversationLog()).getByText('Extract all details from this PAN card.')).toBeInTheDocument()
    expect(within(card).getByText(/fictional sample values/)).toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Copy All Details' }))
    const copied = await navigator.clipboard.readText()
    expect(copied).toContain('PAN Number: ABCPS1234F')
    expect(copied).toContain('Government Verification: Not checked')
    expect(copied).toContain('Synthetic demo values')

    let exported: Blob | undefined
    vi.stubGlobal('URL', Object.assign(URL, {
      createObjectURL: vi.fn((blob: Blob) => {
        exported = blob
        return 'blob:pan-export'
      }),
      revokeObjectURL: vi.fn(),
    }))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await user.click(within(card).getByRole('button', { name: 'Download JSON' }))
    expect(click).toHaveBeenCalledTimes(1)
    const json = JSON.parse(await exported!.text())
    expect(json).toMatchObject({
      document: 'my_pan.png',
      governmentVerification: 'not_checked',
      synthetic: true,
      fields: { panNumber: 'ABCPS1234F' },
    })
  })

  it('copies an assistant response', async () => {
    const user = renderApp()
    const [copyButton] = screen.getAllByRole('button', { name: 'Copy response' })
    await user.click(copyButton)
    expect(await navigator.clipboard.readText()).toContain('Here are the extracted details')
  })

  it('shows an error state and lets the user retry', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'New Chat' }))
    await user.type(composer(), 'PAN help #error{Enter}')
    expect(await screen.findByText("Couldn't get a response")).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText("Couldn't get a response")).toBeInTheDocument()
  })

  it('sends an example question from the tools panel', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'How do I link PAN with Aadhaar?' }))
    expect(await within(conversationLog()).findByText(/Link Aadhaar Status/)).toBeInTheDocument()
  })

  it('populates the composer for example questions that need input', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'Is this PAN format valid?' }))
    expect(composer()).toHaveValue('Is this PAN format valid? ')
    const welcome = screen.getByRole('region', { name: "Hello! I'm PAN AI" })
    await user.click(within(welcome).getByRole('button', { name: /^Validate PAN/ }))
    expect(composer()).toHaveValue('Validate PAN: ')
  })

  it('searches chats from the history view and deletes a chat', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'Chat History' }))
    expect(screen.getByRole('heading', { name: 'Chat History' })).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search chat history' }), 'quantum')
    expect(screen.getByText(/No chats match/)).toBeInTheDocument()
    await user.clear(screen.getByRole('textbox', { name: 'Search chat history' }))
    await user.type(screen.getByRole('textbox', { name: 'Search chat history' }), 'correction')
    const list = screen.getByRole('list', { name: 'Conversations' })
    expect(within(list).getByText('PAN correction process')).toBeInTheDocument()

    await user.click(within(list).getByRole('button', { name: 'Delete chat PAN correction process' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() =>
      expect(useChatStore.getState().conversations.some((c) => c.title === 'PAN correction process')).toBe(false),
    )
  })

  it('lists uploaded documents', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'Uploaded Documents' }))
    const docs = screen.getByRole('list', { name: 'Documents' })
    expect(within(docs).getByText('pan_card_1032.jpg')).toBeInTheDocument()
    await user.click(within(docs).getByRole('button', { name: 'Open chat' }))
    expect(screen.getByTestId('pan-extraction-card')).toBeInTheDocument()
  })

  it('compares entered details against the extraction', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'Compare PAN Details' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('PAN Number'), 'abcps1234f')
    await user.type(within(dialog).getByLabelText('Full Name'), 'Rahul Sharma')
    await user.type(within(dialog).getByLabelText('Date of Birth'), '01/01/1990')
    await user.click(within(dialog).getByRole('button', { name: 'Compare' }))
    const results = await within(dialog).findByTestId('compare-results')
    expect(within(results).getAllByText('Match')).toHaveLength(2)
    expect(within(results).getByText('Mismatch')).toBeInTheDocument()
  })

  it('collapses and expands the sidebar', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(screen.queryByText('Recent Chats')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false')
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(screen.getByText('Recent Chats')).toBeInTheDocument()
  })

  it('never writes chat or PAN data to localStorage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const user = renderApp()
    await user.type(composer(), 'Validate ABCPS1234F{Enter}')
    await screen.findAllByTestId('pan-validation-card')
    await act(async () => {})
    expect(setItem).not.toHaveBeenCalled()
  })
})
