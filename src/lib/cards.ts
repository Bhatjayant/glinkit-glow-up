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
};

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
  const [{ data: products }, { data: media }] = await Promise.all([
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
  ]);
  return {
    card: card as Card,
    products: (products ?? []) as Product[],
    media: (media ?? []) as Media[],
  };
}

export function vcard(card: Card) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.display_name}`,
    `TITLE:${card.job_title}`,
    `ORG:${card.company}`,
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.website ? `URL:${card.website}` : "",
    card.address ? `ADR:;;${card.address};;;;` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}