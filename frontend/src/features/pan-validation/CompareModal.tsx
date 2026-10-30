import { Alert, Button, Form, Input, Modal, Tag } from 'antd'
import { useState } from 'react'
import { selectActiveConversation, useChatStore } from '../../store/chatStore'
import { useUiStore } from '../../store/uiStore'
import { type CompareValues, type FieldResult, compareWithExtraction } from './compare'

export function CompareModal() {
  const open = useUiStore((s) => s.compareOpen)
  const setOpen = useUiStore((s) => s.setCompareOpen)
  const conversation = useChatStore(selectActiveConversation)
  const openFilePicker = useChatStore((s) => s.openFilePicker)
  const [results, setResults] = useState<FieldResult[] | null>(null)
  const [form] = Form.useForm<CompareValues>()

  const extraction = conversation?.messages
    .filter((m) => m.extraction)
    .at(-1)?.extraction

  const close = () => {
    setOpen(false)
    setResults(null)
    form.resetFields()
  }

  return (
    <Modal open={open} onCancel={close} title="Compare PAN Details" footer={null} destroyOnHidden>
      {!extraction ? (
        <div className="flex flex-col gap-3">
          <Alert
            type="info"
            showIcon
            title="No extraction in this chat yet"
            description="Extract a PAN card first, then compare the details you have against it."
          />
          <Button
            type="primary"
            onClick={() => {
              close()
              openFilePicker({ draft: 'Extract all details from this PAN card.' })
            }}
          >
            Upload PAN Card
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-0 text-sm text-slate-600">
            Compare details you have with the extraction from <strong>{extraction.documentName}</strong>
            {extraction.synthetic && ' (synthetic demo values)'}.
          </p>
          <Form form={form} layout="vertical" onFinish={(values) => setResults(compareWithExtraction(values, extraction))}>
            <Form.Item name="panNumber" label="PAN Number" rules={[{ required: true, message: 'Enter a PAN' }]}>
              <Input placeholder="ABCPS1234F" className="font-mono uppercase" maxLength={12} />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Enter a name' }]}>
              <Input placeholder="As printed on the card" />
            </Form.Item>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: 'Enter a date of birth' }]}
            >
              <Input placeholder="DD/MM/YYYY" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Compare
            </Button>
          </Form>

          {results && (
            <div className="mt-4" data-testid="compare-results">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-1 font-medium">Field</th>
                    <th className="py-1 font-medium">Extracted</th>
                    <th className="py-1 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.label} className="border-t border-slate-100">
                      <td className="py-1.5">{r.label}</td>
                      <td className="py-1.5 font-medium">{r.extracted}</td>
                      <td className="py-1.5">
                        <Tag color={r.match ? 'success' : 'error'}>{r.match ? 'Match' : 'Mismatch'}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mb-0 mt-2 text-xs text-slate-500">
                This compares text only. It is not government verification.
              </p>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
