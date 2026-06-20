import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Github,
  Hash,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import profile from "@/data/profile";
import type { Project } from "@/data/profile";
import { slugify } from "@/lib/slug";

const FILTER_TAGS = [
  "All",
  "Featured",
  "AI",
  "React",
  "Vue.js",
  "Node.js",
  "Java",
  "MongoDB",
  "AWS",
  "GCP",
];

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

const ProjectsSection = () => {
  const { projects } = profile;
  const [filter, setFilter] = useState<string>("All");
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const filtered = useMemo(() => {
    if (filter === "All") return projects;
    if (filter === "Featured") return projects.filter((p) => p.featured);
    return projects.filter((p) =>
      p.techStack.some((t) => t.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [filter, projects]);

  useEffect(() => {
    setActiveIdx(0);
  }, [filter]);

  const active: Project | undefined = filtered[activeIdx];

  return (
    <section id="projects" className="relative py-24 bg-background overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-40 pointer-events-none" />
      <div className="container relative mx-auto px-6">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Selected Work</p>
          <h2 className="section-heading mb-4">Projects & Platforms</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Scalable systems, developer tools, and platforms I've architected
            and shipped across SaaS, fintech, and analytics.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {FILTER_TAGS.map((tag) => {
            const isActive = filter === tag;
            return (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider border transition-smooth ${
                  isActive
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No projects match this filter.
          </p>
        ) : (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[340px_1fr] gap-6">
            {/* LEFT — list */}
            <aside className="space-y-2 lg:max-h-[640px] lg:overflow-y-auto lg:pr-2 [scrollbar-width:thin]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-2">
                {filtered.length} project{filtered.length === 1 ? "" : "s"}
              </p>
              {filtered.map((p, i) => {
                const isActive = i === activeIdx;
                return (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`group relative w-full text-left rounded-2xl border p-4 transition-smooth ${
                      isActive
                        ? "border-primary/50 bg-primary/5 shadow-glow"
                        : "border-border/40 bg-card/40 hover:border-primary/30 hover:bg-card/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {p.company}
                      </span>
                      {p.featured && (
                        <Star className="h-3 w-3 fill-primary text-primary" />
                      )}
                    </div>
                    <h3
                      className={`font-semibold tracking-tight text-sm md:text-base leading-snug ${
                        isActive
                          ? "text-primary"
                          : "text-foreground group-hover:text-primary"
                      } transition-colors`}
                    >
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {p.year}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          isActive
                            ? "text-primary translate-x-0.5"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* RIGHT — detail */}
            {active && (
              <article
                key={active.title}
                id={`project-${slugify(active.title)}`}
                className="relative rounded-3xl glass overflow-hidden scroll-mt-28 target:ring-2 target:ring-primary/60 animate-fade-up"
              >
                {/* Decorative gradient */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-accent/15 blur-3xl"
                />

                {/* Featured ribbon */}
                {active.featured && (
                  <div className="absolute top-6 right-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary px-3 py-1 text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                )}

                <div className="relative p-8 md:p-10 flex flex-col h-full">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {active.company && (
                      <button
                        type="button"
                        onClick={() => scrollToCompany(active.company!)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-primary/50 hover:text-primary transition-smooth"
                      >
                        <Briefcase className="h-3 w-3" />
                        {active.company}
                      </button>
                    )}
                    {active.year && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {active.year}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h3 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
                      {active.title}
                    </h3>
                    {(active.githubUrl || active.demoUrl) && (
                      <a
                        href={active.demoUrl ?? active.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${active.title}`}
                        className="rounded-full p-2.5 border border-border/40 text-muted-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-smooth shrink-0"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[15px] md:text-base text-muted-foreground leading-relaxed mb-6">
                    {active.description}
                  </p>

                  {/* Role / Team / Duration row */}
                  {(active.role || active.team || active.duration) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      {active.role && (
                        <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Target className="h-3 w-3 text-primary" />
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              Role
                            </span>
                          </div>
                          <p className="text-sm font-medium">{active.role}</p>
                        </div>
                      )}
                      {active.team && (
                        <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users className="h-3 w-3 text-primary" />
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              Team
                            </span>
                          </div>
                          <p className="text-sm font-medium">{active.team}</p>
                        </div>
                      )}
                      {active.duration && (
                        <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Hash className="h-3 w-3 text-primary" />
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              Duration
                            </span>
                          </div>
                          <p className="text-sm font-medium">{active.duration}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Highlights */}
                  {active.highlights && active.highlights.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Key Outcomes
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {active.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-start gap-2 text-sm text-foreground/85"
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metrics */}
                  {active.metrics && active.metrics.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {active.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"
                        >
                          <p className="text-xl md:text-2xl font-bold gradient-text">
                            {m.value}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                            {m.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stack */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Tech Stack
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {active.techStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="font-mono text-xs bg-secondary/50 border border-border/40 px-2.5 py-1"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  {(active.githubUrl || active.demoUrl) && (
                    <div className="flex gap-3 mt-auto pt-6 border-t border-border/40">
                      {active.githubUrl && (
                        <a
                          href={active.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-smooth"
                        >
                          <Github className="h-4 w-4" />
                          View Code
                        </a>
                      )}
                      {active.demoUrl && (
                        <a
                          href={active.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/25 transition-smooth"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
