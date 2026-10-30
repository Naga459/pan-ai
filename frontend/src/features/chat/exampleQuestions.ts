export const EXAMPLE_QUESTIONS = [
  'Extract PAN number from this image.',
  'Is this PAN format valid?',
  'What does the fourth character mean?',
  'How do I correct PAN details?',
  'What documents are required for PAN correction?',
  'How do I download e-PAN?',
  'How do I link PAN with Aadhaar?',
] as const

/** Questions that only make sense with a document attached. */
export const NEEDS_DOCUMENT = new Set<string>(['Extract PAN number from this image.'])
/** Questions that need the user to supply a PAN first. */
export const NEEDS_PAN = new Set<string>(['Is this PAN format valid?'])
