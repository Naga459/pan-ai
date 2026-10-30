import { create } from 'zustand'
import { createDemoConversations } from '../features/chat/demoData'
import { requestMockReply } from '../features/chat/mockAssistant'
import { releaseAttachment } from '../features/documents/fileValidation'
import { createId } from '../lib/id'
import type { Attachment, ChatMessage, Conversation, MainView } from '../types/chat'

/**
 * All chat state lives in memory only. Nothing (in particular no PAN value or document)
 * is written to localStorage; a reload restores the synthetic demo conversations.
 */

export const NEW_CHAT_TITLE = 'New chat'
const DEFAULT_RESPONSE_DELAY_MS = 900

interface ChatState {
  conversations: Conversation[]
  activeId: string | null
  view: MainView
  draft: string
  pendingAttachment: Attachment | null
  /** Conversation currently waiting for a reply; blocks a second submit. */
  respondingId: string | null
  responseDelayMs: number

  composerFocusNonce: number
  filePicker: { nonce: number; imagesOnly: boolean }

  newChat: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  setView: (view: MainView) => void
  setDraft: (draft: string) => void
  setPendingAttachment: (attachment: Attachment) => void
  removePendingAttachment: () => void
  sendMessage: (text?: string) => Promise<void>
  retry: (assistantMessageId: string) => Promise<void>
  focusComposer: (draft?: string) => void
  openFilePicker: (options?: { imagesOnly?: boolean; draft?: string }) => void
  resetDemo: () => void
}

function titleFrom(text: string, attachment: Attachment | null): string {
  const source = text.trim() || (attachment ? `Document: ${attachment.name}` : NEW_CHAT_TITLE)
  const single = source.replace(/\s+/g, ' ')
  return single.length > 40 ? `${single.slice(0, 39)}…` : single
}

function createConversation(now: number): Conversation {
  return { id: createId('chat'), title: NEW_CHAT_TITLE, createdAt: now, updatedAt: now, messages: [] }
}

function initialState() {
  const conversations = createDemoConversations()
  return {
    conversations,
    activeId: conversations[0]?.id ?? null,
    view: 'chat' as MainView,
    draft: '',
    pendingAttachment: null,
    respondingId: null,
    responseDelayMs: DEFAULT_RESPONSE_DELAY_MS,
    composerFocusNonce: 0,
    filePicker: { nonce: 0, imagesOnly: false },
  }
}

