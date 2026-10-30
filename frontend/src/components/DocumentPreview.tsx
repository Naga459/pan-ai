import { Button, Tag, Tooltip } from 'antd'
import { FileText, X } from 'lucide-react'
import { SYNTHETIC_PAN_FIELDS } from '../features/chat/mockAssistant'
import { fileTypeLabel, formatBytes } from '../features/documents/fileValidation'
import type { Attachment } from '../types/chat'
import { SyntheticPanCard } from './SyntheticPanCard'

interface DocumentThumbnailProps {
  attachment: Attachment
  className?: string
}

export function DocumentThumbnail({ attachment, className = 'h-14 w-20' }: DocumentThumbnailProps) {
  return (
    <div className={`shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 ${className}`}>
      {attachment.previewUrl ? (
        <img src={attachment.previewUrl} alt={`Preview of ${attachment.name}`} className="h-full w-full object-cover" />
      ) : attachment.synthetic ? (
        <SyntheticPanCard fields={SYNTHETIC_PAN_FIELDS} compact />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-red-500">
          <FileText size={22} aria-hidden="true" />
          <span className="text-[10px] font-semibold">{fileTypeLabel(attachment)}</span>
        </div>
      )}
    </div>
  )
}

interface DocumentPreviewProps {
  attachment: Attachment
  onRemove?: () => void
  removeLabel?: string
  className?: string
}

export function DocumentPreview({ attachment, onRemove, removeLabel, className = '' }: DocumentPreviewProps) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 ${className}`}
      data-testid="document-preview"
    >
      <DocumentThumbnail attachment={attachment} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-800" title={attachment.name}>
          {attachment.name}
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
          <span>{formatBytes(attachment.size)}</span>
          <span aria-hidden="true">•</span>
          <span>{fileTypeLabel(attachment)}</span>
          {attachment.synthetic && (
            <Tag color="gold" className="!m-0 !ml-1 !text-[10px] !leading-4">
              Sample
            </Tag>
          )}
        </div>
      </div>
      {onRemove && (
        <Tooltip title={removeLabel ?? 'Remove attachment'}>
          <Button
            type="text"
            size="small"
            shape="circle"
            icon={<X size={16} />}
            onClick={onRemove}
            aria-label={removeLabel ?? `Remove ${attachment.name}`}
          />
        </Tooltip>
      )}
    </div>
  )
}
