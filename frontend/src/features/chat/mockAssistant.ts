/**
 * In-browser stand-in for the PAN AI engine (PAN-005). Every reply is canned or rule-based
 * and is flagged `demo: true` so the UI never presents it as real AI or real OCR output.
 */
import type { Attachment, PanExtraction } from '../../types/chat'
import {
  findPanCandidates,
  validatePanFormat,
  type PanValidationResult,
} from '../pan-validation/panValidator'

export interface MockReply {
  content: string
  extraction?: PanExtraction
  validation?: PanValidationResult
}

export interface MockRequest {
  prompt: string
  attachments?: Attachment[]
}

/** Fictional sample — not a real person. Format-valid so the demo card is consistent. */
export const SYNTHETIC_PAN_FIELDS = {
  panNumber: 'ABCPS1234F',
  fullName: 'RAHUL SHARMA',
  parentName: 'RAJESH SHARMA',
  dateOfBirth: '15/06/1990',
  cardType: 'Individual',
  holderCategory: 'Individual (P)',
} as const

export const ERROR_TRIGGER = '#error'

const OFFICIAL_SOURCES =
  'Official sources: Income Tax e-filing portal (incometax.gov.in) and the PAN service portals of Protean (formerly NSDL e-Gov) and UTIITSL.'

export function buildSyntheticExtraction(documentName: string): PanExtraction {
  return {
    documentName,
    fields: { ...SYNTHETIC_PAN_FIELDS },
    confidence: { panNumber: 99, fullName: 98, parentName: 96, dateOfBirth: 97 },
    validation: validatePanFormat(SYNTHETIC_PAN_FIELDS.panNumber),
    synthetic: true,
  }
}

interface Topic {
  match: RegExp
  answer: string
}

const TOPICS: Topic[] = [
  {
    match: /\b(4th|fourth)\b.*\b(char(acter)?|letter)\b|holder (type|category)|\bcategory\b/i,
    answer: `The **4th character** of a PAN shows the type of holder:

| Code | Holder type |
|---|---|
| P | Individual |
| C | Company |
| H | Hindu Undivided Family (HUF) |
| F | Firm / Limited Liability Partnership |
| A | Association of Persons (AOP) |
| B | Body of Individuals (BOI) |
| T | Trust |
| L | Local Authority |
| J | Artificial Juridical Person |
| G | Government |

For individuals, the **5th character** is usually the first letter of the surname. The last character is an alphabetic check character.`,
  },
  {
    match: /\b(documents?|proofs?)\b.*\b(required|needed|need|for)\b|\bwhat documents\b/i,
    answer: `For a **PAN correction / change request** you typically need:

- **Proof of identity** — e.g. Aadhaar, passport, voter ID or driving licence
- **Proof of address** — e.g. Aadhaar, utility bill, bank statement
- **Proof of date of birth** — e.g. birth certificate, passport, matriculation certificate
- **Copy of your existing PAN** (or the PAN number)
- **Proof supporting the change**, such as a marriage certificate or gazette notification for a name change

Aadhaar-based e-KYC can replace several physical documents when applying online.`,
  },
  {
    match: /\b(correct(ion)?|update|change|mistake|wrong|address)\b/i,
    answer: `To **correct or update PAN details**:

1. Use the *Change/Correction in PAN data* service on the Protean or UTIITSL PAN portal.
2. Enter your existing PAN and tick the fields you want to change.
3. Authenticate with Aadhaar e-KYC or submit scanned supporting documents.
4. Pay the applicable fee and note the acknowledgement number.
5. Track the status online; a corrected PAN card / e-PAN is issued once approved.

Your **PAN number does not change** after a correction.`,
  },
  {
    match: /\be-?pan\b|\bdownload\b/i,
    answer: `To **download an e-PAN**:

- If your PAN was issued through **Protean (NSDL)** or **UTIITSL**, use that agency's *Download e-PAN* service with your PAN, Aadhaar (for individuals) and date of birth.
- If you got an **Instant e-PAN** through the Income Tax e-filing portal, download it from the portal's *Instant e-PAN* section.

An e-PAN is a digitally signed PDF and is a valid proof of PAN.`,
  },
  {
    match: /\baadh?aa?r\b/i,
    answer: `To **link PAN with Aadhaar**:

1. Go to the Income Tax e-filing portal and choose **Link Aadhaar**.
2. Enter your PAN and Aadhaar number.
3. Pay any applicable fee if prompted, then validate with the OTP sent to your Aadhaar-linked mobile.
4. Use **Link Aadhaar Status** on the same portal to confirm.

Check the portal for the current fee and deadlines — they have changed over time.`,
  },
  {
    match: /\b(apply|application|new pan|form 49a?a?)\b/i,
    answer: `To **apply for a new PAN**:

- **Indian citizens** use **Form 49A**; foreign citizens and entities use **Form 49AA**.
- Apply online through the Protean or UTIITSL PAN portal, or get an **Instant e-PAN** free on the Income Tax e-filing portal if you have Aadhaar linked to your mobile.
- Provide proof of identity, address and date of birth (Aadhaar e-KYC can cover these).
- Track the application with the acknowledgement number.`,
  },
  {
    match: /\b(lost|reprint|duplicate|damaged)\b/i,
    answer: `If your PAN card is **lost or damaged**, you can request a **reprint** of the same PAN through the Protean or UTIITSL portal, or download an **e-PAN**. Never apply for a second PAN — holding more than one PAN is not allowed.`,
  },
  {
    match: /\bwhat is (a )?pan\b|\bpermanent account\b|\bpan (stand|mean)/i,
    answer: `**PAN (Permanent Account Number)** is a 10-character alphanumeric identifier issued by the Income Tax Department of India.

- Format: \`AAAAA9999A\` — 5 letters, 4 digits, 1 letter.
- The 4th letter shows the holder type (e.g. **P** = Individual, **C** = Company).
- It is needed for filing income tax returns, high-value transactions, opening bank or demat accounts and more.
- One person or entity should hold only one PAN.`,
  },
]

