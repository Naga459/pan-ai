import { Drawer } from 'antd'
import { useEffect } from 'react'
import { ChatHeader } from '../components/ChatHeader'
import { ChatSidebar } from '../components/ChatSidebar'
import { ChatToolsPanel } from '../components/ChatToolsPanel'
import { HelpModal } from '../components/HelpModal'
import { ChatView } from '../features/chat/ChatView'
import { HistoryView } from '../features/chat/HistoryView'
import { DocumentsView } from '../features/documents/DocumentsView'
import { CompareModal } from '../features/pan-validation/CompareModal'
import { useAppStore } from '../store/appStore'
import { useChatStore } from '../store/chatStore'
import { useUiStore } from '../store/uiStore'

export default function App() {
  const checkHealth = useAppStore((s) => s.checkHealth)
  const view = useChatStore((s) => s.view)
  const toolsDrawerOpen = useUiStore((s) => s.toolsDrawerOpen)
  const setToolsDrawerOpen = useUiStore((s) => s.setToolsDrawerOpen)

  useEffect(() => {
    void checkHealth()
  }, [checkHealth])

  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      <ChatSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader />
        <div className="flex min-h-0 flex-1 gap-5 p-2 sm:p-3 lg:p-5">
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {view === 'chat' && <ChatView />}
            {view === 'history' && <HistoryView />}
            {view === 'documents' && <DocumentsView />}
          </main>
          <aside className="hidden w-80 shrink-0 overflow-y-auto pb-1 xl:block 2xl:w-[340px]" aria-label="Documents and tools">
            <ChatToolsPanel />
          </aside>
        </div>
      </div>

      <Drawer
        open={toolsDrawerOpen}
        onClose={() => setToolsDrawerOpen(false)}
        placement="right"
        size={340}
        title="Documents & Tools"
        styles={{ body: { padding: 12, background: 'var(--color-surface)' } }}
      >
        <ChatToolsPanel onAction={() => setToolsDrawerOpen(false)} />
      </Drawer>
      <HelpModal />
      <CompareModal />
    </div>
  )
}
