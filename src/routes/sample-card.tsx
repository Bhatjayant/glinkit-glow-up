import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Download,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHONE, PHONE_DISPLAY, EMAIL, WHATSAPP_URL } from "@/lib/site";
import wordmark from "@/assets/glinkit-logo.png.asset.json";

const title = "Sample Digital Visiting Card — Glinkit";
const description =
  "Tap through a live Glinkit digital visiting card: call, WhatsApp, email, directions, save contact, catalogue, payments and an enquiry form on one link.";

export const Route = createFileRoute("/sample-card")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SampleCardPage,
});

const PERSON = {
  name: "Aarav Deshpande",
  role: "Director — Sales & Partnerships",
  company: "Willpower Group Venture",
  city: "Pune, India",
  site: "www.glinkit.com",
};

const SERVICES = [
  { name: "Glinkit Pro card", price: "₹999 / year", desc: "Full mini website card with all sections." },
  { name: "Corporate rollout", price: "On request", desc: "Brand-locked cards for your whole team." },
  { name: "Franchise partnership", price: "On request", desc: "Sell Glinkit cards in your city." },
];

const VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  `FN:${PERSON.name}`,
  `TITLE:${PERSON.role}`,
  `ORG:${PERSON.company}`,
  `TEL;TYPE=CELL:${PHONE}`,
  `EMAIL:${EMAIL}`,
  `URL:https://${PERSON.site}`,
  "END:VCARD",
].join("\n");

function ActionTile({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href?: string;
  icon: typeof Phone;
  label: string;
  onClick?: () => void;
}) {
  const cls =
    "flex flex-col items-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-center text-xs font-medium transition-colors hover:border-primary/60 hover:bg-primary/10";
  const inner = (
    <>
      <Icon className="h-5 w-5 text-primary" />
      <span>{label}</span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  );
}

function SampleCardPage() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const saveContact = () => {
    const blob = new Blob([VCARD], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "glinkit-sample-contact.vcf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareCard = async () => {
    const link = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Glinkit sample card", url: link });
        return;
      } catch {
        /* dismissed */
      }
    }
    await navigator.clipboard?.writeText(link);
  };

  const enquiryUrl = `https://wa.me/918808748088?text=${encodeURIComponent(
    `Hi Glinkit, I'm ${name || "interested"}. ${msg || "Please share details about the digital visiting card."}`,
  )}`;

  return (
    <div className="glow-emerald">
      <div className="mx-auto max-w-md px-4 py-10">
        <p className="mb-4 text-center text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Sample card — this is what yours looks like
        </p>

        <div className="surface-panel overflow-hidden rounded-[2rem]">
          {/* Cover */}
          <div className="relative h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
            <img
              src={wordmark.url}
              alt="Glinkit"
              className="absolute top-4 left-5 h-7 w-auto rounded"
            />
          </div>

          {/* Identity */}
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 grid h-20 w-20 place-items-center rounded-2xl border border-primary/40 bg-background font-display text-2xl font-bold text-primary">
              AD
            </div>
            <h1 className="font-display text-2xl font-bold">{PERSON.name}</h1>
            <p className="mt-1 text-sm text-primary">{PERSON.role}</p>
            <p className="text-sm text-muted-foreground">{PERSON.company}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {PERSON.city}
            </p>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <ActionTile href={`tel:${PHONE}`} icon={Phone} label="Call" />
              <ActionTile href={WHATSAPP_URL} icon={MessageCircle} label="WhatsApp" />
              <ActionTile href={`mailto:${EMAIL}`} icon={Mail} label="Email" />
              <ActionTile
                href="https://maps.google.com/?q=Pune,India"
                icon={MapPin}
                label="Directions"
              />
              <ActionTile href={`https://${PERSON.site}`} icon={Globe} label="Website" />
              <ActionTile icon={Share2} label="Share" onClick={shareCard} />
            </div>

            <Button variant="gold" className="mt-4 w-full" onClick={saveContact}>
              <Download className="mr-2 h-4 w-4" /> Save to contacts
            </Button>

            {/* About */}
            <section className="mt-8">
              <h2 className="font-display text-sm font-semibold tracking-wide uppercase">About</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We help corporates and startups replace printed visiting cards with smart digital
                cards — one link that calls, chats, collects payments and captures leads.
              </p>
            </section>

            {/* Services */}
            <section className="mt-8">
              <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                Products & services
              </h2>
              <ul className="mt-3 space-y-3">
                {SERVICES.map((s) => (
                  <li key={s.name} className="rounded-2xl border border-border p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <span className="text-xs text-primary">{s.price}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Gallery */}
            <section className="mt-8">
              <h2 className="font-display text-sm font-semibold tracking-wide uppercase">Gallery</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl border border-border bg-gradient-to-br from-primary/20 to-transparent"
                  />
                ))}
              </div>
            </section>

            {/* Payments */}
            <section className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-4">
              <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                Payments
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <QrCode className="h-4 w-4 text-primary" /> UPI: glinkit@upi
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bank transfer details appear here on your card.
              </p>
            </section>

            {/* Ratings */}
            <section className="mt-8">
              <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                Ratings
              </h2>
              <div className="mt-2 flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">4.9 · 120 reviews</span>
              </div>
            </section>

            {/* Enquiry */}
            <section className="mt-8">
              <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                Send an enquiry
              </h2>
              <div className="mt-3 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                />
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={3}
                  placeholder="What do you need?"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                />
                <Button variant="gold" className="w-full" asChild>
                  <a href={enquiryUrl} target="_blank" rel="noreferrer">
                    Send on WhatsApp
                  </a>
                </Button>
              </div>
            </section>

            <p className="mt-8 text-center text-[11px] text-muted-foreground">
              Powered by Glinkit · Endless Opportunities
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button variant="goldOutline" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Get a card like this
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}