"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Lightbulb } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";

type Props = { content: string };

/**
/**
 * Prism theme typed correctly (no `any`)
 */
const prismTheme = {
  ...oneDark,
  plain: {
    ...(oneDark.plain as object),
    backgroundColor: "var(--muted)",
    color: "var(--foreground)",
  },
};

/**
 * Code block with copy button & language badge
 */
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore silently
    }
  };

  return (
    <div className="group relative my-4">
      {/* Language badge */}
      <div className="absolute top-2 left-3 font-mono text-xs text-gray-400 uppercase">
        {language}
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1 rounded bg-gray-700 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-600"
        aria-label={`Copy ${language} code`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" /> Copy
          </>
        )}
      </button>

      <SyntaxHighlighter
        language={language}
        style={prismTheme}
        customStyle={{
          margin: 0,
          padding: "2rem 1rem 1rem",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/**
/**
 * `code` renderer (typed properly for inline & block)
 */
const codeRenderer: Components["code"] = (props) => {
  // Fix for type issue: Explicitly destructure using correct prop types
  const { className, children } = props as { className?: string; children?: React.ReactNode; inline?: boolean };
  // In some MDX/ReactMarkdown setups, `inline` might not actually exist
  // Instead, fallback: If there's a language class, it's a block; otherwise, treat as inline
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children ?? "").replace(/\n$/, "");

  // If it's a code block (has language), use CodeBlock; otherwise, render inline code
  if (match) {
    return <CodeBlock code={codeString} language={match[1]} />;
  }

  return (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-pink-600 dark:bg-gray-800 dark:text-pink-400">
      {children}
    </code>
  );
};

/**
 * Full markdown renderer map
 */
const components: Components = {
  h1: ({ children }) => <h1 className="mt-8 mb-4 text-3xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-8 mb-3 text-2xl font-semibold">{children}</h2>,
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 flex items-center gap-2 text-xl font-semibold">{children}</h3>
  ),
  h4: ({ children }) => <h4 className="mt-4 mb-2 text-lg font-medium">{children}</h4>,

  p: ({ children }) => (
    <p className="my-3 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>
  ),

  ul: ({ children }) => (
    <ul className="my-3 ml-6 list-disc space-y-1.5 marker:text-blue-500">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 ml-6 list-decimal space-y-1.5 marker:font-semibold marker:text-blue-500">
      {children}
    </ol>
  ),

  /**
   * ✅ Fixed type issue for `checked`
   */
  li: ({ checked, children }: { checked?: boolean; children?: React.ReactNode }) => {
    if (typeof checked === "boolean") {
      return (
        <li className="flex list-none items-start gap-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span className="text-gray-700 dark:text-gray-300">{children}</span>
        </li>
      );
    }
    return <li className="text-gray-700 dark:text-gray-300">{children}</li>;
  },

  blockquote: ({ children }) => {
    const text = String(children).toLowerCase();
    if (text.includes("💡") || text.includes("tip")) {
      return (
        <div className="my-3 flex items-start gap-3 rounded-r border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-950">
          <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm text-blue-900 dark:text-blue-100">{children}</div>
        </div>
      );
    }
    return (
      <blockquote className="my-3 border-l-4 border-gray-300 pl-4 text-gray-600 italic dark:text-gray-400">
        {children}
      </blockquote>
    );
  },

  code: codeRenderer,

  a: ({ href, children }) => {
    const isExternal = typeof href === "string" && href.startsWith("http");
    return (
      <a
        href={href}
        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {children}
        {isExternal && <ExternalLink className="h-3 w-3" />}
      </a>
    );
  },

  hr: () => <hr className="my-6 border-t border-gray-200 dark:border-gray-700" />,

  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
  ),
  em: ({ children }) => <em className="text-gray-700 italic dark:text-gray-300">{children}</em>,
};

export default function StepContentView({ content }: Props) {
  return (
    <article className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
