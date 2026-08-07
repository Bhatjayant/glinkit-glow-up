import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow, SectionTitle } from "@/components/site/Section";
import { STEPS } from "@/lib/content";
import { WHATSAPP_URL } from "@/lib/site";

const title = "About Glinkit — Freedom from Printed Business Cards";
const description =
  "Glinkit designs smart, elegant and affordable digital visiting cards that never tear, never run out and update instantly from your dashboard.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <Section>
        <Eyebrow>About us</Eyebrow>
        <SectionTitle lead="A printed card is out of date the moment your role, number or brand changes. Glinkit isn't.">
          Freedom from boring printed cards
        </SectionTitle>
        <div className="mt-8 grid gap-6 text-sm leading-relaxed text-muted-foreground lg:grid-cols-2">
          <p>
            Glinkit gives every professional a digital visiting card that lives in their pocket. It
            never tears, never runs out and is always the latest version — update it from your
            dashboard and every link you have ever shared updates with it.
          </p>
          <p>
            We work with corporates standardising cards across departments and with startups that
            need an investor-ready presence overnight. Setup is done for you: send your details on
            WhatsApp, pick a template, and your card goes live the same day.
          </p>
        </div>
      </Section>

      <div className="border-y border-border/70 bg-surface">
        <Section>
          <SectionTitle>How we onboard you</SectionTitle>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.n} className="reveal rounded-2xl border border-border p-6">
                <span className="font-display text-3xl font-bold text-primary/70">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </article>
            ))}
          </div>
          <Button variant="gold" size="xl" className="mt-10" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Start on WhatsApp
            </a>
          </Button>
        </Section>
      </div>
    </>
  );
}