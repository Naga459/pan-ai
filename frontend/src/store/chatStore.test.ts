import { beforeEach, describe, expect, it } from 'vitest'
import { listDocuments, searchConversations, selectActiveConversation, useChatStore } from './chatStore'

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.getState().resetDemo()
    useChatStore.setState({ responseDelayMs: 0 })
  })

  it('starts with synthetic demo conversations and the mockup chat open', () => {
    const state = useChatStore.getState()
    expect(state.conversations).toHaveLength(5)
    expect(state.conversations.every((c) => c.synthetic)).toBe(true)
    expect(selectActiveConversation(state)?.title).toBe('Extract PAN details')
  })

  it('reuses an empty conversation instead of creating duplicates', () => {
    const { newChat } = useChatStore.getState()
    newChat()
    newChat()
    const state = useChatStore.getState()
    expect(state.conversations).toHaveLength(6)
    expect(selectActiveConversation(state)?.messages).toEqual([])
  })

  it('sends a message, titles the chat and stores a demo reply', async () => {
    useChatStore.getState().newChat()
    useChatStore.getState().setDraft('Validate ABCPS1234F')
    await useChatStore.getState().sendMessage()
    const chat = selectActiveConversation(useChatStore.getState())!
    expect(chat.title).toBe('Validate ABCPS1234F')
    expect(chat.messages.map((m) => m.role)).toEqual(['user', 'assistant'])
    expect(chat.messages[1]).toMatchObject({ status: 'done', demo: true })
    expect(chat.messages[1].validation?.formatValid).toBe(true)
    expect(useChatStore.getState().draft).toBe('')
    expect(useChatStore.getState().respondingId).toBeNull()
  })

  it('ignores empty messages', async () => {
    useChatStore.getState().newChat()
    await useChatStore.getState().sendMessage('   ')
    expect(selectActiveConversation(useChatStore.getState())?.messages).toHaveLength(0)
  })

  it('marks failures and recovers on retry', async () => {
    useChatStore.getState().newChat()
    await useChatStore.getState().sendMessage('PAN question #error')
    let chat = selectActiveConversation(useChatStore.getState())!
    expect(chat.messages[1].status).toBe('error')

    // Edit the prompt so the retry succeeds.
    useChatStore.setState((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === chat.id
          ? { ...c, messages: c.messages.map((m, i) => (i === 0 ? { ...m, content: 'What is PAN?' } : m)) }
          : c,
      ),
    }))
    await useChatStore.getState().retry(chat.messages[1].id)
    chat = selectActiveConversation(useChatStore.getState())!
    expect(chat.messages[1].status).toBe('done')
    expect(chat.messages[1].content).toMatch(/Permanent Account Number/)
  })

  it('deletes a conversation and moves to the most recent remaining one', () => {
    const { activeId, deleteConversation } = useChatStore.getState()
    deleteConversation(activeId!)
    const state = useChatStore.getState()
    expect(state.conversations).toHaveLength(4)
    expect(selectActiveConversation(state)?.title).toBe('Validate PAN number')
  })

  it('searches titles and message content', () => {
    const { conversations } = useChatStore.getState()
    expect(searchConversations(conversations, 'aadhaar').map((h) => h.conversation.title)).toContain(
      'Documents required',
    )
    expect(searchConversations(conversations, 'correction')[0].conversation.title).toBe('PAN correction process')
    expect(searchConversations(conversations, 'zzz-no-match')).toEqual([])
  })

  it('lists documents attached across conversations', () => {
    const docs = listDocuments(useChatStore.getState().conversations)
    expect(docs).toHaveLength(1)
    expect(docs[0].attachment).toMatchObject({ name: 'pan_card_1032.jpg', synthetic: true })
  })
})
