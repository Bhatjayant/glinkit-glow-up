import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, Eyebrow, SectionTitle } from "@/components/site/Section";
import { EMAIL, PHONE, PHONE_DISPLAY } from "@/lib/site";

const title = "Contact Glinkit — Get Your Digital Card Demo";
const description =
  "Call, WhatsApp or email Glinkit to see a live digital business card demo, get pricing for your team, or ask about franchise options.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const waLink = `https://wa.me/918808748088?text=${encodeURIComponent(
    `Hi Glinkit, I'm ${name || "[name]"}${company ? ` from ${company}` : ""}. ${
      message || "I'd like a demo of the digital business card."
    }`,
  )}`;

  return (
    <Section>
      <Eyebrow>Contact</Eyebrow>
      <SectionTitle lead="Every enquiry gets a reply the same working day. WhatsApp is fastest.">
        Let's get your card live
      </SectionTitle>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-3">
          <a
            href={`tel:${PHONE}`}
            className="surface-panel flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-primary/40"
          >
            <Phone className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Call us</span>
              <span className="block truncate font-display font-semibold">{PHONE_DISPLAY}</span>
            </span>
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="surface-panel flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-primary/40"
          >
            <Mail className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Email</span>
              <span className="block truncate font-display font-semibold">{EMAIL}</span>
            </span>
          </a>
          <div className="surface-panel flex items-center gap-4 rounded-2xl p-5">
            <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">WhatsApp</span>
              <span className="block font-display font-semibold">Fastest response</span>
            </span>
          </div>
        </div>

        <form
          className="surface-panel rounded-3xl p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            window.open(waLink, "_blank", "noopener");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ananya Sharma"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Pvt Ltd"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="message">What do you need?</Label>
            <Textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We need 25 cards for our sales team."
            />
          </div>
          <Button type="submit" variant="gold" size="xl" className="mt-6 w-full sm:w-auto">
            Send on WhatsApp
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            This opens WhatsApp with your message ready to send — nothing is stored on this site.
          </p>
        </form>
      </div>
    </Section>
  );
}