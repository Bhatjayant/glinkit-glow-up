import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow, SectionTitle } from "@/components/site/Section";
import { PLAN_INCLUDES } from "@/lib/content";
import { WHATSAPP_URL } from "@/lib/site";

const title = "Pricing — Glinkit Digital Business Cards";
const description =
  "One affordable Glinkit plan with everything included, plus team rollouts for corporates and franchise options. Talk to us for current pricing.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <Section>
      <Eyebrow>Pricing</Eyebrow>
      <SectionTitle lead="One plan, everything included. Volume pricing for teams and franchise partners on request.">
        Affordable, plus more
      </SectionTitle>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="surface-panel rounded-3xl p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-xl font-bold">Glinkit Pro card</h3>
            <span className="rounded-full border border-primary/40 px-3 py-1 text-xs text-primary">
              Most popular
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Everything you need to replace printed cards for one professional — designed, published
            and supported by us.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {PLAN_INCLUDES.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Button variant="gold" size="xl" className="mt-8" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Get current pricing
            </a>
          </Button>
        </article>

        <div className="grid gap-4">
          <article className="surface-panel rounded-3xl p-7">
            <h3 className="font-display text-lg font-bold">Corporate rollout</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Brand-locked templates, bulk onboarding for your whole team and central control when
              roles or numbers change. Priced per seat.
            </p>
            <Button variant="goldOutline" className="mt-5" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Request a quote
              </a>
            </Button>
          </article>
          <article className="surface-panel rounded-3xl p-7">
            <h3 className="font-display text-lg font-bold">Franchise & reseller</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sell Glinkit cards in your city with our templates, dashboard and support behind you.
            </p>
            <Button variant="goldOutline" className="mt-5" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Talk on WhatsApp
              </a>
            </Button>
          </article>
        </div>
      </div>
    </Section>
  );
}