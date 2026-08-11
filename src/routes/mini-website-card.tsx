import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Globe, QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow, SectionTitle } from "@/components/site/Section";
import { MINI_SITE_SECTIONS, MINI_SITE_VS } from "@/lib/content";
import { WHATSAPP_URL } from "@/lib/site";

const title = "Digital Visiting Card & Mini Website — Glinkit";
const description =
  "A Glinkit digital visiting card is a full mini website: about, services, catalogue, gallery, brochures, payments and an enquiry form on one shareable link or QR.";

export const Route = createFileRoute("/mini-website-card")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: MiniWebsitePage,
});

function MiniWebsitePage() {
  return (
    <>
      <div className="glow-emerald border-b border-border/70">
        <Section className="py-14 sm:py-20">
          <Eyebrow>Digital visiting card</Eyebrow>
          <h1 className="max-w-3xl text-3xl font-bold sm:text-5xl">
            A visiting card that works like a <span className="text-gold-gradient">mini website</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Most people call it a digital visiting card. What you actually get is a small,
            fast website for your business — with your brand, your catalogue, your payment
            details and a lead form — all behind one link or QR code.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" size="xl" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Get my mini website card
              </a>
            </Button>
            <Button variant="goldOutline" size="xl" asChild>
              <Link to="/pricing">View pricing</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Smartphone, t: "No app to install", d: "Opens instantly in any browser." },
              { icon: QrCode, d: "Share by QR, link or NFC tap.", t: "Share anywhere" },
              { icon: Globe, t: "Your own web address", d: "A clean glinkit link for your name." },
            ].map(({ icon: Icon, t, d }) => (
              <article key={t} className="surface-panel reveal rounded-2xl p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-display text-base font-semibold">{t}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </article>
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <Eyebrow>What's inside</Eyebrow>
        <SectionTitle lead="Every card is built in sections, just like a website — scroll through your whole business in one place.">
          The pages of your mini website
        </SectionTitle>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MINI_SITE_SECTIONS.map((s) => (
            <article key={s.title} className="surface-panel reveal rounded-2xl p-5">
              <h3 className="font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      <div className="border-y border-border/70 bg-surface">
        <Section>
          <Eyebrow>Compare</Eyebrow>
          <SectionTitle lead="You get most of what a small business website does, without the cost or the wait.">
            Mini website card vs a full website
          </SectionTitle>
          <div className="reveal mt-8 overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-3 gap-4 border-b border-border bg-background/40 p-4 text-xs font-semibold tracking-wide uppercase">
              <span className="text-muted-foreground">&nbsp;</span>
              <span className="text-primary">Glinkit card</span>
              <span className="text-muted-foreground">Traditional website</span>
            </div>
            {MINI_SITE_VS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-3 gap-4 border-b border-border/60 p-4 text-sm last:border-0"
              >
                <span className="font-medium">{row.label}</span>
                <span className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{row.card}</span>
                </span>
                <span className="text-muted-foreground">{row.site}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <div className="surface-panel reveal flex flex-col items-start gap-6 rounded-3xl p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Want to see a sample card?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Message us on WhatsApp and we'll send a live mini website card you can open and
              tap through — plus 3 months free for new customers.
            </p>
          </div>
          <Button variant="gold" size="xl" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              See a live sample
            </a>
          </Button>
        </div>
      </Section>
    </>
  );
}