import { cn } from "@/lib/utils";
import type { HeadingItem } from "./useHeadings";

interface TableOfContentsProps {
  headings: HeadingItem[];
  activeId: string | null;
}

const TableOfContents = ({ headings, activeId }: TableOfContentsProps) => {
  if (!headings.length) return null;

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label="On this page">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">On this page</p>
      <ul className="border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={jump(h.id)}
              className={cn(
                "-ml-px block border-l py-1 text-[13px] leading-snug transition-colors",
                h.level === 3 ? "pl-6" : "pl-3",
                activeId === h.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
