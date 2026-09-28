import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "./teaching.css";

// Minimal view of the hast nodes react-markdown hands to components.
interface HastNode {
  type: string;
  value?: string;
  tagName?: string;
  properties?: { className?: unknown };
  children?: HastNode[];
}

const hastText = (node?: HastNode): string =>
  !node ? "" : node.type === "text" ? node.value ?? "" : (node.children ?? []).map(hastText).join("");

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "section";

const headingWithId =
  (Tag: "h2" | "h3" | "h4") =>
  ({ node, children, ...rest }: ComponentPropsWithoutRef<"h2"> & ExtraProps) => (
    <Tag id={slugify(hastText(node as HastNode))} {...rest}>
      {children}
    </Tag>
  );

const codeLanguage = (node?: HastNode) => {
  const code = node?.children?.find((c) => c.tagName === "code");
  const classes = code?.properties?.className;
  const list = Array.isArray(classes) ? classes.map(String) : [];
  return list.find((c) => c.startsWith("language-"))?.replace("language-", "");
};

const CodeBlock = ({ node, children, ...rest }: ComponentPropsWithoutRef<"pre"> & ExtraProps) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [label, setLabel] = useState("Copy");
  const lang = codeLanguage(node as HastNode);

  const copy = async () => {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setLabel("Copied");
    } catch {
      setLabel("Copy failed");
    }
    window.setTimeout(() => setLabel("Copy"), 1500);
  };

  return (
    <div className="code-block">
      {lang && <span className="code-lang">{lang}</span>}
      <pre ref={preRef} {...rest}>
        {children}
      </pre>
      <button type="button" className="code-copy" onClick={copy}>
        {label}
      </button>
    </div>
  );
};

const components: Components = {
  h1: headingWithId("h2"), // a stray second "# heading" in the body renders as a section
  h2: headingWithId("h2"),
  h3: headingWithId("h3"),
  h4: headingWithId("h4"),
  pre: CodeBlock,
  table: ({ node, ...rest }) => (
    <div className="md-table">
      <table {...rest} />
    </div>
  ),
  a: ({ node, href, ...rest }) => {
    const external = Boolean(href && /^https?:\/\//.test(href));
    return <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest} />;
  },
};

interface LectureMarkdownProps {
  markdown: string;
}

const LectureMarkdown = ({ markdown }: LectureMarkdownProps) => (
  <div className="lecture-md">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
      {markdown}
    </ReactMarkdown>
  </div>
);

export default LectureMarkdown;
