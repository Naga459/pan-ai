import { Button, Drawer, Tooltip } from 'antd'
import {
  FileText,
  History,
  MessageSquare,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  SquarePlus,
  type LucideIcon,
} from 'lucide-react'
import { formatRelativeDate } from '../lib/format'
import { sortByRecent, useChatStore } from '../store/chatStore'
import { useUiStore } from '../store/uiStore'
import type { MainView } from '../types/chat'
import { PanLogo } from './PanLogo'

const RECENT_LIMIT = 8

interface NavItem {
  key: string
  label: string
  icon: LucideIcon
  view?: MainView
}

const NAV_ITEMS: NavItem[] = [
  { key: 'chat', label: 'Chat', icon: MessageSquare, view: 'chat' },
  { key: 'new', label: 'New Chat', icon: SquarePlus },
  { key: 'history', label: 'Chat History', icon: History, view: 'history' },
  { key: 'documents', label: 'Uploaded Documents', icon: FileText, view: 'documents' },
]

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const view = useChatStore((s) => s.view)
  const setView = useChatStore((s) => s.setView)
  const newChat = useChatStore((s) => s.newChat)
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const recent = sortByRecent(conversations.filter((c) => c.messages.length > 0)).slice(0, RECENT_LIMIT)

  const onNav = (item: NavItem) => {
    if (item.key === 'new') newChat()
    else if (item.view) setView(item.view)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col bg-navy-900 text-white">
      <div className={`flex items-center border-b border-white/10 py-4 ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
        <PanLogo size={collapsed ? 34 : 42} />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-xl font-bold leading-tight">PAN AI</div>
            <div className="text-xs text-white/70">Your PAN Assistant</div>
          </div>
        )}
      </div>

      <nav className={`flex flex-col gap-1 ${collapsed ? 'p-2' : 'p-3'}`} aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = item.view !== undefined && item.view === view
          const Icon = item.icon
          const button = (
            <button
              key={item.key}
              type="button"
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              onClick={() => onNav(item)}
              className={`flex w-full cursor-pointer items-center rounded-xl text-left text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              } ${active ? 'bg-brand-600 text-white shadow-md shadow-blue-900/40' : 'text-white/85 hover:bg-white/8 hover:text-white'}`}
            >
              <Icon size={21} aria-hidden="true" />
              {!collapsed && item.label}
            </button>
          )
          return collapsed ? (
            <Tooltip key={item.key} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          )
        })}
      </nav>

      {!collapsed && (
        <div className="flex min-h-0 flex-1 flex-col border-t border-white/10 pt-3">
          <h2 className="m-0 px-6 pb-2 text-sm font-medium text-blue-300">Recent Chats</h2>
          {recent.length === 0 ? (
            <p className="m-0 px-6 text-sm text-white/60">No conversations yet.</p>
          ) : (
            <ul className="m-0 flex min-h-0 list-none flex-col gap-1 overflow-y-auto px-3 pb-3" aria-label="Recent chats">
              {recent.map((c) => {
                const active = c.id === activeId && view === 'chat'
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => {
                        selectConversation(c.id)
                        onNavigate?.()
                      }}
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                        active ? 'bg-white/12' : 'hover:bg-white/6'
                      }`}
                    >
                      <MessageSquareText size={19} className="mt-0.5 shrink-0 text-white/70" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{c.title}</span>
                        <span className="block text-xs text-white/55">{formatRelativeDate(c.updatedAt)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <div className={`mt-auto ${collapsed ? 'p-2' : 'p-3'}`}>
        {collapsed ? (
          <Tooltip title="PAN AI focuses only on PAN-related information" placement="right">
            <div className="flex justify-center rounded-xl bg-navy-800 p-3">
              <ShieldCheck size={22} className="text-blue-400" aria-label="PAN-only assistant" />
            </div>
          </Tooltip>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-navy-800 p-4">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <ShieldCheck size={22} className="text-blue-400" aria-hidden="true" /> PAN AI
            </div>
            <p className="m-0 text-sm leading-relaxed text-white/80">
              Focused only on PAN related information, extraction and assistance.
            </p>
          </div>
        )}
        {onNavigate === undefined && (
          <div className={`mt-2 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
              <Button
                type="text"
                size="small"
                className="!text-white/70 hover:!bg-white/10 hover:!text-white"
                icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
                onClick={toggleSidebar}
              />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatSidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const mobileOpen = useUiStore((s) => s.mobileNavOpen)
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen)

  return (
    <>
      <aside
        className={`hidden shrink-0 transition-[width] duration-200 md:block ${collapsed ? 'w-[76px]' : 'w-64'}`}
        aria-label="Sidebar"
      >
        <SidebarContent collapsed={collapsed} />
      </aside>
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        placement="left"
        size={280}
        closable={false}
        styles={{ body: { padding: 0 } }}
        title={null}
        aria-label="Navigation menu"
      >
        <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </>
  )
}
