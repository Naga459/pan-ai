import { Button } from 'antd'
import {
  ChevronRight,
  CloudUpload,
  FileSearch,
  FileText,
  GitCompareArrows,
  Lightbulb,
  MessagesSquare,
  Paperclip,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { EXAMPLE_QUESTIONS, NEEDS_DOCUMENT, NEEDS_PAN } from '../features/chat/exampleQuestions'
import { selectActiveConversation, useChatStore } from '../store/chatStore'
import { useUiStore } from '../store/uiStore'
import { DocumentPreview } from './DocumentPreview'

function PanelSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  const id = `panel-${title.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby={id}>
      <h2 id={id} className="m-0 mb-3 flex items-center gap-2 text-base font-semibold text-navy-900">
        <Icon size={20} className="text-brand-600" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}

const toolButtonClass =
  'flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-slate-50 px-3.5 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400'

export function ChatToolsPanel({ onAction }: { onAction?: () => void }) {
  const pendingAttachment = useChatStore((s) => s.pendingAttachment)
  const removePendingAttachment = useChatStore((s) => s.removePendingAttachment)
  const activeConversation = useChatStore(selectActiveConversation)
  const openFilePicker = useChatStore((s) => s.openFilePicker)
  const focusComposer = useChatStore((s) => s.focusComposer)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const responding = useChatStore((s) => s.respondingId !== null)
  const setCompareOpen = useUiStore((s) => s.setCompareOpen)

  const latestDocument = activeConversation?.messages
    .flatMap((m) => m.attachments ?? [])
    .at(-1)

  const run = (fn: () => void) => () => {
    fn()
    onAction?.()
  }

  const tools: { icon: LucideIcon; label: string; color: string; action: () => void }[] = [
    {
      icon: CloudUpload,
      label: 'Upload PAN Card',
      color: 'text-blue-600',
      action: () => openFilePicker({ draft: 'Extract all details from this PAN card.' }),
    },
    {
      icon: FileSearch,
      label: 'Extract PAN Number',
      color: 'text-teal-600',
      action: () => openFilePicker({ draft: 'Extract the PAN number from this document.' }),
    },
    {
      icon: ShieldCheck,
      label: 'Validate PAN Format',
      color: 'text-violet-600',
      action: () => focusComposer('Validate PAN: '),
    },
    {
      icon: GitCompareArrows,
      label: 'Compare PAN Details',
      color: 'text-indigo-600',
      action: () => setCompareOpen(true),
    },
    {
      icon: MessagesSquare,
      label: 'Ask PAN Question',
      color: 'text-orange-500',
      action: () => focusComposer(''),
    },
  ]

  const askExample = (question: string) => {
    if (NEEDS_DOCUMENT.has(question) && !pendingAttachment) {
      openFilePicker({ draft: question })
    } else if (NEEDS_PAN.has(question) || responding) {
      focusComposer(NEEDS_PAN.has(question) ? 'Is this PAN format valid? ' : question)
    } else {
      void sendMessage(question)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PanelSection icon={Paperclip} title="Attached Document">
        {pendingAttachment ? (
          <DocumentPreview
            attachment={pendingAttachment}
            onRemove={removePendingAttachment}
            removeLabel="Remove attached document"
          />
        ) : latestDocument ? (
          <div>
            <DocumentPreview attachment={latestDocument} />
            <p className="m-0 mt-1.5 text-xs text-slate-500">Latest document in this chat</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-center">
            <FileText size={24} className="text-slate-400" aria-hidden="true" />
            <p className="m-0 text-sm text-slate-500">No document attached</p>
            <Button size="small" onClick={run(() => openFilePicker({ draft: 'Extract all details from this PAN card.' }))}>
              Upload PAN card
            </Button>
          </div>
        )}
      </PanelSection>

      <PanelSection icon={Wrench} title="Chat Tools">
        <div className="flex flex-col gap-2">
          {tools.map(({ icon: Icon, label, color, action }) => (
            <button key={label} type="button" className={toolButtonClass} onClick={run(action)}>
              <Icon size={20} className={color} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection icon={Lightbulb} title="Example Questions">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {EXAMPLE_QUESTIONS.map((question) => (
            <li key={question}>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                onClick={run(() => askExample(question))}
              >
                {question}
                <ChevronRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </PanelSection>
    </div>
  )
}
