"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Removed: react-syntax-highlighter imports that were causing the build error.
// We will create a custom code block component that styles the <pre> tag
// to match the desired look without this dependency.

interface StepContentViewProps {
  content: string;
}

/* --------------------------------------------------------------
   1. Pre-process: turn ## Metadata { … } into ```json { … } ```
   (User's existing function - it's good, so we keep it)
   -------------------------------------------------------------- */
function preprocessMarkdown(md: string): string {
  return md.replace(/^(##\s+Metadata\s*\n)([\s\S]*?)(?=\n##|$)/gim, (match, header) => {
    // Grab the raw JSON (may contain newlines)
    const json = match.slice(header.length).trim();
    return `${header}\`\`\`json\n${json}\n\`\`\``;
  });
}

/* --------------------------------------------------------------
   2. Label:value detection
   (User's existing function - this clever logic is key!)
   -------------------------------------------------------------- */
const isLabelValuePair = (children: React.ReactNode[]): boolean => {
  if (!Array.isArray(children) || children.length < 2) return false;

  const first = children[0];
  const second = children[1];

  const isStrong = first && typeof first === "object" && "type" in first && first.type === "strong";

  const isColonText = typeof second === "string" && second.trimStart().startsWith(":");

  return Boolean(isStrong) && Boolean(isColonText);
};

/* --------------------------------------------------------------
   3. Main component
   (Keeping all the user's smart rendering logic, just
    updating the blockquote style to remove transparency)
   -------------------------------------------------------------- */
export default function StepContentView({ content }: StepContentViewProps) {
  const processed = preprocessMarkdown(content);

  return (
    <div className="max-w-none">
      <ReactMarkdown
        components={{
          /* ---------- Headers ---------- */
          h2: ({ children }) => (
            <h2 className="mt-10 mb-5 border-b border-gray-800 pb-3 text-2xl font-semibold text-gray-50">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-7 mb-3 text-xl font-semibold text-gray-100">{children}</h3>
          ),

          /* ---------- Paragraphs (label/value magic) ---------- */
          p: ({ children }) => {
            const arr = Array.isArray(children) ? children : [children];

            if (isLabelValuePair(arr)) {
              const label = (arr[0] as any).props.children;
              // Drop the leading ":"
              const valueParts = [(arr[1] as string).replace(/^:\s*/, ""), ...arr.slice(2)];

              return (
                <div className="mt-4 mb-3 grid grid-cols-[max-content_1fr] items-start gap-x-4">
                  <span className="font-mono text-xs font-bold tracking-wider text-gray-500 uppercase">
                    {label}
                  </span>
                  <div className="text-base leading-relaxed text-gray-300">{valueParts}</div>
                </div>
              );
            }

            return <p className="mb-4 text-base leading-relaxed text-gray-300">{children}</p>;
          },

          /* ---------- Strong (non-label) ---------- */
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-100">{children}</strong>
          ),

          /* ---------- Lists ---------- */
          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1 text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1 text-gray-300">{children}</ol>
          ),
          li: ({ children }) => <li className="text-base leading-relaxed">{children}</li>,

          /* ---------- Links ---------- */
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 underline underline-offset-2 transition-colors hover:text-blue-300"
            >
              {children}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ),

          /* ---------- Inline code (UPDATED) ---------- */
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            if (!match) {
              // inline
              return (
                <code
                  className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 font-mono text-sm text-gray-300"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // block – delegate to CodeBlockWithoutHighlighter
            // This component will render a styled <pre> block
            return (
              <CodeBlockWithoutHighlighter
                language={match[1]}
                code={String(children).replace(/\n$/, "")}
              />
            );
          },

          /* ---------- Code blocks (pre > code) (REMOVED) ---------- */
          // We removed the `pre` override.
          // `react-markdown` will use its default <pre> wrapper,
          // and our `code` component override above will catch the
          // code block *inside* it and render our custom component.

          /* ---------- Horizontal rule ---------- */
          hr: () => <hr className="my-9 border-gray-800" />,

          /* ---------- Blockquote (UPDATED) ---------- */
          blockquote: ({ children }) => (
            // Removed /50 from bg-gray-900 to make it solid
            <div className="my-5 rounded-r-lg border-l-4 border-gray-700 bg-gray-900 p-4">
              <div className="text-sm text-gray-400">{children}</div>
            </div>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}

/* --------------------------------------------------------------
   4. CodeBlock (RENAMED and REBUILT)
   - This version does *not* use react-syntax-highlighter.
   - It provides the same frame, header, and copy button.
   - It renders plain text in a <pre><code> block.
   - This fixes the build error.
   -------------------------------------------------------------- */
function CodeBlockWithoutHighlighter({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(code);
    } catch (err) {
      // Fallback for insecure contexts (like some iframes)
      console.warn("Clipboard API failed, using fallback.");
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed"; // T-hide
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err2) {
        console.error("Fallback copy failed", err2);
      }
      document.body.removeChild(textArea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // We removed showLineNumbers as we are not using the highlighter library
  return (
    <div className="my-5 overflow-hidden rounded-lg border border-gray-800">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
        <span className="font-mono text-xs text-gray-500 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded p-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-gray-100"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre
        style={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          backgroundColor: "#1e1e1e", // vscDarkPlus bg
          color: "#d4d4d4", // vscDarkPlus default text
          overflowX: "auto", // Ensure long lines can scroll
        }}
      >
        <code className="font-mono">{String(code).replace(/\n$/, "")}</code>
      </pre>
    </div>
  );
}