const SCOPE_WORDS =
  /\b(pan|permanent account|aadh?aa?r|e-?pan|income tax|tax|49a|49aa|itr|nsdl|protean|utiitsl|kyc|card|holder|extract|validate|verify|valid)\b/i
const GREETING = /^\s*(hi|hello|hey|namaste|help|good (morning|afternoon|evening))\b/i
const EXTRACT_INTENT = /\b(extract|scan|ocr|read|upload)\b/i
const VALIDATE_INTENT = /\b(valid(ate)?|check|verify)\b/i

function describeValidation(result: PanValidationResult): string {
  if (result.formatValid) {
    return `**${result.normalized}** has a **valid PAN format**. The 4th character '${result.holderCategoryCode}' indicates the holder category **${result.holderCategory}**.`
  }
  const failed = result.checks.filter((c) => !c.passed).map((c) => `- ✗ ${c.label}`)
  return `**${result.normalized || '(empty)'}** does **not** match the PAN format:\n\n${failed.join('\n')}`
}

const FORMAT_DISCLAIMER =
  '> A format check only confirms the structure. It does **not** confirm that the PAN was issued, is active or belongs to anyone — **government verification: not checked**.'

export function generateMockReply({ prompt, attachments = [] }: MockRequest): MockReply {
  const text = prompt.trim()
  const documents = attachments.filter((a) => a.kind === 'image' || a.kind === 'pdf')

  if (documents.length > 0) {
    const doc = documents[0]
    const extraction = buildSyntheticExtraction(doc.name)
    return {
      content: `Here are the extracted details for **${doc.name}**.\n\n**Demo result:** OCR is not connected yet (PAN-004), so these are **fictional sample values**, not text read from your file.`,
      extraction,
    }
  }

  const candidates = findPanCandidates(text)
  if (candidates.length > 0) {
    const results = candidates.map(validatePanFormat)
    const others =
      results.length > 1
        ? `\n\nOther PAN-like values found:\n\n${results
            .slice(1)
            .map((r) => `- **${r.normalized}** — ${r.formatValid ? 'format valid' : 'format invalid'}`)
            .join('\n')}`
        : ''
    return {
      content: `${describeValidation(results[0])}${others}\n\n${FORMAT_DISCLAIMER}`,
      validation: results[0],
    }
  }

  if (EXTRACT_INTENT.test(text)) {
    return {
      content:
        'Please **attach a PAN card image or PDF** (JPG, PNG, WEBP or PDF, up to 10 MB) using the paperclip button, then send your request. You can also paste text that contains a PAN and I will pick out the PAN number.',
    }
  }

  const topic = TOPICS.find((t) => t.match.test(text))
  if (topic) {
    return { content: `${topic.answer}\n\n_${OFFICIAL_SOURCES}_` }
  }

  if (VALIDATE_INTENT.test(text) && SCOPE_WORDS.test(text)) {
    return {
      content:
        'Send me the PAN you want to check, for example: **Validate ABCPS1234F**. I will check its format and holder category.',
    }
  }

  if (GREETING.test(text) || SCOPE_WORDS.test(text)) {
    return {
      content: `Hello! I can help with **Indian PAN** only:

- Extract details from a PAN card image or PDF
- Find PAN numbers in text and check their format
- Explain the holder category (4th character)
- Answer questions on applying, correcting, e-PAN and Aadhaar linking

Try one of the example questions on the right.`,
    }
  }

  return {
    content:
      "I'm **PAN AI** and can only help with **Indian PAN (Permanent Account Number)** topics — PAN card extraction, PAN format checks and PAN-related questions. Please ask a PAN-related question.",
  }
}

export async function requestMockReply(
  request: MockRequest,
  delayMs: number,
): Promise<MockReply> {
  if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs))
  if (request.prompt.includes(ERROR_TRIGGER)) {
    throw new Error('The demo engine simulated a failure. Use Retry to try again.')
  }
  return generateMockReply(request)
}
