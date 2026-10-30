import { Alert, Button, Empty } from 'antd'
import { Upload } from 'lucide-react'
import { DocumentPreview } from '../../components/DocumentPreview'
import { formatRelativeDate } from '../../lib/format'
import { listDocuments, useChatStore } from '../../store/chatStore'

export function DocumentsView() {
  const conversations = useChatStore((s) => s.conversations)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const openFilePicker = useChatStore((s) => s.openFilePicker)
  const documents = listDocuments(conversations)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-4 md:px-6">
        <h2 className="m-0 mr-auto text-xl font-bold text-navy-900">Uploaded Documents</h2>
        <Button
          type="primary"
          icon={<Upload size={16} />}
          onClick={() => openFilePicker({ draft: 'Extract all details from this PAN card.' })}
        >
          Upload PAN Card
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <Alert
          type="info"
          showIcon
          className="!mb-4"
          title="Documents stay in this browser tab only"
          description="In demo mode files are not uploaded to a server or saved. They disappear when you reload or reset the demo."
        />
        {documents.length === 0 ? (
          <Empty className="mt-10" description="No documents yet. Attach a PAN card image or PDF in the chat." />
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 2xl:grid-cols-3" aria-label="Documents">
            {documents.map(({ attachment, conversationId, conversationTitle }) => (
              <li key={attachment.id} className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 p-3">
                <DocumentPreview attachment={attachment} className="!border-0 !p-0" />
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="min-w-0 truncate">
                    {formatRelativeDate(attachment.addedAt)} · {conversationTitle}
                  </span>
                  <Button size="small" onClick={() => selectConversation(conversationId)}>
                    Open chat
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
