import { App, Button, Input, Tooltip } from 'antd'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import { Image as ImageIcon, Loader2, Paperclip, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import {
  ACCEPT_ALL,
  ACCEPT_IMAGES,
  MAX_UPLOAD_MB,
  createAttachment,
  validateUpload,
} from '../features/documents/fileValidation'
import { useChatStore } from '../store/chatStore'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { DocumentPreview } from './DocumentPreview'

// Requests are counted by nonce; remembering the last handled one at module level means a
// remount (e.g. returning from Chat History) doesn't replay an old request, while a request
// that itself switched the view back to chat is still honoured.
let handledFocusNonce = 0
let handledPickerNonce = 0

export function ChatComposer() {
  const { message } = App.useApp()
  const draft = useChatStore((s) => s.draft)
  const setDraft = useChatStore((s) => s.setDraft)
  const pendingAttachment = useChatStore((s) => s.pendingAttachment)
  const setPendingAttachment = useChatStore((s) => s.setPendingAttachment)
  const removePendingAttachment = useChatStore((s) => s.removePendingAttachment)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const responding = useChatStore((s) => s.respondingId !== null)
  const focusNonce = useChatStore((s) => s.composerFocusNonce)
  const filePicker = useChatStore((s) => s.filePicker)

  const wide = useMediaQuery('(min-width: 1440px)')
  const textareaRef = useRef<TextAreaRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesOnlyRef = useRef(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (focusNonce === 0 || focusNonce === handledFocusNonce) return
    handledFocusNonce = focusNonce
    const el = textareaRef.current?.resizableTextArea?.textArea
    el?.focus()
    el?.setSelectionRange(el.value.length, el.value.length)
  }, [focusNonce])

  const pickFile = (onlyImages: boolean) => {
    imagesOnlyRef.current = onlyImages
    const input = fileInputRef.current
    if (!input) return
    input.accept = onlyImages ? ACCEPT_IMAGES : ACCEPT_ALL
    input.click()
  }

  // Quick actions and tools elsewhere ask the composer to open the picker.
  useEffect(() => {
    if (filePicker.nonce === 0 || filePicker.nonce === handledPickerNonce) return
    handledPickerNonce = filePicker.nonce
    pickFile(filePicker.imagesOnly)
  }, [filePicker])

  const acceptFiles = (files: FileList | File[] | null) => {
    const list = Array.from(files ?? [])
    if (list.length === 0) return
    if (list.length > 1) message.info('One document per message — using the first file.')
    const file = list[0]
    const result = validateUpload(file, { imagesOnly: imagesOnlyRef.current })
    if (!result.ok) {
      setFileError(result.error)
      message.error(result.error)
      return
    }
    setFileError(null)
    setPendingAttachment(createAttachment(file, result.kind, result.mimeType))
    textareaRef.current?.focus()
  }

  const canSend = !responding && (draft.trim().length > 0 || pendingAttachment !== null)

  const submit = () => {
    if (!canSend) return
    setFileError(null)
    void sendMessage()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    imagesOnlyRef.current = false
    acceptFiles(event.dataTransfer.files)
  }

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-3 pb-3 pt-2 md:px-5 md:pb-4">
      <div className="mx-auto max-w-4xl">
        {pendingAttachment && (
          <div className="mb-2 max-w-sm">
            <DocumentPreview
              attachment={pendingAttachment}
              onRemove={removePendingAttachment}
              removeLabel="Remove attachment"
            />
          </div>
        )}
        {fileError && (
          <p role="alert" className="m-0 mb-2 text-sm text-red-600">
            {fileError}
          </p>
        )}

        <div
          className={`flex items-end gap-1.5 rounded-2xl border bg-white p-1.5 pl-2 shadow-sm transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-blue-100 ${
            dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Tooltip title={`Attach PAN card (image or PDF, max ${MAX_UPLOAD_MB} MB)`}>
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<Paperclip size={20} />}
              aria-label="Attach image or PDF"
              disabled={responding}
              onClick={() => pickFile(false)}
            />
          </Tooltip>
          <Input.TextArea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              wide
                ? 'Ask anything about PAN… (e.g. extract details, validate PAN, correction process, etc.)'
                : 'Ask anything about PAN…'
            }
            aria-label="Message PAN AI"
            autoSize={{ minRows: 1, maxRows: 6 }}
            variant="borderless"
            className="!px-1 !py-2 !text-[15px]"
            maxLength={4000}
          />
          <Tooltip title="Attach image">
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<ImageIcon size={20} />}
              aria-label="Attach image"
              disabled={responding}
              onClick={() => pickFile(true)}
            />
          </Tooltip>
          <Button
            type="primary"
            shape="circle"
            size="large"
            className="!h-11 !w-11 !min-w-11"
            icon={responding ? <Loader2 size={20} className="animate-spin" /> : <SendHorizontal size={20} />}
            aria-label={responding ? 'Waiting for response' : 'Send message'}
            disabled={!canSend}
            onClick={submit}
          />
        </div>
        <p className="m-0 mt-1.5 hidden text-center text-xs text-slate-400 sm:block">
          Enter to send · Shift+Enter for a new line · Demo mode: responses are simulated and use synthetic data
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPT_ALL}
        data-testid="file-input"
        onChange={(e) => {
          acceptFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
