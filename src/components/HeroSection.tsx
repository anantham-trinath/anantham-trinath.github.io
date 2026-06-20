import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import profile from "@/data/profile";

const HeroSection = () => {
  const { personal, socials, stats, highlights, marquee } = profile;

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16"
    >
      <div className="absolute inset-0 grid-bg grid-bg-fade pointer-events-none" />
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div
        className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-blob pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-[140px] animate-blob pointer-events-none"
        style={{ animationDelay: "4s" }}
        aria-hidden
      />

      <div className="container relative mx-auto px-6">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div className="space-y-8 animate-fade-up">
            <span className="pill">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-pulse-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {personal.availability}
            </span>

            <div className="space-y-4">
              <p className="eyebrow">Hi, I'm</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]">
                {personal.firstName}{" "}
                <span className="gradient-text">Anantham</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                {personal.title}
              </p>
              <p className="font-mono text-sm text-primary">{personal.tagline}</p>
            </div>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {personal.shortBio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {personal.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                <span className="font-mono">{personal.timezone}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                Currently @ {personal.currentlyAt}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="group shadow-glow"
                onClick={() => scrollTo("#projects")}
              >
                Explore Work
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" asChild className="border-border/80">
                <a
                  href={personal.resumeUrl}
                  download="Trinath-Anantham-Resume.pdf"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Resume
                </a>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => scrollTo("#contact")}
              >
                Get in touch
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                <Github size={20} />
              </a>
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={`mailto:${personal.email}`}
                aria-label="Email"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* RIGHT — avatar + highlights card */}
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative mx-auto w-fit">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-primary/40 via-accent/30 to-transparent blur-2xl" />
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border border-border/60 shadow-glow">
                <img
                  src={personal.avatar}
                  alt={personal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/95 backdrop-blur px-3 py-1.5 text-xs font-medium shadow-soft">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                Available for opportunities
              </div>
            </div>

            <div className="mt-10 rounded-2xl glass p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="eyebrow">Highlights</span>
              </div>
              <ul className="space-y-2">
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl glass overflow-hidden">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-6 bg-card/40 hover:bg-card/80 transition-smooth"
            >
              <div className="text-3xl md:text-4xl font-bold tracking-tight">
                {s.value}
                <span className="gradient-text">{s.suffix}</span>
              </div>
              <p className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 right-0 border-y border-border/40 bg-background/60 backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...marquee, ...marquee].map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70"
            >
              {tag}
              <span className="ml-12 text-primary/40">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
