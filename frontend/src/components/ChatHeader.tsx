import { App, AutoComplete, Badge, Button, Dropdown, Input, Popover, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { Bell, ChevronDown, CircleHelp, Menu, PanelRight, Search } from 'lucide-react'
import { useState } from 'react'
import { formatRelativeDate } from '../lib/format'
import { type ApiStatus, useAppStore } from '../store/appStore'
import { searchConversations, useChatStore } from '../store/chatStore'
import { useUiStore } from '../store/uiStore'
import { PanLogo } from './PanLogo'
import { DEMO_USER } from '../features/chat/demoUser'
import { UserAvatar } from './UserAvatar'

const STATUS: Record<ApiStatus, { label: string; dot: string; badge: string; tip: string }> = {
  checking: {
    label: 'Connecting…',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600',
    tip: 'Checking the PAN AI API…',
  },
  online: {
    label: 'Online · Demo',
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 ring-green-200',
    tip: 'API reachable. Chat replies are still simulated in your browser (demo mode) until PAN-005.',
  },
  offline: {
    label: 'Offline · Demo',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 ring-amber-200',
    tip: 'The PAN AI API is not reachable. The demo still works because replies are simulated in your browser.',
  },
}

function StatusBadge() {
  const apiStatus = useAppStore((s) => s.apiStatus)
  const status = STATUS[apiStatus]
  return (
    <Tooltip title={status.tip}>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.badge}`}
        data-testid="api-status"
        tabIndex={0}
      >
        <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
        {status.label}
      </span>
    </Tooltip>
  )
}

function ChatSearch() {
  const conversations = useChatStore((s) => s.conversations)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const [query, setQuery] = useState('')

  const hits = searchConversations(conversations, query).slice(0, 8)
  const options = query.trim()
    ? hits.length > 0
      ? hits.map(({ conversation, snippet }) => ({
          value: conversation.id,
          label: (
            <div className="min-w-0 py-0.5">
              <div className="truncate font-medium">{conversation.title}</div>
              <div className="truncate text-xs text-slate-500">{snippet.replace(/[*_`#>|]/g, '')}</div>
            </div>
          ),
        }))
      : [{ value: '__none__', disabled: true, label: <span className="text-slate-500">No chats found</span> }]
    : []

  return (
    <AutoComplete
      className="w-full max-w-sm"
      options={options}
      value={query}
      onChange={setQuery}
      onSelect={(id: string) => {
        if (id === '__none__') return
        selectConversation(id)
        setQuery('')
      }}
      popupMatchSelectWidth={360}
    >
      <Input
        allowClear
        prefix={<Search size={16} className="text-slate-400" aria-hidden="true" />}
        placeholder="Search chats…"
        aria-label="Search chats"
        className="!rounded-lg !bg-slate-50"
      />
    </AutoComplete>
  )
}

function Notifications() {
  const read = useUiStore((s) => s.notificationsRead)
  const markRead = useUiStore((s) => s.markNotificationsRead)
  const conversations = useChatStore((s) => s.conversations)
  const latest = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0]

  const content = (
    <div className="w-72 text-sm">
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        <li>
          <div className="font-medium">Demo mode is on</div>
          <div className="text-slate-500">Replies and extraction results are simulated with synthetic data.</div>
        </li>
        {latest && (
          <li>
            <div className="font-medium">Last activity</div>
            <div className="text-slate-500">
              “{latest.title}” · {formatRelativeDate(latest.updatedAt)}
            </div>
          </li>
        )}
      </ul>
    </div>
  )

  return (
    <Popover
      content={content}
      title="Notifications"
      trigger="click"
      placement="bottomRight"
      onOpenChange={(open) => open && markRead()}
    >
      <Tooltip title="Notifications">
        <Button type="text" shape="circle" aria-label={read ? 'Notifications' : 'Notifications (1 unread)'}>
          <Badge dot={!read} offset={[-2, 2]}>
            <Bell size={21} className="text-slate-600" />
          </Badge>
        </Button>
      </Tooltip>
    </Popover>
  )
}

function ProfileMenu() {
  const { modal } = App.useApp()
  const resetDemo = useChatStore((s) => s.resetDemo)

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      type: 'group',
      label: (
        <div className="py-1">
          <div className="font-medium text-slate-800">{DEMO_USER.name}</div>
          <div className="text-xs text-slate-500">Synthetic demo profile</div>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'reset', label: 'Reset demo data' },
    { key: 'signin', label: 'Sign in (coming in PAN-003)', disabled: true },
  ]

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items,
        onClick: ({ key }) => {
          if (key === 'reset') {
            modal.confirm({
              title: 'Reset demo data?',
              content: 'This clears your chats and attachments from this session and restores the sample chats.',
              okText: 'Reset',
              onOk: resetDemo,
            })
          }
        },
      }}
    >
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent p-0.5 pr-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label={`Account menu for ${DEMO_USER.name}`}
      >
        <UserAvatar size={38} />
        <span className="hidden text-sm font-semibold text-slate-800 lg:inline">{DEMO_USER.name}</span>
        <ChevronDown size={16} className="hidden text-slate-500 lg:inline" aria-hidden="true" />
      </button>
    </Dropdown>
  )
}

export function ChatHeader() {
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)
  const setToolsDrawerOpen = useUiStore((s) => s.setToolsDrawerOpen)
  const setHelpOpen = useUiStore((s) => s.setHelpOpen)
  const setView = useChatStore((s) => s.setView)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 md:gap-4 md:px-6">
      <Button
        type="text"
        className="md:!hidden"
        icon={<Menu size={22} />}
        aria-label="Open navigation menu"
        onClick={() => setMobileNavOpen(true)}
      />
      <div className="flex min-w-0 items-center gap-2.5">
        <PanLogo size={34} />
        <h1 className="m-0 hidden text-2xl font-bold text-navy-900 min-[400px]:block">PAN AI</h1>
        <StatusBadge />
      </div>

      <div className="hidden flex-1 justify-end lg:flex">
        <ChatSearch />
      </div>
      <div className="ml-auto flex items-center gap-0.5 md:gap-1.5 lg:ml-0">
        <Tooltip title="Search chats">
          <Button
            type="text"
            shape="circle"
            className="lg:!hidden"
            icon={<Search size={20} className="text-slate-600" />}
            aria-label="Search chats"
            onClick={() => setView('history')}
          />
        </Tooltip>
        <Notifications />
        <Tooltip title="Help">
          <Button
            type="text"
            shape="circle"
            icon={<CircleHelp size={21} className="text-slate-600" />}
            aria-label="Help"
            onClick={() => setHelpOpen(true)}
          />
        </Tooltip>
        <Tooltip title="Documents & tools">
          <Button
            type="text"
            shape="circle"
            className="xl:!hidden"
            icon={<PanelRight size={21} className="text-slate-600" />}
            aria-label="Open documents and tools panel"
            onClick={() => setToolsDrawerOpen(true)}
          />
        </Tooltip>
        <ProfileMenu />
      </div>
    </header>
  )
}