export const useChatStore = create<ChatState>((set, get) => {
  const updateConversation = (id: string, fn: (c: Conversation) => Conversation) =>
    set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? fn(c) : c)) }))

  const updateMessage = (conversationId: string, messageId: string, patch: Partial<ChatMessage>) =>
    updateConversation(conversationId, (c) => ({
      ...c,
      updatedAt: Date.now(),
      messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
    }))

  /** Runs the mock engine for `userMessage` and fills `assistantId` with the result. */
  const respond = async (conversationId: string, userMessage: ChatMessage, assistantId: string) => {
    set({ respondingId: conversationId })
    try {
      const reply = await requestMockReply(
        { prompt: userMessage.content, attachments: userMessage.attachments },
        get().responseDelayMs,
      )
      updateMessage(conversationId, assistantId, {
        status: 'done',
        content: reply.content,
        extraction: reply.extraction,
        validation: reply.validation,
        error: undefined,
        createdAt: Date.now(),
      })
    } catch (error) {
      updateMessage(conversationId, assistantId, {
        status: 'error',
        content: '',
        error: error instanceof Error ? error.message : 'Something went wrong.',
        createdAt: Date.now(),
      })
    } finally {
      if (get().respondingId === conversationId) set({ respondingId: null })
    }
  }

  return {
    ...initialState(),

    newChat: () => {
      const { conversations, activeId } = get()
      const reusable = conversations.find((c) => c.messages.length === 0)
      if (reusable) {
        set({ activeId: reusable.id, view: 'chat' })
      } else {
        const conversation = createConversation(Date.now())
        set({ conversations: [conversation, ...conversations], activeId: conversation.id, view: 'chat' })
      }
      if (activeId !== get().activeId) set({ draft: '' })
      get().focusComposer()
    },

    selectConversation: (id) => {
      if (get().activeId !== id) set({ draft: '' })
      set({ activeId: id, view: 'chat' })
    },

    deleteConversation: (id) => {
      const { conversations, activeId } = get()
      const target = conversations.find((c) => c.id === id)
      target?.messages.forEach((m) => m.attachments?.forEach(releaseAttachment))
      const remaining = conversations.filter((c) => c.id !== id)
      const nextActive =
        activeId === id
          ? ([...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null)
          : activeId
      set({ conversations: remaining, activeId: nextActive })
    },

    setView: (view) => set({ view }),
    setDraft: (draft) => set({ draft }),

    setPendingAttachment: (attachment) => {
      releaseAttachment(get().pendingAttachment)
      set({ pendingAttachment: attachment })
    },

    removePendingAttachment: () => {
      releaseAttachment(get().pendingAttachment)
      set({ pendingAttachment: null })
    },

    sendMessage: async (text) => {
      const state = get()
      if (state.respondingId) return
      const content = (text ?? state.draft).trim()
      const attachment = state.pendingAttachment
      if (!content && !attachment) return

      const now = Date.now()
      let conversationId = state.activeId
      if (!conversationId || !state.conversations.some((c) => c.id === conversationId)) {
        const conversation = createConversation(now)
        conversationId = conversation.id
        set({ conversations: [conversation, ...get().conversations], activeId: conversationId })
      }

      const userMessage: ChatMessage = {
        id: createId('msg'),
        role: 'user',
        content: content || 'Extract all details from this PAN card.',
        createdAt: now,
        status: 'done',
        attachments: attachment ? [attachment] : undefined,
      }
      const assistantId = createId('msg')
      const placeholder: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: now,
        status: 'pending',
        demo: true,
      }

      updateConversation(conversationId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? titleFrom(content, attachment) : c.title,
        updatedAt: now,
        messages: [...c.messages, userMessage, placeholder],
      }))
      // The attachment now belongs to the message; don't revoke its preview URL.
      set({ draft: text === undefined ? '' : get().draft, pendingAttachment: null, view: 'chat' })

      await respond(conversationId, userMessage, assistantId)
    },

    retry: async (assistantMessageId) => {
      if (get().respondingId) return
      const conversation = get().conversations.find((c) =>
        c.messages.some((m) => m.id === assistantMessageId),
      )
      if (!conversation) return
      const index = conversation.messages.findIndex((m) => m.id === assistantMessageId)
      const userMessage = conversation.messages
        .slice(0, index)
        .reverse()
        .find((m) => m.role === 'user')
      if (!userMessage) return

      updateMessage(conversation.id, assistantMessageId, {
        status: 'pending',
        content: '',
        error: undefined,
        extraction: undefined,
        validation: undefined,
      })
      await respond(conversation.id, userMessage, assistantMessageId)
    },

    focusComposer: (draft) =>
      set((s) => ({
        view: 'chat',
        draft: draft ?? s.draft,
        composerFocusNonce: s.composerFocusNonce + 1,
      })),

    openFilePicker: ({ imagesOnly = false, draft } = {}) =>
      set((s) => ({
        view: 'chat',
        draft: draft ?? s.draft,
        filePicker: { nonce: s.filePicker.nonce + 1, imagesOnly },
      })),

    resetDemo: () => {
      const { conversations, pendingAttachment } = get()
      conversations.forEach((c) => c.messages.forEach((m) => m.attachments?.forEach(releaseAttachment)))
      releaseAttachment(pendingAttachment)
      set(initialState())
    },
  }
})

export function selectActiveConversation(state: ChatState): Conversation | null {
  return state.conversations.find((c) => c.id === state.activeId) ?? null
}

export function sortByRecent(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
}

export interface SearchHit {
  conversation: Conversation
  snippet: string
}

export function searchConversations(conversations: Conversation[], query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits: SearchHit[] = []
  for (const conversation of sortByRecent(conversations)) {
    if (conversation.title.toLowerCase().includes(q)) {
      hits.push({ conversation, snippet: conversation.messages[0]?.content ?? '' })
      continue
    }
    const message = conversation.messages.find((m) => m.content.toLowerCase().includes(q))
    if (message) hits.push({ conversation, snippet: message.content })
  }
  return hits
}

export interface DocumentEntry {
  attachment: Attachment
  conversationId: string
  conversationTitle: string
}

export function listDocuments(conversations: Conversation[]): DocumentEntry[] {
  return sortByRecent(conversations)
    .flatMap((c) =>
      c.messages.flatMap((m) =>
        (m.attachments ?? []).map((attachment) => ({
          attachment,
          conversationId: c.id,
          conversationTitle: c.title,
        })),
      ),
    )
    .sort((a, b) => b.attachment.addedAt - a.attachment.addedAt)
}
