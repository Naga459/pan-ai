import { BookOpen, Bot, FileScan, ScanSearch, ShieldCheck } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { QuickActionCard } from './QuickActionCard'

export function WelcomeSection() {
  const openFilePicker = useChatStore((s) => s.openFilePicker)
  const focusComposer = useChatStore((s) => s.focusComposer)

  return (
    <section aria-labelledby="welcome-title">
      <div className="flex items-start gap-4 md:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-md md:h-16 md:w-16">
          <Bot size={32} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 id="welcome-title" className="m-0 text-2xl font-bold text-navy-900 md:text-3xl">
            Hello! I&apos;m PAN AI
          </h2>
          <p className="m-0 mt-1 text-sm text-slate-600 md:text-base">
            Ask anything about Indian PAN (Permanent Account Number) or upload a PAN card to extract details.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 @3xl:grid-cols-4 @3xl:gap-3">
        <QuickActionCard
          icon={FileScan}
          tone="blue"
          title="Extract from PAN"
          description="Upload a PAN card and extract all details instantly."
          onClick={() => openFilePicker({ draft: 'Extract all details from this PAN card.' })}
        />
        <QuickActionCard
          icon={ScanSearch}
          tone="teal"
          title="Extract PAN Number"
          description="Get PAN number from image, PDF or text."
          onClick={() => openFilePicker({ draft: 'Extract the PAN number from this document.' })}
        />
        <QuickActionCard
          icon={ShieldCheck}
          tone="purple"
          title="Validate PAN"
          description="Check PAN format and holder category."
          onClick={() => focusComposer('Validate PAN: ')}
        />
        <QuickActionCard
          icon={BookOpen}
          tone="orange"
          title="Ask PAN Question"
          description="Get answers to any PAN related query."
          onClick={() => focusComposer('')}
        />
      </div>
    </section>
  )
}
