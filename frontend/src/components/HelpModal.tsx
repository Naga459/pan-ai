import { Alert, Modal } from 'antd'
import { ERROR_TRIGGER } from '../features/chat/mockAssistant'
import { MAX_UPLOAD_MB } from '../features/documents/fileValidation'
import { useUiStore } from '../store/uiStore'

export function HelpModal() {
  const open = useUiStore((s) => s.helpOpen)
  const setOpen = useUiStore((s) => s.setHelpOpen)

  return (
    <Modal open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} title="Using PAN AI" cancelButtonProps={{ className: '!hidden' }} okText="Got it">
      <div className="space-y-3 text-sm text-slate-700">
        <Alert
          type="warning"
          showIcon
          title="Demo mode"
          description="Replies are generated in your browser from built-in rules and synthetic sample data. Real AI (PAN-005) and OCR (PAN-004) are not connected yet."
        />
        <ul className="m-0 list-disc space-y-1 pl-5">
          <li>
            <strong>Extract:</strong> attach a JPG, PNG, WEBP or PDF (max {MAX_UPLOAD_MB} MB) and send. The result uses
            fictional sample values.
          </li>
          <li>
            <strong>Validate:</strong> type or paste a PAN, e.g. “Validate ABCPS1234F”, to check its format and holder
            category.
          </li>
          <li>
            <strong>Ask:</strong> questions about PAN applications, corrections, e-PAN and Aadhaar linking.
          </li>
          <li>
            <strong>Keyboard:</strong> Enter sends, Shift+Enter adds a new line.
          </li>
          <li>
            <strong>Testing:</strong> include <code>{ERROR_TRIGGER}</code> in a message to simulate a failed reply and try
            Retry.
          </li>
        </ul>
        <p className="m-0">
          A PAN format check confirms structure only — it is <strong>not government verification</strong>. Chats and
          files stay in this browser tab and are not saved.
        </p>
      </div>
    </Modal>
  )
}
