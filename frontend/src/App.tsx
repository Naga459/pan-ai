import { Tag } from 'antd'
import { Bot, FileText, History, MessageSquare, ShieldCheck, SquarePlus } from 'lucide-react'
import { useEffect } from 'react'
import { PanLogo } from './components/PanLogo'
import { useAppStore, type ApiStatus } from './store/appStore'

const NAV_ITEMS = [
  { label: 'Chat', icon: MessageSquare, active: true },
  { label: 'New Chat', icon: SquarePlus },
  { label: 'Chat History', icon: History },
  { label: 'Uploaded Documents', icon: FileText },
]

const STATUS_TAG: Record<ApiStatus, { color: string; label: string }> = {
  checking: { color: 'processing', label: 'Connecting…' },
  online: { color: 'success', label: 'Online' },
  offline: { color: 'error', label: 'API offline' },
}

export default function App() {
  const apiStatus = useAppStore((s) => s.apiStatus)
  const health = useAppStore((s) => s.health)
  const checkHealth = useAppStore((s) => s.checkHealth)

  useEffect(() => {
    void checkHealth()
  }, [checkHealth])

  const status = STATUS_TAG[apiStatus]

  return (
    <div className="flex h-dvh">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-900 text-white md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <PanLogo size={40} />
          <div>
            <div className="text-xl font-bold leading-tight">PAN AI</div>
            <div className="text-xs text-white/70">Your PAN Assistant</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2" aria-label="Main">
          {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                active ? 'bg-brand-600 text-white' : 'text-white/85 hover:bg-white/5'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto m-3 rounded-xl border border-white/10 bg-navy-800 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <ShieldCheck size={20} className="text-brand-500" /> PAN AI
          </div>
          <p className="text-white/80">Focused only on PAN-related information, extraction and assistance.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <PanLogo size={32} className="md:hidden" />
          <h1 className="m-0 text-xl font-bold text-navy-900">PAN AI</h1>
          <Tag color={status.color} data-testid="api-status">
            {status.label}
          </Tag>
        </header>

        <main className="flex flex-1 items-start justify-center overflow-auto p-4 md:p-6">
          <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            <div className="flex items-start gap-4 md:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Bot size={30} />
              </div>
              <div className="min-w-0">
                <h2 className="m-0 text-2xl font-bold text-navy-900">Hello! I&apos;m PAN AI</h2>
                <p className="m-0 text-slate-600">
                  Ask anything about Indian PAN (Permanent Account Number) or upload a PAN card to extract details.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Project foundation (PAN-001). The chat experience arrives in PAN-002.
              {health && (
                <span data-testid="api-version">
                  {' '}
                  Connected to {health.service} v{health.version} ({health.environment}).
                </span>
              )}
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
