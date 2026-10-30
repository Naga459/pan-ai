import { MessageCirclePlus } from 'lucide-react'
import { useRef } from 'react'
import { ChatComposer } from '../../components/ChatComposer'
import { ChatMessage } from '../../components/ChatMessage'
import { WelcomeSection } from '../../components/WelcomeSection'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { selectActiveConversation, useChatStore } from '../../store/chatStore'
import type { Attachment, ChatMessage as ChatMessageModel } from '../../types/chat'

function sourceDocumentFor(messages: ChatMessageModel[], index: number): Attachment | undefined {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') return messages[i].attachments?.[0]
  }
  return undefined
}

function EmptyConversation() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center">
      <MessageCirclePlus size={32} className="text-brand-500" aria-hidden="true" />
      <p className="m-0 font-semibold text-slate-800">Start a new PAN conversation</p>
      <p className="m-0 max-w-md text-sm text-slate-500">
        Ask a PAN question, paste a PAN to check its format, or attach a PAN card image or PDF to see a demo
        extraction.
      </p>
    </div>
  )
}

export function ChatView() {
  const conversation = useChatStore(selectActiveConversation)
  const messages = conversation?.messages ?? []
  const last = messages.at(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const onScroll = useAutoScroll(
    scrollRef,
    conversation?.id ?? null,
    messages.length,
    last ? `${last.id}:${last.status}` : '',
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        data-testid="message-scroll"
      >
        <div className="@container mx-auto max-w-5xl px-3 py-5 md:px-6 md:py-6">
          <WelcomeSection />
          <div className="mt-6 flex flex-col gap-5" role="log" aria-label="Conversation">
            {messages.length === 0 ? (
              <EmptyConversation />
            ) : (
              messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  sourceDocument={message.role === 'assistant' ? sourceDocumentFor(messages, index) : undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <ChatComposer />
    </div>
  )
}
