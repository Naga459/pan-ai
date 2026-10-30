import ReactMarkdown, { type Components } from 'react-markdown'

const components: Components = {
  // Wide tables scroll inside the bubble instead of widening the page.
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
}

/** Renders assistant Markdown. Raw HTML is not rendered (react-markdown default). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="pan-markdown">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  )
}
