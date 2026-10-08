import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders a coach answer's markdown text (tables, **bold**, ## headings,
 * lists) with the design system's own styling instead of Tailwind's
 * typography plugin (not installed -- this app's utility classes are
 * enough for the handful of elements an LLM answer actually uses). Every
 * page that used to dump `analysis`/section body text through
 * `whitespace-pre-wrap` had the same bug: a real markdown table or
 * **bold** label rendered as literal pipe-and-asterisk text instead of a
 * table/bold run -- this component is the fix, reused everywhere a coach
 * answer's free text is shown. */
export function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-sm leading-6 text-text-secondary [&_p]:leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h3 className="mt-4 text-base font-bold text-text-primary first:mt-0">{children}</h3>,
          h2: ({ children }) => <h4 className="mt-4 text-sm font-bold uppercase tracking-[0.04em] text-text-primary first:mt-0">{children}</h4>,
          h3: ({ children }) => <h5 className="mt-3 text-sm font-bold text-text-primary first:mt-0">{children}</h5>,
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
          em: ({ children }) => <em className="text-text-primary">{children}</em>,
          ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline underline-offset-2">
              {children}
            </a>
          ),
          code: ({ children }) => <code className="rounded bg-surface-secondary px-1 py-0.5 text-xs text-text-primary">{children}</code>,
          hr: () => <hr className="border-border" />,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-surface-secondary">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.04em] text-text-secondary">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-border px-3 py-2 tabular-nums text-text-primary last:border-b-0">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
