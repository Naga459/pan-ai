import type { PanValidationResult } from '../features/pan-validation/panValidator'

export type Role = 'user' | 'assistant'
export type MessageStatus = 'pending' | 'done' | 'error'
export type AttachmentKind = 'image' | 'pdf'

export interface Attachment {
  id: string
  name: string
  size: number
  mimeType: string
  kind: AttachmentKind
  /** Object URL for the in-memory file. Absent for synthetic demo attachments. */
  previewUrl?: string
  /** True for the built-in fictional sample documents. */
  synthetic?: boolean
  addedAt: number
}

export interface PanFields {
  panNumber: string
  fullName: string
  parentName: string
  dateOfBirth: string
  cardType: string
  holderCategory: string
}

export interface PanExtraction {
  documentName: string
  fields: PanFields
  /** Per-field OCR confidence, 0–100. */
  confidence: { panNumber: number; fullName: number; parentName: number; dateOfBirth: number }
  validation: PanValidationResult
  /** Always true until real OCR lands in PAN-004. */
  synthetic: true
}

export interface ChatMessage {
  id: string
  role: Role
  /** Markdown for assistant messages, plain text for user messages. */
  content: string
  createdAt: number
  status: MessageStatus
  attachments?: Attachment[]
  extraction?: PanExtraction
  validation?: PanValidationResult
  /** Assistant messages produced by the in-browser mock engine. */
  demo?: boolean
  error?: string
}

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
  synthetic?: boolean
}

export type MainView = 'chat' | 'history' | 'documents'
