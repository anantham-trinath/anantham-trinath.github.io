import { Code, Database, Cloud, Cog, Layers, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import profile from "@/data/profile";
import type { TechStackIcon } from "@/data/profile";

const ICONS: Record<TechStackIcon, LucideIcon> = {
  Code,
  Layers,
  Database,
  Cloud,
  Cog,
  Monitor,
};

const TechStackSection = () => {
  const { techStacks, personal } = profile;

  return (
    <section
      id="tech-stack"
      className="relative py-24 overflow-hidden border-y border-border/40"
    >
      <div className="absolute inset-0 grid-bg grid-bg-fade pointer-events-none" />
      <div className="container relative mx-auto px-6">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">The Toolbox</p>
          <h2 className="section-heading mb-4">Technical Expertise</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {personal.yearsExperience} years across backend, frontend, cloud,
            and AI. Specialized in scalable systems and engineering leadership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {techStacks.map((stack) => {
            const Icon = ICONS[stack.icon] ?? Code;
            return (
              <div
                key={stack.category}
                className="group rounded-2xl glass p-5 hover-lift relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-primary/10 text-primary p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-sm tracking-tight">
                      {stack.category}
                    </h3>
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {stack.technologies.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-md border border-border/60 bg-secondary/40 px-2 py-1 text-[11px] font-mono text-muted-foreground hover:border-primary/40 hover:text-foreground transition-smooth"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
