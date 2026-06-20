import { Github, Linkedin, Mail, Globe, ArrowUp } from "lucide-react";
import profile from "@/data/profile";

const Footer = () => {
  const { personal, socials, navigation } = profile;
  const year = new Date().getFullYear();

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative border-t border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-mono text-sm">
                TA
              </span>
              <span className="font-semibold">{personal.name}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {personal.shortBio}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Navigate
            </h4>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Connect
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${personal.email}`}
                  className="text-muted-foreground hover:text-primary transition-smooth inline-flex items-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {personal.email}
                </a>
              </li>
              <li>
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth inline-flex items-center gap-2"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth inline-flex items-center gap-2"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth inline-flex items-center gap-2"
                >
                  <Globe className="h-3.5 w-3.5" />
                  anantham-trinath.github.io
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/40">
          <p className="text-xs font-mono text-muted-foreground">
            © {year} {personal.name}. Crafted with care.
          </p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-smooth"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
