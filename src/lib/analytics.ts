import { supabase } from "@/integrations/supabase/client";

export const EVENT_TYPES = [
  "view",
  "save_contact",
  "connect",
  "whatsapp",
  "call",
  "email",
  "website",
  "social",
  "product_view",
  "product_click",
  "booking",
  "payment",
  "qr",
  "share",
  "document",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const SOURCES = [
  "qr",
  "whatsapp",
  "linkedin",
  "instagram",
  "facebook",
  "website",
  "nfc",
  "email",
  "event",
  "direct",
  "other",
] as const;
export type TrafficSource = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<TrafficSource, string> = {
  qr: "QR scan",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  website: "Website",
  nfc: "NFC tap",
  email: "Email",
  event: "Event",
  direct: "Direct",
  other: "Other",
};

const ALIASES: Record<string, TrafficSource> = {
  qr: "qr",
  qrcode: "qr",
  nfc: "nfc",
  tap: "nfc",
  wa: "whatsapp",
  whatsapp: "whatsapp",
  li: "linkedin",
  linkedin: "linkedin",
  ig: "instagram",
  instagram: "instagram",
  fb: "facebook",
  facebook: "facebook",
  web: "website",
  website: "website",
  mail: "email",
  email: "email",
  newsletter: "email",
  event: "event",
  expo: "event",
};

function fromReferrer(): TrafficSource {
  const ref = document.referrer.toLowerCase();
  if (!ref) return "direct";
  if (ref.includes("wa.me") || ref.includes("whatsapp")) return "whatsapp";
  if (ref.includes("linkedin")) return "linkedin";
  if (ref.includes("instagram")) return "instagram";
  if (ref.includes("facebook") || ref.includes("fb.com")) return "facebook";
  if (ref.includes("mail.")) return "email";
  try {
    if (new URL(ref).host === window.location.host) return "direct";
  } catch {
    /* ignore */
  }
  return "website";
}

/** Resolve the traffic source once per browser session and remember it for the visit. */
export function resolveSource(slug: string): TrafficSource {
  if (typeof window === "undefined") return "direct";
  const key = `glinkit:src:${slug}`;
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("src") ?? params.get("utm_source") ?? "").toLowerCase().trim();
  const mapped = raw ? (ALIASES[raw] ?? "other") : null;
  if (mapped) {
    try {
      sessionStorage.setItem(key, mapped);
    } catch {
      /* private mode */
    }
    return mapped;
  }
  try {
    const stored = sessionStorage.getItem(key) as TrafficSource | null;
    if (stored && SOURCES.includes(stored)) return stored;
  } catch {
    /* private mode */
  }
  const detected = fromReferrer();
  try {
    sessionStorage.setItem(key, detected);
  } catch {
    /* private mode */
  }
  return detected;
}

/** Fire-and-forget event recording. Never blocks or breaks the visitor flow. */
export async function trackEvent(
  cardId: string,
  slug: string,
  eventType: EventType,
  label = "",
) {
  if (typeof window === "undefined") return;
  try {
    await supabase.from("card_events").insert({
      card_id: cardId,
      event_type: eventType,
      source: resolveSource(slug),
      label: label.slice(0, 120),
    });
  } catch {
    /* analytics must never break the page */
  }
}

/** True the first time this browser session sees the given key. */
export function onceThisSession(key: string) {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}