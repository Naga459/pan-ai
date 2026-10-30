import { Button, Tag, Tooltip } from 'antd'
import { BarChart3, CheckCircle2, Copy, Download, ImagePlus, Info, ShieldAlert, XCircle } from 'lucide-react'
import { SYNTHETIC_PAN_FIELDS } from '../features/chat/mockAssistant'
import { useCopy } from '../hooks/useCopy'
import { downloadJson } from '../lib/browser'
import { useChatStore } from '../store/chatStore'
import { FIELD_LABELS, extractionToJson, extractionToText } from '../features/documents/extractionExport'
import type { Attachment, PanExtraction } from '../types/chat'
import { DocumentThumbnail } from './DocumentPreview'
import { SyntheticPanCard } from './SyntheticPanCard'

interface PANExtractionCardProps {
  extraction: PanExtraction
  document?: Attachment
}

export function PANExtractionCard({ extraction, document }: PANExtractionCardProps) {
  const copy = useCopy()
  const openFilePicker = useChatStore((s) => s.openFilePicker)
  const { fields, confidence, validation } = extraction

  const exportJson = () => {
    const base = extraction.documentName.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_') || 'pan'
    downloadJson(`${base}_extraction.json`, extractionToJson(extraction))
  }

  return (
    <section
      className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white"
      aria-label="PAN extraction result"
      data-testid="pan-extraction-card"
    >
      <div className="grid gap-4 p-3 md:p-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          {document?.previewUrl ? (
            <img
              src={document.previewUrl}
              alt={`Uploaded document ${document.name}`}
              className="max-h-64 w-full rounded-xl border border-slate-200 object-contain"
            />
          ) : document && document.kind === 'pdf' ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <DocumentThumbnail attachment={document} className="h-16 w-14" />
              <div className="min-w-0 text-sm">
                <div className="truncate font-medium">{document.name}</div>
                <div className="text-slate-500">PDF preview is not shown in the demo.</div>
              </div>
            </div>
          ) : (
            <SyntheticPanCard fields={SYNTHETIC_PAN_FIELDS} />
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="m-0 text-sm font-semibold text-slate-900">Extracted Details</h3>
            <div className="flex flex-wrap gap-1">
              {extraction.synthetic && <Tag color="gold" className="!m-0">Demo data</Tag>}
              <Tag
                color={validation.formatValid ? 'success' : 'error'}
                icon={validation.formatValid ? <CheckCircle2 size={12} className="mr-1 inline" /> : <XCircle size={12} className="mr-1 inline" />}
                className="!m-0"
              >
                {validation.formatValid ? 'Format Valid' : 'Format Invalid'}
              </Tag>
            </div>
          </div>

          <dl className="m-0 divide-y divide-slate-100 text-sm">
            {FIELD_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 py-1.5">
                <dt className="w-32 shrink-0 text-slate-500">{label}</dt>
                <dd className="m-0 min-w-0 flex-1 truncate font-medium text-slate-900" title={fields[key]}>
                  {fields[key]}
                </dd>
                <Tooltip title={`Copy ${label}`}>
                  <Button
                    type="text"
                    size="small"
                    icon={<Copy size={14} />}
                    aria-label={`Copy ${label}`}
                    onClick={() => void copy(fields[key], `${label} copied`)}
                  />
                </Tooltip>
              </div>
            ))}
            <div className="flex items-center gap-2 py-1.5">
              <dt className="w-32 shrink-0 text-slate-500">Govt. Verification</dt>
              <dd className="m-0 flex items-center gap-1 font-medium text-amber-700">
                <ShieldAlert size={14} aria-hidden="true" /> Not checked
              </dd>
            </div>
          </dl>

          <div className="mt-2 flex items-start gap-3 rounded-lg bg-slate-50 p-3">
            <BarChart3 size={20} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
            <div className="min-w-0 text-sm">
              <div className="font-medium text-slate-800">
                OCR Confidence {extraction.synthetic && <span className="font-normal text-slate-500">(simulated)</span>}
              </div>
              <div className="text-slate-600">
                PAN: {confidence.panNumber}% <span className="text-slate-300">|</span> Name: {confidence.fullName}%{' '}
                <span className="text-slate-300">|</span> Father: {confidence.parentName}%{' '}
                <span className="text-slate-300">|</span> DOB: {confidence.dateOfBirth}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-3 mb-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-sm md:mx-4">
        <div className="mb-1 flex items-center gap-2 font-semibold text-navy-900">
          <Info size={16} className="text-brand-600" aria-hidden="true" /> Important Notes
        </div>
        <ul className="m-0 list-disc space-y-0.5 pl-6 text-slate-700">
          <li>
            The PAN number format is {validation.formatValid ? 'valid' : 'not valid'}.
            {validation.holderCategoryCode &&
              ` The 4th character '${validation.holderCategoryCode}' indicates ${/^[AEIOU]/i.test(validation.holderCategory ?? '') ? 'an' : 'a'} ${validation.holderCategory} PAN holder.`}
          </li>
          {extraction.synthetic && (
            <li>
              <strong>Demo:</strong> these are fictional sample values. OCR is not connected yet, so nothing was
              read from the document.
            </li>
          )}
          <li>
            A format check is <strong>not government verification</strong>. For official verification, use the
            Income Tax Department e-filing portal.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-3 py-3 md:px-4">
        <Button icon={<Copy size={16} />} onClick={() => void copy(extractionToText(extraction), 'All details copied')}>
          Copy All Details
        </Button>
        <Button icon={<Download size={16} />} onClick={exportJson}>
          Download JSON
        </Button>
        <Button
          icon={<ImagePlus size={16} />}
          onClick={() => openFilePicker({ imagesOnly: true, draft: 'Extract all details from this PAN card.' })}
        >
          Extract from Another Image
        </Button>
      </div>
    </section>
  )
}
