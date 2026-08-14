import { supabase } from "@/integrations/supabase/client";

export type Card = {
  id: string;
  owner_id: string;
  slug: string;
  display_name: string;
  job_title: string;
  company: string;
  tagline: string;
  about: string;
  headline?: string | null;
  short_bio?: string | null;
  seo_description?: string | null;
  photo_url: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  maps_url: string | null;
  upi_id: string | null;
  bank_details: string | null;
  published: boolean;
  view_count: number;
  theme?: string | null;
  bg_style?: string | null;
  layout?: string | null;
  booking_enabled?: boolean | null;
  booking_note?: string | null;
  booking_duration?: number | null;
  booking_slots?: string | null;
  headline?: string | null;
  short_bio?: string | null;
  seo_description?: string | null;
  profile_type?: string | null;
  primary_cta?: string | null;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  offer_mode?: string | null;
};

export type Booking = {
  id: string;
  card_id: string;
  name: string;
  phone: string;
  email: string;
  purpose: string;
  slot_date: string;
  slot_time: string;
  status: string;
  created_at: string;
};

export const parseSlots = (raw: string | null | undefined) =>
  (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d{1,2}:\d{2}$/.test(s));

export const prettyTime = (hhmm: string) => {
  const [h = "0", m = "00"] = hhmm.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
};

export const prettyDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export type Product = {
  id: string;
  card_id: string;
  name: string;
  description: string;
  image_url: string | null;
  mrp: number | null;
  offer_price: number | null;
  allow_buy: boolean;
  allow_enquiry: boolean;
  sort_order: number;
};

export type Media = {
  id: string;
  card_id: string;
  kind: string;
  url: string;
  title: string;
  sort_order: number;
};

export type Service = {
  id: string;
  card_id: string;
  title: string;
  description: string;
  image_url: string | null;
  cta_label: string;
  cta_url: string;
  sort_order: number;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

export const discountPct = (mrp: number | null, offer: number | null) =>
  mrp && offer && mrp > offer ? Math.round(((mrp - offer) / mrp) * 100) : 0;

export const inr = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const upiPayUrl = (upiId: string, name: string, amount: number | null, note: string) => {
  const params = new URLSearchParams({ pa: upiId, pn: name, cu: "INR", tn: note.slice(0, 60) });
  if (amount) params.set("am", String(amount));
  return `upi://pay?${params.toString()}`;
};

export const waLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;

export async function fetchPublicCard(slug: string) {
  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!card) return null;
  const [{ data: products }, { data: media }, { data: services }] = await Promise.all([
    supabase
      .from("card_products")
      .select("*")
      .eq("card_id", card.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("card_media")
      .select("*")
      .eq("card_id", card.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("card_services")
      .select("*")
      .eq("card_id", card.id)
      .order("sort_order", { ascending: true }),
  ]);
  return {
    card: card as Card,
    products: (products ?? []) as Product[],
    media: (media ?? []) as Media[],
    services: (services ?? []) as Service[],
  };
}

const socialType = (url: string) => {
  const u = url.toLowerCase();
  if (u.includes("instagram")) return "instagram";
  if (u.includes("facebook") || u.includes("fb.com")) return "facebook";
  if (u.includes("linkedin")) return "linkedin";
  if (u.includes("twitter") || u.includes("x.com")) return "twitter";
  if (u.includes("youtube") || u.includes("youtu.be")) return "youtube";
  if (u.includes("wa.me") || u.includes("whatsapp")) return "whatsapp";
  return "website";
};

export function vcard(card: Card, links: { url: string; title?: string }[] = []) {
  const extras = links
    .filter((l) => l.url?.trim())
    .flatMap((l) => {
      const type = socialType(l.url);
      return [
        `X-SOCIALPROFILE;TYPE=${type}:${l.url}`,
        `URL;TYPE=${l.title?.replace(/[;:,]/g, " ") || type}:${l.url}`,
      ];
    });
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.display_name}`,
    `TITLE:${card.job_title}`,
    `ORG:${card.company}`,
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
    card.whatsapp && card.whatsapp !== card.phone
      ? `TEL;TYPE=WORK,VOICE:${card.whatsapp}`
      : "",
    card.whatsapp
      ? `X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${card.whatsapp.replace(/[^\d]/g, "")}`
      : "",
    card.whatsapp
      ? `URL;TYPE=WhatsApp:https://wa.me/${card.whatsapp.replace(/[^\d]/g, "")}`
      : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.website ? `URL;TYPE=Website:${card.website}` : "",
    card.address ? `ADR:;;${card.address};;;;` : "",
    card.photo_url ? `PHOTO;VALUE=URI:${card.photo_url}` : "",
    card.tagline ? `NOTE:${card.tagline.replace(/\n/g, " ")}` : "",
    ...extras,
    `X-SOCIALPROFILE;TYPE=glinkit:https://glinkit.com/${card.slug}`,
    `REV:${new Date().toISOString()}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}