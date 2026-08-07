import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow, SectionTitle } from "@/components/site/Section";
import { FEATURES } from "@/lib/content";
import { WHATSAPP_URL } from "@/lib/site";

const title = "Features — Glinkit Digital Business Cards";
const description =
  "Click-to-call, WhatsApp, payments, catalogue, galleries, enquiry forms and live updates: everything included in a Glinkit digital business card.";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <Section>
      <Eyebrow>Features</Eyebrow>
      <SectionTitle lead="Every Glinkit card ships with the full toolkit — no add-on modules, no upsells.">
        Everything your card can do
      </SectionTitle>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.title} className="surface-panel reveal rounded-2xl p-5">
            <h3 className="font-display text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <Button variant="gold" size="xl" asChild>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Request a live demo
          </a>
        </Button>
      </div>
    </Section>
  );
}