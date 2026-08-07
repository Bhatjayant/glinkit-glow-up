import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Phone, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow, SectionTitle } from "@/components/site/Section";
import { AUDIENCES, FEATURES, STEPS } from "@/lib/content";
import { PHONE, PHONE_DISPLAY, WHATSAPP_URL } from "@/lib/site";
import heroCard from "@/assets/hero-card.jpg";

const title = "Glinkit — Smart Digital Business Cards for Teams";
const description =
  "Glinkit builds elegant digital business cards for corporates and startups: one tap to call, WhatsApp, pay or save contact. Unlimited sharing, instant updates.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      {/* Hero */}
      <div className="glow-emerald border-b border-border/70">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <QrCode className="h-3.5 w-3.5" /> Trusted by teams across India
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Your first impression,{" "}
              <span className="text-gold-gradient">engineered to convert</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Glinkit turns your business card into a living profile — call, WhatsApp, navigate,
              pay and capture leads in one tap. Built for corporates rolling out to teams and
              startups that need to look established today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="gold" size="xl" asChild>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  Create your card
                </a>
              </Button>
              <Button variant="goldOutline" size="xl" asChild>
                <a href={`tel:${PHONE}`}>
                  <Phone /> {PHONE_DISPLAY}
                </a>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                ["2 min", "to go live"],
                ["0", "reprints needed"],
                ["∞", "shares & updates"],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="font-display text-2xl font-bold text-primary">{k}</dt>
                  <dd className="text-xs text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl" />
            <img
              src={heroCard}
              alt="A digital business card open on a smartphone showing call, email and save-contact actions"
              width={1200}
              height={1408}
              className="relative mx-auto w-full max-w-md rounded-3xl border border-primary/20 object-cover shadow-[var(--shadow-elegant)]"
            />
          </div>
        </div>
      </div>

      {/* Feature card grid */}
      <Section>
        <Eyebrow>Features</Eyebrow>
        <SectionTitle lead="One card, every action your contact might want to take — and nothing they have to type.">
          Endless possibilities, one link
        </SectionTitle>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.slice(0, 9).map((f) => (
            <article key={f.title} className="surface-panel rounded-2xl p-5">
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <Button variant="subtle" asChild>
            <Link to="/features">See all features</Link>
          </Button>
        </div>
      </Section>

      {/* Audiences */}
      <Section className="pt-0">
        <div className="grid gap-4 lg:grid-cols-2">
          {AUDIENCES.map((a) => (
            <article key={a.title} className="surface-panel rounded-3xl p-7">
              <h3 className="font-display text-xl font-bold">{a.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{a.desc}</p>
              <ul className="mt-5 space-y-2">
                {a.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <div className="border-y border-border/70 bg-surface">
        <Section>
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle lead="No app to install, no design skills needed. We do the setup, you do the sharing.">
            Live in three steps
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.n} className="rounded-2xl border border-border p-6">
                <span className="font-display text-3xl font-bold text-primary/70">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </article>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA */}
      <Section>
        <div className="surface-panel flex flex-col items-start gap-6 rounded-3xl p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to retire the paper card?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Talk to us on WhatsApp and see a live demo card in minutes. Franchise and reseller
              options available.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="gold" size="xl" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Get a free demo
              </a>
            </Button>
            <Button variant="goldOutline" size="xl" asChild>
              <Link to="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
