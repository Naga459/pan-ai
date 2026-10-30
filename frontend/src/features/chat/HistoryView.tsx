import { Button, Empty, Input, Popconfirm, Tag, Tooltip } from 'antd'
import { MessageSquareText, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatRelativeDate } from '../../lib/format'
import { searchConversations, sortByRecent, useChatStore } from '../../store/chatStore'

function plain(text: string): string {
  return text.replace(/[*_`#>|]/g, '').replace(/\s+/g, ' ').trim()
}

export function HistoryView() {
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const newChat = useChatStore((s) => s.newChat)
  const [query, setQuery] = useState('')

  const nonEmpty = conversations.filter((c) => c.messages.length > 0)
  const rows = query.trim()
    ? searchConversations(nonEmpty, query)
    : sortByRecent(nonEmpty).map((conversation) => ({
        conversation,
        snippet: conversation.messages.at(-1)?.content ?? '',
      }))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-4 md:px-6">
        <h2 className="m-0 mr-auto text-xl font-bold text-navy-900">Chat History</h2>
        <Input
          allowClear
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix={<Search size={16} className="text-slate-400" aria-hidden="true" />}
          placeholder="Search chats…"
          aria-label="Search chat history"
          className="!w-full sm:!w-72"
        />
        <Button type="primary" icon={<Plus size={16} />} onClick={newChat}>
          New Chat
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 md:px-4">
        {rows.length === 0 ? (
          <Empty
            className="mt-10"
            description={query ? `No chats match “${query}”` : 'No conversations yet. Start a new chat.'}
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label="Conversations">
            {rows.map(({ conversation: c, snippet }) => (
              <li key={c.id} className="group flex items-center gap-2 rounded-xl hover:bg-slate-50">
                <button
                  type="button"
                  onClick={() => selectConversation(c.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <MessageSquareText size={20} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-slate-900">{c.title}</span>
                      {c.id === activeId && <Tag color="blue" className="!m-0">Open</Tag>}
                      {c.synthetic && <Tag className="!m-0">Sample</Tag>}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">{plain(snippet)}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {formatRelativeDate(c.updatedAt)} · {c.messages.length} messages
                    </span>
                  </span>
                </button>
                <Popconfirm
                  title="Delete this chat?"
                  description="It is removed from this session."
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => deleteConversation(c.id)}
                >
                  <Tooltip title="Delete chat">
                    <Button
                      type="text"
                      className="mr-2"
                      icon={<Trash2 size={16} />}
                      aria-label={`Delete chat ${c.title}`}
                    />
                  </Tooltip>
                </Popconfirm>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
