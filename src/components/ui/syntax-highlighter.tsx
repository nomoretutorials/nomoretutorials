"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "./button";

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  className?: string;
}

// Lazy load shiki to reduce initial bundle size
let shiki: any = null;

async function loadShiki() {
  if (!shiki) {
    const { createHighlighter } = await import("shiki");
    shiki = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "json",
        "css",
        "html",
        "bash",
        "sql",
        "python",
        "java",
        "go",
        "rust",
        "php",
        "ruby",
        "swift",
        "kotlin",
        "c",
        "cpp",
        "csharp",
        "xml",
        "yaml",
        "toml",
        "ini",
        "dockerfile",
        "markdown",
      ],
    });
  }
  return shiki;
}

export function SyntaxHighlighter({ code, language, className = "" }: SyntaxHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const highlightCode = async () => {
      try {
        const highlighter = await loadShiki();

        if (isMounted) {
          const html = highlighter.codeToHtml(code, {
            lang: language,
            theme: "github-dark", // You can make this dynamic based on theme
          });
          setHighlightedCode(html);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        if (isMounted) {
          setHighlightedCode(`<pre><code>${code}</code></pre>`);
          setIsLoading(false);
        }
      }
    };

    highlightCode();

    return () => {
      isMounted = false;
    };
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore silently
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-muted relative my-4 rounded-lg border p-4 ${className}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground font-mono text-xs uppercase">{language}</span>
          <div className="bg-muted-foreground/20 h-4 w-4 animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted-foreground/20 h-4 w-full animate-pulse rounded" />
          <div className="bg-muted-foreground/20 h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted-foreground/20 h-4 w-5/6 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-muted relative my-4 rounded-lg border ${className}`}>
      {/* Language badge */}
      <div className="text-muted-foreground absolute top-2 left-3 z-10 font-mono text-xs uppercase">
        {language}
      </div>

      {/* Copy button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>

      {/* Code content */}
      <div
        className="overflow-x-auto p-4 pt-8"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </div>
  );
}













