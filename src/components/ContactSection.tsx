import { useState } from "react";
import { Mail, Github, Linkedin, MapPin, Phone, Globe, ArrowUpRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import profile from "@/data/profile";

const ContactSection = () => {
  const { personal, socials } = profile;

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.subject || "Hello from your website");
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name}${form.email ? ` <${form.email}>` : ""}`
    );
    window.location.href = `mailto:${personal.email}?subject=${subject}&body=${body}`;
  };

  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: personal.email,
      href: `mailto:${personal.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: personal.phone,
      href: `tel:${personal.phone.replace(/\s+/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: personal.location,
    },
  ];

  const socialItems = [
    { icon: Github, label: "GitHub", href: socials.github },
    { icon: Linkedin, label: "LinkedIn", href: socials.linkedin },
    { icon: Globe, label: "Website", href: socials.website },
  ];

  return (
    <section
      id="contact"
      className="relative py-24 overflow-hidden border-t border-border/40"
    >
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 grid-bg grid-bg-fade opacity-50 pointer-events-none" />

      <div className="container relative mx-auto px-6">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Get in Touch</p>
          <h2 className="section-heading mb-4">
            Let's build something <span className="gradient-text">great</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Open to engineering leadership, advisory, and consulting work.
            Always happy to chat about scaling teams, system design, or
            developer experience.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Info side */}
          <div className="space-y-4">
            <div className="rounded-2xl glass p-6">
              <h3 className="text-lg font-semibold mb-1">Direct contact</h3>
              <p className="text-sm text-muted-foreground mb-6">
                The fastest way to reach me.
              </p>
              <div className="space-y-4">
                {contactItems.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 text-primary p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-sm font-medium truncate">{value}</p>
                      </div>
                      {href && (
                        <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                  return href ? (
                    <a
                      key={label}
                      href={href}
                      className="block rounded-xl border border-border/40 bg-secondary/30 p-3 hover:border-primary/40 hover:bg-secondary/60 transition-smooth"
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      key={label}
                      className="block rounded-xl border border-border/40 bg-secondary/30 p-3"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl glass p-6">
              <h3 className="text-lg font-semibold mb-4">On the web</h3>
              <div className="grid grid-cols-3 gap-2">
                {socialItems.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-secondary/30 py-4 hover:border-primary/40 hover:text-primary transition-smooth"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl glass p-6 lg:p-8">
            <h3 className="text-lg font-semibold mb-1">Send a message</h3>
            <p className="text-sm text-muted-foreground mb-6">
              I'll get back to you within 24 hours.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Your name"
                  required
                  className="bg-background/40"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  required
                  className="bg-background/40"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <Input
                placeholder="Subject"
                required
                className="bg-background/40"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <Textarea
                placeholder="Tell me about your project, role, or idea…"
                rows={6}
                required
                className="bg-background/40 resize-none"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <Button type="submit" size="lg" className="w-full group">
                <Send className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                Send message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
