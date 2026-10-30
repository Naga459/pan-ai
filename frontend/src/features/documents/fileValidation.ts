import type { Attachment, AttachmentKind } from '../../types/chat'
import { createId } from '../../lib/id'

export const MAX_UPLOAD_MB = 10
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

const ACCEPTED: Record<string, AttachmentKind> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'application/pdf': 'pdf',
}
const EXTENSION_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
}

export const ACCEPT_ALL = '.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf'
export const ACCEPT_IMAGES = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'

export type FileValidation =
  | { ok: true; kind: AttachmentKind; mimeType: string }
  | { ok: false; error: string }

export function validateUpload(file: File, options: { imagesOnly?: boolean } = {}): FileValidation {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  // Some browsers report an empty type; fall back to the extension.
  const mimeType = file.type || EXTENSION_TYPES[extension] || ''
  const kind = ACCEPTED[mimeType]

  if (!kind || EXTENSION_TYPES[extension] === undefined) {
    return { ok: false, error: `"${file.name}" is not supported. Upload a JPG, PNG, WEBP or PDF file.` }
  }
  if (options.imagesOnly && kind !== 'image') {
    return { ok: false, error: 'Please choose an image (JPG, PNG or WEBP).' }
  }
  if (file.size === 0) {
    return { ok: false, error: `"${file.name}" is empty.` }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" is ${formatBytes(file.size)}. The limit is ${MAX_UPLOAD_MB} MB.`,
    }
  }
  return { ok: true, kind, mimeType }
}

export function createAttachment(file: File, kind: AttachmentKind, mimeType: string): Attachment {
  return {
    id: createId('doc'),
    name: file.name,
    size: file.size,
    mimeType,
    kind,
    previewUrl: kind === 'image' && typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(file)
      : undefined,
    addedAt: Date.now(),
  }
}

export function releaseAttachment(attachment: Attachment | null | undefined): void {
  if (attachment?.previewUrl && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(attachment.previewUrl)
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fileTypeLabel(attachment: Pick<Attachment, 'name' | 'kind'>): string {
  const ext = attachment.name.split('.').pop()?.toUpperCase()
  return ext || (attachment.kind === 'pdf' ? 'PDF' : 'IMAGE')
}
