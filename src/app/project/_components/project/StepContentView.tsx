import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import "highlight.js/styles/github.css";

type Props = {
  content: string; // Fix type
};

/**
 * Renders AI-generated step content with clean, readable visual hierarchy.
 * Sections: Overview, Instructions, Verification, Encouragement.
 */
export default function StepContentView({ content }: Props) {
  const sections = splitSections(content);

  return (
    <div className="prose prose-headings:font-semibold prose-pre:rounded-lg prose-pre:p-0 prose-code:text-sm prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground max-w-none leading-relaxed">
      {sections.overview && (
        <Section
          title="📋 Overview"
          bg="bg-accent/25"
          border="border-accent/40"
          text={sections.overview}
        />
      )}

      {sections.instructions && (
        <Section
          title="🧩 Step-by-Step Instructions"
          bg="bg-secondary/40"
          border="border-secondary/40"
          text={sections.instructions}
        />
      )}

      {sections.verification && (
        <Section
          title="✅ Verification"
          bg="bg-primary/10"
          border="border-primary/30"
          text={sections.verification}
        />
      )}

      {sections.encouragement && (
        <Section
          title="💬 Encouragement"
          bg="bg-yellow-50"
          border="border-yellow-300"
          text={sections.encouragement}
        />
      )}
    </div>
  );
}

/** Individual content section */
function Section({
  title,
  text,
  bg,
  border,
}: {
  title: string;
  text: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className={`${bg} ${border} mb-10 space-y-5 rounded-2xl border p-6 shadow-sm transition-colors duration-200 sm:p-8`}
    >
      <h3 className="text-foreground mb-2 text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h3>

      <div className="prose prose-sm sm:prose-base text-foreground max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ className, children }) {
              const lang = className?.replace("language-", "");
              return (
                <pre className="bg-muted/70 border-border/40 overflow-x-auto rounded-lg border p-4 text-sm sm:text-base">
                  <code className={`language-${lang}`}>{children}</code>
                </pre>
              );
            },
            a({ href, children }) {
              return (
                <a
                  href={href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium underline transition-colors"
                >
                  {children}
                </a>
              );
            },
            li({ children }) {
              return <li className="text-foreground ml-6 list-disc leading-relaxed">{children}</li>;
            },
            p({ children }) {
              return <p className="text-foreground my-3">{children}</p>;
            },
            strong({ children }) {
              return <strong className="text-foreground font-semibold">{children}</strong>;
            },
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

/**
 * Splits AI markdown into structured sections based on headings:
 * "### 1) Overview", "### 2) Step-by-step Instructions", "### 3) Verification"
 */
function splitSections(text: string) {
  const parts = {
    overview: "",
    instructions: "",
    verification: "",
    encouragement: "",
  };

  const overviewMatch = text.match(/### 1\) Overview([\s\S]*?)(?=### 2\)|$)/);
  const instructionsMatch = text.match(/### 2\)[\s\S]*?Instructions([\s\S]*?)(?=### 3\)|$)/);
  const verificationMatch = text.match(/### 3\) Verification([\s\S]*?)(?=$)/);

  parts.overview = overviewMatch?.[1]?.trim() || "";
  parts.instructions = instructionsMatch?.[1]?.trim() || "";
  parts.verification = verificationMatch?.[1]?.trim() || "";

  const encouragementMatch = text.match(
    /(Feel free to|You're doing great|If you run into any issues)[\s\S]*$/i
  );
  if (encouragementMatch) {
    parts.encouragement = encouragementMatch[0].trim();
  }

  return parts;
}
