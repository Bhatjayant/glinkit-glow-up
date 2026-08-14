import type { Card, Media, Product } from "@/lib/cards";
import { waLink } from "@/lib/cards";

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
      if (card.primary_cta_url?.trim())
        return { label, kind: "link", href: card.primary_cta_url.trim(), event: "cta_custom" };
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
      if (card.maps_url || card.address)
        return {
          label,
          kind: "link",
          href:
            card.maps_url ??
            `https://maps.google.com/?q=${encodeURIComponent(card.address ?? "")}`,
          event: "cta_maps",
        };
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

export type CompletionItem = { label: string; done: boolean; hint: string };

export function profileCompletion(
  card: Card,
  extras: { services?: { id: string }[]; products?: Product[]; media?: Media[] } = {},
) {
  const services = extras.services ?? [];
  const products = extras.products ?? [];
  const media = extras.media ?? [];
  const items: CompletionItem[] = [
    { label: "Name & designation", done: Boolean(card.display_name?.trim() && card.job_title?.trim()), hint: "Visitors decide in 5 seconds — say who you are." },
    { label: "Profile photo", done: Boolean(card.photo_url?.trim()), hint: "Photos lift contact saves noticeably." },
    { label: "Professional headline", done: Boolean(card.headline?.trim()), hint: "One line on what you do best." },
    { label: "Short introduction", done: Boolean(card.short_bio?.trim() || card.about?.trim()), hint: "Two lines of context build trust." },
    { label: "WhatsApp number", done: Boolean(card.whatsapp?.trim()), hint: "Add WhatsApp to increase direct enquiries." },
    { label: "Email or phone", done: Boolean(card.email?.trim() || card.phone?.trim()), hint: "Give a second way to reach you." },
    { label: "What I do", done: services.length > 0, hint: "List 3 capabilities so visitors understand your value." },
    { label: "Products or offers", done: products.length > 0, hint: "Showcase what people can buy or enquire about." },
    { label: "Primary action", done: Boolean(card.primary_cta?.trim()), hint: "Pick the one thing you want visitors to do." },
    { label: "Social & website links", done: media.some((m) => m.kind === "link") || Boolean(card.website?.trim()), hint: "Link your website and social profiles." },
    { label: "Published", done: Boolean(card.published), hint: "Publish to make your Glinkit link live." },
  ];
  const done = items.filter((i) => i.done).length;
  return {
    items,
    percent: Math.round((done / items.length) * 100),
    pending: items.filter((i) => !i.done),
  };
}
