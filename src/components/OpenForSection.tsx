import {
  Briefcase,
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  Compass,
  Sparkles,
  Network,
  Users,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import profile from "@/data/profile";
import type { OpenForIcon } from "@/data/profile";

const ICONS: Record<OpenForIcon, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  Compass,
  Sparkles,
  Network,
  Users,
};

const OpenForSection = () => {
  const { openFor, personal } = profile;

  if (!openFor?.length) return null;

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="open-for"
      className="relative py-20 md:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg grid-bg-fade pointer-events-none opacity-40" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/10 blur-[140px] pointer-events-none"
        aria-hidden
      />

      <div className="container relative mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="pill mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-pulse-dot" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Available for engagements
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-4">
            Open For <span className="gradient-text">Freelance & Advisory</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Bring me in for short engagements, system design support, architectural
            decisions, scalability reviews, or fractional engineering leadership.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {openFor.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div
                key={item.title}
                className="group relative rounded-2xl glass p-5 shadow-soft transition-smooth hover:shadow-glow hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-3 group-hover:bg-primary/20 transition-smooth">
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
                <h3 className="text-base font-semibold tracking-tight mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="group shadow-glow"
            onClick={() => scrollTo("#contact")}
          >
            Start a conversation
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" asChild className="border-border/80">
            <a href={`mailto:${personal.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              {personal.email}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OpenForSection;
