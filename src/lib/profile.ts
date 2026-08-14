import type { Card, Media, Product } from "@/lib/cards";
import { externalUrl, mapsUrl, waLink } from "@/lib/cards";

export const PROFILE_TYPES = [
  {
    value: "personal",
    label: "Personal",
    hint: "Friends, networking, everyday sharing",
    cta: "whatsapp",
    sections: ["About", "Links", "Gallery"],
  },
  {
    value: "professional",
    label: "Professional",
    hint: "Consultants, doctors, advisors, executives",
    cta: "meeting",
    sections: ["Headline", "What I do", "Booking", "Links"],
  },
  {
    value: "business",
    label: "Business",
    hint: "Companies, agencies, showrooms",
    cta: "quote",
    sections: ["What I do", "Products", "Brochures", "Location"],
  },
  {
    value: "sales",
    label: "Sales",
    hint: "Field sales, distribution, channel teams",
    cta: "distributor",
    sections: ["Products", "Offers", "WhatsApp", "Leads"],
  },
  {
    value: "creator",
    label: "Creator",
    hint: "Designers, coaches, artists, influencers",
    cta: "contact",
    sections: ["Gallery", "Videos", "Links", "What I do"],
  },
] as const;

export type ProfileType = (typeof PROFILE_TYPES)[number]["value"];

export const profileType = (value: string | null | undefined) =>
  PROFILE_TYPES.find((p) => p.value === value) ?? PROFILE_TYPES[1];

export const CTA_OPTIONS = [
  { value: "contact", label: "Contact me", channel: "contact" },
  { value: "whatsapp", label: "WhatsApp me", channel: "whatsapp" },
  { value: "meeting", label: "Book a meeting", channel: "booking" },
  { value: "quote", label: "Request a quote", channel: "connect" },
  { value: "buy", label: "Buy now", channel: "products" },
  { value: "distributor", label: "Become a distributor", channel: "connect" },
  { value: "partner", label: "Partner with me", channel: "connect" },
  { value: "invest", label: "Invest", channel: "connect" },
  { value: "visit", label: "Visit my business", channel: "maps" },
  { value: "custom", label: "Custom link", channel: "custom" },
] as const;

export type CtaOption = (typeof CTA_OPTIONS)[number];

export const ctaOption = (value: string | null | undefined) =>
  CTA_OPTIONS.find((c) => c.value === value) ?? CTA_OPTIONS[1];

export type ResolvedCta = {
  label: string;
  /** How the button behaves: an outbound link, or an in-page action. */
  kind: "link" | "connect" | "booking" | "products";
  href?: string;
  /** analytics label */
  event: string;
};

/** Turns the owner's chosen objective into one prominent, always-working button. */
export function resolveCta(card: Card): ResolvedCta {
  const option = ctaOption(card.primary_cta);
  const label = card.primary_cta_label?.trim() || option.label;
  const first = card.display_name.split(" ")[0] || card.display_name;
  const message = `Hi ${first}, I found your Glinkit profile.`;

  const whatsapp = card.whatsapp ? waLink(card.whatsapp, message) : null;
  const mailto = card.email
    ? `mailto:${card.email}?subject=${encodeURIComponent(label)}`
    : null;
  const tel = card.phone ? `tel:${card.phone}` : null;

  switch (option.channel) {
    case "custom":
      {
        const href = externalUrl(card.primary_cta_url);
        if (href) return { label, kind: "link", href, event: "cta_custom" };
      }
      break;
    case "whatsapp":
      if (whatsapp) return { label, kind: "link", href: whatsapp, event: "whatsapp" };
      break;
    case "booking":
      if (card.booking_enabled) return { label, kind: "booking", event: "cta_booking" };
      break;
    case "products":
      return { label, kind: "products", event: "cta_products" };
    case "maps":
      {
        const href = mapsUrl(card);
        if (href) return { label, kind: "link", href, event: "cta_maps" };
      }
      break;
    case "contact":
      if (whatsapp) return { label, kind: "link", href: whatsapp, event: "whatsapp" };
      if (tel) return { label, kind: "link", href: tel, event: "call" };
      if (mailto) return { label, kind: "link", href: mailto, event: "email" };
      break;
    default:
      break;
  }
  // Connect is the safe, always-available fallback — it never dead-ends.
  return { label, kind: "connect", event: "cta_connect" };
}

export type CompletionTier = "essential" | "recommended" | "optional";
export type CompletionItem = {
  label: string;
  done: boolean;
  hint: string;
  tier: CompletionTier;
};

export function profileCompletion(
  card: Card,
  extras: { services?: { id: string }[]; products?: Product[]; media?: Media[] } = {},
) {
  const services = extras.services ?? [];
  const products = extras.products ?? [];
  const media = extras.media ?? [];
  const items: CompletionItem[] = [
    // Essential — everything needed for a profile that works.
    { tier: "essential", label: "Photo or logo", done: Boolean(card.photo_url?.trim() || card.logo_url?.trim()), hint: "A face or a logo makes the first screen trustworthy." },
    { tier: "essential", label: "Name", done: Boolean(card.display_name?.trim()), hint: "Say who you are." },
    { tier: "essential", label: "Designation or company", done: Boolean(card.job_title?.trim() || card.company?.trim()), hint: "One line of professional context." },
    { tier: "essential", label: "A way to reach you", done: Boolean(card.whatsapp?.trim() || card.phone?.trim() || card.email?.trim()), hint: "Add WhatsApp, phone or email." },
    { tier: "essential", label: "Primary action", done: Boolean(card.primary_cta?.trim()), hint: "Pick the one thing you want visitors to do." },
    // Recommended — makes the profile persuasive.
    { tier: "recommended", label: "Headline & short intro", done: Boolean(card.headline?.trim() && (card.short_bio?.trim() || card.about?.trim())), hint: "Visitors decide in five seconds." },
    { tier: "recommended", label: "Services or products", done: services.length > 0 || products.length > 0, hint: "Show what people can buy or enquire about." },
    { tier: "recommended", label: "Website & social links", done: media.some((m) => m.kind === "link") || Boolean(card.website?.trim()), hint: "Link your website and social profiles." },
    { tier: "recommended", label: "Meeting slots", done: Boolean(card.booking_enabled), hint: "Let interested visitors book you without messaging first." },
    // Optional — nice to have, never a problem when missing.
    { tier: "optional", label: "Gallery or videos", done: media.some((m) => m.kind === "image" || m.kind === "youtube"), hint: "Show your work." },
    { tier: "optional", label: "Brochures", done: media.some((m) => m.kind === "pdf"), hint: "Share a PDF visitors can download." },
    { tier: "optional", label: "Payments", done: Boolean(card.upi_id?.trim() || card.bank_details?.trim()), hint: "Accept payments straight from your profile." },
  ];
  const essential = items.filter((i) => i.tier === "essential");
  const recommended = items.filter((i) => i.tier === "recommended");
  const optional = items.filter((i) => i.tier === "optional");
  // Percent is honest: only essential + recommended count towards "ready".
  const scored = [...essential, ...recommended];
  const done = scored.filter((i) => i.done).length;
  return {
    items,
    essential,
    recommended,
    optional,
    readyToPublish: essential.every((i) => i.done),
    essentialPending: essential.filter((i) => !i.done),
    percent: Math.round((done / scored.length) * 100),
    pending: [...essential, ...recommended].filter((i) => !i.done),
  };
}
