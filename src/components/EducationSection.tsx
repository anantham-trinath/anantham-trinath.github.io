import { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import profile from "@/data/profile";
import type { WorkExperience, Project } from "@/data/profile";
import { slugify } from "@/lib/slug";

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const parseMonthYear = (s: string): { y: number; m: number } | null => {
  const trimmed = s.trim();
  if (/present|now/i.test(trimmed)) {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  }
  const monYear = trimmed.match(/^([A-Za-z]{3,})\.?\s+(\d{4})$/);
  if (monYear) {
    const m = MONTHS[monYear[1].slice(0, 3).toLowerCase()];
    if (m) return { y: parseInt(monYear[2], 10), m };
  }
  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) return { y: parseInt(yearOnly[1], 10), m: 1 };
  return null;
};

const splitPeriod = (period: string): { start: string; end: string } => {
  const [start, end] = period.split(/—|–|-/).map((p) => p.trim());
  return { start, end: end || start };
};

const diffYM = (start: string, end: string): string => {
  const s = parseMonthYear(start);
  const e = parseMonthYear(end);
  if (!s || !e) return "";
  let months = (e.y - s.y) * 12 + (e.m - s.m) + 1;
  if (months < 1) months = 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
  if (mos > 0) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
  return parts.join(" ");
};

interface CompanyGroup {
  company: string;
  logo?: string;
  location: string;
  start: string;
  end: string;
  tenure: string;
  current: boolean;
  roles: WorkExperience[];
}

const groupByCompany = (items: WorkExperience[]): CompanyGroup[] => {
  const groups: CompanyGroup[] = [];
  items.forEach((item) => {
    const { start, end } = splitPeriod(item.period);
    const last = groups[groups.length - 1];
    if (last && last.company === item.company) {
      last.roles.push(item);
      last.start = start;
      if (item.current) last.current = true;
    } else {
      groups.push({
        company: item.company,
        logo: item.companyLogo,
        location: item.location,
        start,
        end,
        tenure: "",
        current: !!item.current,
        roles: [item],
      });
    }
  });
  groups.forEach((g) => {
    g.tenure = diffYM(g.start, g.end);
  });
  return groups;
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <div className="text-center mb-14">
    <p className="eyebrow mb-3">{eyebrow}</p>
    <h2 className="section-heading mb-4">{title}</h2>
    {description && (
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    )}
  </div>
);

const companyInitials = (name: string): string =>
  name
    .replace(/\.com$/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const CompanyLogo = ({
  src,
  name,
}: {
  src?: string;
  name: string;
}) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-background shadow-soft font-mono text-xs font-semibold text-primary">
        {companyInitials(name)}
      </span>
    );
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-background shadow-soft overflow-hidden">
      <img
        src={src}
        alt={`${name} logo`}
        className="h-9 w-9 object-contain"
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </span>
  );
};

const scrollToProject = (title: string) => {
  const id = `project-${slugify(title)}`;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-primary/60");
    window.setTimeout(
      () => el.classList.remove("ring-2", "ring-primary/60"),
      1800
    );
  }
};

const matchByCompany = (
  projects: Project[],
  company: string
): Project[] => {
  const norm = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "").replace(/\.com$/, "");
  return projects.filter((p) => p.company && norm(p.company) === norm(company));
};

const EducationSection = () => {
  const { workExperience, education, certifications, personal, projects } =
    profile;
  const companyGroups = groupByCompany(workExperience);

  return (
    <section id="education" className="relative py-24 bg-background overflow-hidden">
      <div className="absolute inset-0 grid-bg grid-bg-fade opacity-50 pointer-events-none" />
      <div className="container relative mx-auto px-6">
        <SectionHeading
          eyebrow="The Journey"
          title="Experience & Education"
          description={`${personal.yearsExperience} years building scalable systems and leading high-performing engineering teams.`}
        />

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="font-mono uppercase text-sm tracking-wider text-muted-foreground">
              Work Experience
            </h3>
            <span className="ml-auto h-px flex-1 bg-border" />
          </div>

          <ol className="relative space-y-8 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-primary/60 before:via-border before:to-transparent">
            {companyGroups.map((group, gi) => {
              const companyProjects = matchByCompany(projects, group.company);
              return (
              <li key={`${group.company}-${gi}`} className="relative pl-16">
                <span className="absolute left-0 top-1">
                  <CompanyLogo src={group.logo} name={group.company} />
                </span>

                <div
                  id={`company-${slugify(group.company)}`}
                  className="rounded-2xl glass overflow-hidden scroll-mt-28 transition-shadow"
                >
                  {/* Company header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-b border-border/40 bg-secondary/20">
                    <div>
                      <h4 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        {group.company}
                        {group.current && (
                          <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                            Now
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {group.location}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="font-mono">
                          {group.roles.length} role{group.roles.length > 1 ? "s" : ""}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs text-muted-foreground">
                        {group.start} — {group.end}
                      </p>
                      {group.tenure && (
                        <p className="font-mono text-[11px] text-primary mt-0.5">
                          {group.tenure}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Roles within company */}
                  <ol className="relative px-6 py-5 space-y-5 before:absolute before:left-[30px] before:top-6 before:bottom-6 before:w-px before:bg-border/60">
                    {group.roles.map((role, ri) => {
                      const isLast = ri === group.roles.length - 1;
                      return (
                        <li key={ri} className="relative pl-10 group/role">
                          <span className="absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-primary/60 bg-background">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary group-hover/role:scale-150 transition-transform" />
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                            <h5 className="font-semibold tracking-tight">
                              {role.title}
                            </h5>
                            <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                              {role.period}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {role.description}
                          </p>
                          <ul className="space-y-1 mb-3">
                            {role.achievements.map((a, ai) => (
                              <li
                                key={ai}
                                className="flex items-start gap-2 text-sm text-foreground/80"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-1.5">
                            {role.stack.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="font-mono text-[11px] bg-secondary/60"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                          {!isLast && (
                            <div className="mt-5 h-px bg-border/30" />
                          )}
                        </li>
                      );
                    })}
                  </ol>

                  {companyProjects.length > 0 && (
                    <div className="px-6 pb-5">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                        Related Work
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {companyProjects.map((p) => (
                          <button
                            key={p.title}
                            type="button"
                            onClick={() => scrollToProject(p.title)}
                            className="group/proj inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-smooth"
                          >
                            {p.title}
                            <ArrowUpRight className="h-3 w-3 group-hover/proj:-translate-y-0.5 group-hover/proj:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
              );
            })}
          </ol>

          {/* Education */}
          <div className="mt-20">
            <div className="flex items-center gap-2 mb-8">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="font-mono uppercase text-sm tracking-wider text-muted-foreground">
                Education
              </h3>
              <span className="ml-auto h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-4">
              {education.map((edu, i) => (
                <div key={i} className="rounded-2xl glass p-6 hover-lift">
                  <h4 className="text-lg font-semibold">{edu.degree}</h4>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-muted-foreground mt-1">
                    <span className="text-primary font-medium">
                      {edu.institution}
                    </span>
                    <span className="font-mono">{edu.year}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {edu.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-20">
            <div className="flex items-center gap-2 mb-8">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-mono uppercase text-sm tracking-wider text-muted-foreground">
                Certifications
              </h3>
              <span className="ml-auto h-px flex-1 bg-border" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certifications.map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl glass p-5 hover-lift flex items-start gap-3"
                >
                  <div className="rounded-lg bg-primary/10 text-primary p-2">
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm leading-snug">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {c.issuer} · {c.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
