import { ArrowUpRight, Briefcase, ExternalLink, Github, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/slug";

interface ProjectCardProps {
  title: string;
  company?: string;
  year?: string;
  featured?: boolean;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  image?: string;
  variant?: "default" | "large";
}

const scrollToCompany = (company: string) => {
  const el = document.getElementById(`company-${slugify(company)}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("ring-2", "ring-primary/60");
    window.setTimeout(
      () => el.classList.remove("ring-2", "ring-primary/60"),
      1800
    );
  }
};

const ProjectCard = ({
  title,
  company,
  year,
  featured,
  description,
  techStack,
  githubUrl,
  demoUrl,
  variant = "default",
}: ProjectCardProps) => {
  const projectId = `project-${slugify(title)}`;
  const isLarge = variant === "large";

  return (
    <article
      id={projectId}
      className={`group relative flex flex-col h-full rounded-3xl glass overflow-hidden hover-lift scroll-mt-28 target:ring-2 target:ring-primary/60 ${
        isLarge ? "border-primary/20" : ""
      }`}
    >
      {/* Gradient accent for large cards */}
      {isLarge && (
        <>
          <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        </>
      )}

      {/* Featured badge */}
      {featured && (
        <div className="absolute top-5 right-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary px-3 py-1 text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm">
          <Star className="h-3 w-3 fill-current" />
          Featured
        </div>
      )}

      <div className={`relative flex-1 flex flex-col ${isLarge ? "p-8" : "p-6"}`}>
        {/* Meta row */}
        {(company || year) && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {company && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToCompany(company);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-primary/50 hover:text-primary transition-smooth"
              >
                <Briefcase className="h-3 w-3" />
                {company}
              </button>
            )}
            {year && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {year}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className={`${
              isLarge
                ? "text-2xl md:text-3xl"
                : "text-lg md:text-xl"
            } font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors`}
          >
            {title}
          </h3>
          {(githubUrl || demoUrl) && (
            <a
              href={demoUrl ?? githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${title}`}
              className="rounded-full p-2 border border-border/40 text-muted-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-smooth shrink-0"
            >
              <ArrowUpRight className="h-4 w-4 group-hover:rotate-45 transition-transform duration-300" />
            </a>
          )}
        </div>

        <p
          className={`text-muted-foreground leading-relaxed mb-5 flex-1 ${
            isLarge ? "text-[15px]" : "text-sm"
          } ${isLarge ? "line-clamp-none" : "line-clamp-4"}`}
        >
          {description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {techStack.slice(0, isLarge ? 12 : 6).map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="font-mono text-[11px] bg-secondary/50 border border-border/40 hover:border-primary/40 hover:text-primary transition-smooth"
            >
              {tech}
            </Badge>
          ))}
          {!isLarge && techStack.length > 6 && (
            <Badge
              variant="secondary"
              className="font-mono text-[11px] bg-secondary/30 border border-border/30 text-muted-foreground"
            >
              +{techStack.length - 6}
            </Badge>
          )}
        </div>

        {/* Footer links */}
        {(githubUrl || demoUrl) && (
          <div className="flex gap-2 pt-4 border-t border-border/40">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/30 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-smooth"
              >
                <Github className="h-3.5 w-3.5" />
                Code
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-smooth"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
