import { createId } from '../../lib/id'
import type { Attachment, ChatMessage, Conversation } from '../../types/chat'
import { generateMockReply } from './mockAssistant'

/** Synthetic sample document shown in the demo conversation. No real file or PAN data. */
export function createSyntheticAttachment(at: number): Attachment {
  return {
    id: createId('doc'),
    name: 'pan_card_1032.jpg',
    size: Math.round(1.2 * 1024 * 1024),
    mimeType: 'image/jpeg',
    kind: 'image',
    synthetic: true,
    addedAt: at,
  }
}

function at(daysAgo: number, hours: number, minutes: number, now: number): number {
  const d = new Date(now)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

function fixedDate(iso: string): number {
  return new Date(iso).getTime()
}

function exchange(prompt: string, when: number, attachments?: Attachment[]): ChatMessage[] {
  const reply = generateMockReply({ prompt, attachments })
  return [
    { id: createId('msg'), role: 'user', content: prompt, createdAt: when, status: 'done', attachments },
    {
      id: createId('msg'),
      role: 'assistant',
      content: reply.content,
      extraction: reply.extraction,
      validation: reply.validation,
      createdAt: when + 4_000,
      status: 'done',
      demo: true,
    },
  ]
}

function conversation(title: string, messages: ChatMessage[]): Conversation {
  return {
    id: createId('chat'),
    title,
    createdAt: messages[0].createdAt,
    updatedAt: messages[messages.length - 1].createdAt,
    messages,
    synthetic: true,
  }
}

/** Demo conversations matching the mockup's "Recent Chats". All data is fictional. */
export function createDemoConversations(now = Date.now()): Conversation[] {
  const today = Math.min(at(0, 10, 24, now), now - 60_000)
  return [
    conversation(
      'Extract PAN details',
      exchange('Extract all details from this PAN card.', today, [createSyntheticAttachment(today)]),
    ),
    conversation('Validate PAN number', exchange('Is this PAN number valid? ABCPS1234F', at(1, 15, 18, now))),
    conversation(
      'PAN correction process',
      exchange('How do I correct the details on my PAN card?', fixedDate('2025-04-24T11:05:00')),
    ),
    conversation(
      'Documents required',
      exchange('What documents are required for PAN correction?', fixedDate('2025-04-22T16:40:00')),
    ),
    conversation('What is PAN?', exchange('What is PAN?', fixedDate('2025-04-18T09:12:00'))),
  ]
}
