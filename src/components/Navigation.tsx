import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import profile from "@/data/profile";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<string>("#home");
  const [scrolled, setScrolled] = useState(false);
  const { personal, navigation: navItems } = profile;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((n) => document.querySelector(n.href))
      .filter((el): el is Element => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [navItems]);

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        scrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => scrollToSection("#home")}
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-mono text-sm">
              TA
            </span>
            <span className="hidden sm:inline">{personal.name}</span>
          </button>

          <div className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-background/40 backdrop-blur px-1.5 py-1">
            {navItems.map((item) => {
              const isActive = active === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => scrollToSection("#contact")}
            >
              Hire Me
            </Button>
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-secondary/60"
              aria-label="Toggle menu"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-3 rounded-2xl glass p-3">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={`text-left rounded-lg px-3 py-2 text-sm transition-smooth ${
                    active === item.href
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
