import { Alert, Button, Tag, Tooltip } from 'antd'
import { CheckCheck, Copy, RotateCcw } from 'lucide-react'
import { extractionToText } from '../features/documents/extractionExport'
import { useCopy } from '../hooks/useCopy'
import { formatTime } from '../lib/format'
import { useChatStore } from '../store/chatStore'
import type { Attachment, ChatMessage as ChatMessageModel } from '../types/chat'
import { DocumentPreview } from './DocumentPreview'
import { Markdown } from './Markdown'
import { PANExtractionCard } from './PANExtractionCard'
import { PanLogo } from './PanLogo'
import { PanValidationCard } from './PanValidationCard'
import { UserAvatar } from './UserAvatar'

function AssistantAvatar() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600" aria-hidden="true">
      <PanLogo size={22} variant="light" />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1 text-sm text-slate-500" role="status" aria-live="polite">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-brand-500"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      PAN AI is preparing a demo response…
    </div>
  )
}

function copyableText(message: ChatMessageModel): string {
  const parts = [message.content]
  if (message.extraction) parts.push(extractionToText(message.extraction))
  return parts.filter(Boolean).join('\n\n')
}

interface ChatMessageProps {
  message: ChatMessageModel
  /** Document the assistant reply refers to (from the preceding user message). */
  sourceDocument?: Attachment
}

export function ChatMessage({ message, sourceDocument }: ChatMessageProps) {
  const copy = useCopy()
  const retry = useChatStore((s) => s.retry)
  const responding = useChatStore((s) => s.respondingId !== null)

  if (message.role === 'user') {
    return (
      <article className="flex justify-end gap-3" aria-label="Your message">
        <div className="flex min-w-0 max-w-[85%] flex-col items-end gap-1.5 md:max-w-[70%]">
          <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-brand-50 px-4 py-2.5 text-sm text-navy-900 ring-1 ring-blue-100">
            {message.content}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <time dateTime={new Date(message.createdAt).toISOString()}>{formatTime(message.createdAt)}</time>
            <CheckCheck size={14} className="text-brand-500" aria-label="Sent" />
          </div>
          {message.attachments?.map((attachment) => (
            <DocumentPreview key={attachment.id} attachment={attachment} className="w-full max-w-xs" />
          ))}
        </div>
        <UserAvatar />
      </article>
    )
  }

  return (
    <article className="flex gap-3" aria-label="PAN AI message" aria-busy={message.status === 'pending'}>
      <AssistantAvatar />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50/60 px-3 py-2.5 md:px-4">
        {message.status === 'pending' && <TypingIndicator />}

        {message.status === 'error' && (
          <Alert
            type="error"
            showIcon
            title="Couldn't get a response"
            description={message.error}
            action={
              <Button size="small" danger onClick={() => void retry(message.id)} disabled={responding}>
                Retry
              </Button>
            }
          />
        )}

        {message.status === 'done' && (
          <>
            <Markdown>{message.content}</Markdown>
            {message.extraction && (
              <PANExtractionCard extraction={message.extraction} document={sourceDocument} />
            )}
            {message.validation && <PanValidationCard result={message.validation} />}

            <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-400">
              <time dateTime={new Date(message.createdAt).toISOString()}>{formatTime(message.createdAt)}</time>
              {message.demo && (
                <Tooltip title="Simulated in your browser. Real AI responses arrive in PAN-005.">
                  <Tag className="!ml-2 !text-[11px]" color="default">
                    Demo response
                  </Tag>
                </Tooltip>
              )}
              <span className="ml-auto flex gap-0.5">
                <Tooltip title="Copy response">
                  <Button
                    type="text"
                    size="small"
                    icon={<Copy size={14} />}
                    aria-label="Copy response"
                    onClick={() => void copy(copyableText(message), 'Response copied')}
                  />
                </Tooltip>
                <Tooltip title="Regenerate response">
                  <Button
                    type="text"
                    size="small"
                    icon={<RotateCcw size={14} />}
                    aria-label="Retry response"
                    disabled={responding}
                    onClick={() => void retry(message.id)}
                  />
                </Tooltip>
              </span>
            </div>
          </>
        )}
      </div>
    </article>
  )
}
