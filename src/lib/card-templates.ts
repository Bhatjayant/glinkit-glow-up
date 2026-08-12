import type { Card } from "./cards";

export type CardTemplate = {
  id: string;
  name: string;
  category: "Minimal" | "Corporate" | "Creative" | "Service" | "Product";
  blurb: string;
  theme: "dark" | "light";
  /** Designer backdrop id from card-backgrounds. */
  bg_style?: string;
  patch: Partial<Card>;
  products: { name: string; description: string; mrp?: number; offer_price?: number }[];
};

export const cardTemplates: CardTemplate[] = [
  {
    id: "minimal-mono",
    bg_style: "classic",
    name: "Minimal Mono",
    category: "Minimal",
    blurb: "Name, role and one clean line. Nothing else.",
    theme: "dark",
    patch: {
      job_title: "Founder",
      tagline: "Let's build something worth sharing.",
      about:
        "I keep things simple: clear work, quick replies, honest pricing. Tap any button below to reach me instantly — call, WhatsApp or save my contact in one tap.",
    },
    products: [],
  },
  {
    id: "minimal-ivory",
    bg_style: "spotlight",
    name: "Ivory Calm",
    category: "Minimal",
    blurb: "Light, airy layout for consultants and coaches.",
    theme: "light",
    patch: {
      job_title: "Independent Consultant",
      tagline: "Clarity first. Then results.",
      about:
        "I work with a small number of clients at a time so every engagement gets full attention. Share your challenge on WhatsApp and I'll tell you honestly if I can help.",
    },
    products: [
      { name: "Discovery call", description: "30 minutes to understand your goal and map next steps.", mrp: 2000, offer_price: 0 },
    ],
  },
  {
    id: "corporate-exec",
    bg_style: "carbon",
    name: "Corporate Executive",
    category: "Corporate",
    blurb: "Formal tone for leadership and B2B sales teams.",
    theme: "dark",
    patch: {
      job_title: "Vice President — Business Development",
      company: "Your Company Pvt. Ltd.",
      tagline: "Enterprise partnerships that compound.",
      about:
        "I lead partnerships and key accounts, helping organisations shorten sales cycles and scale reliably. Reach out for enterprise pricing, proposals or a scheduled call with our solutions team.",
    },
    products: [
      { name: "Enterprise plan", description: "Dedicated account manager, onboarding and SLA-backed support." },
      { name: "Pilot programme", description: "A 30-day paid pilot with clear success metrics before rollout." },
    ],
  },
  {
    id: "corporate-team",
    bg_style: "carbon",
    name: "Team Directory",
    category: "Corporate",
    blurb: "For franchise and multi-branch teams with offices listed.",
    theme: "light",
    patch: {
      job_title: "Branch Manager",
      company: "Your Company — Pune Branch",
      tagline: "One team, every city you need us in.",
      about:
        "Our branch handles onboarding, service and support for clients across the region. Save this card to reach the right person without searching your inbox.",
    },
    products: [
      { name: "Branch services", description: "Sales, installation, service and annual maintenance in one place." },
    ],
  },
  {
    id: "creative-studio",
    bg_style: "aurora",
    name: "Creative Studio",
    category: "Creative",
    blurb: "Bold voice for designers, studios and agencies.",
    theme: "dark",
    patch: {
      job_title: "Creative Director",
      company: "Studio Name",
      tagline: "Brands people actually remember.",
      about:
        "We design identities, campaigns and websites for brands that refuse to look like everyone else. Scroll the gallery below, then message us with your brief.",
    },
    products: [
      { name: "Brand identity", description: "Logo, palette, typography and a usage guide.", mrp: 75000, offer_price: 59000 },
      { name: "Website design", description: "Conversion-focused design and build, mobile first.", mrp: 120000, offer_price: 95000 },
    ],
  },
  {
    id: "creative-portfolio",
    bg_style: "spotlight",
    name: "Portfolio First",
    category: "Creative",
    blurb: "Photographers and content creators — visuals lead.",
    theme: "dark",
    patch: {
      job_title: "Photographer & Filmmaker",
      tagline: "Your story, shot properly.",
      about:
        "Weddings, products and brand films. Every booking includes a shoot plan, edited deliverables and quick turnaround. Browse recent work below and message me your dates.",
    },
    products: [
      { name: "Wedding coverage", description: "Full-day shoot, edited album and highlight film.", mrp: 150000, offer_price: 125000 },
      { name: "Product shoot", description: "Studio setup, 20 retouched images per set.", mrp: 25000, offer_price: 18000 },
    ],
  },
  {
    id: "service-local",
    bg_style: "sunrise",
    name: "Local Service Pro",
    category: "Service",
    blurb: "Electricians, interiors, repairs — call and WhatsApp first.",
    theme: "light",
    patch: {
      job_title: "Service Specialist",
      tagline: "Same-day service. Fixed, upfront pricing.",
      about:
        "Trained technicians, genuine parts and a written warranty on every job. Tap Call or WhatsApp for a free estimate — we usually reply within 10 minutes.",
    },
    products: [
      { name: "Inspection visit", description: "On-site check and written estimate, adjusted against the final bill.", mrp: 500, offer_price: 0 },
      { name: "Annual maintenance", description: "Four scheduled visits plus priority breakdown support.", mrp: 6000, offer_price: 4999 },
    ],
  },
  {
    id: "service-clinic",
    bg_style: "velvet",
    name: "Clinic & Wellness",
    category: "Service",
    blurb: "Doctors, clinics and wellness studios with booking flow.",
    theme: "light",
    patch: {
      job_title: "Consultant",
      company: "Clinic Name",
      tagline: "Care that starts with listening.",
      about:
        "Appointments, reports and follow-ups handled over WhatsApp so you never wait on hold. Save this card and message us for slot availability.",
    },
    products: [
      { name: "First consultation", description: "Detailed assessment and treatment plan.", mrp: 900, offer_price: 700 },
      { name: "Follow-up visit", description: "Review of progress and prescription updates.", mrp: 500 },
    ],
  },
  {
    id: "product-catalog",
    bg_style: "goldsilk",
    name: "Product Catalogue",
    category: "Product",
    blurb: "Retail and D2C — priced items with Buy now on UPI.",
    theme: "dark",
    patch: {
      job_title: "Sales Head",
      company: "Your Brand",
      tagline: "Order in two taps. Pay by UPI.",
      about:
        "Browse the catalogue below, tap Buy now to pay by UPI, or Enquire for bulk and dealer pricing. Free delivery on orders above ₹999.",
    },
    products: [
      { name: "Best seller", description: "Our most-ordered product. Ships in 48 hours.", mrp: 1999, offer_price: 1499 },
      { name: "Combo pack", description: "Three-item bundle at a lower per-unit price.", mrp: 4999, offer_price: 3499 },
      { name: "Bulk order", description: "50 units or more — dealer pricing on request." },
    ],
  },
  {
    id: "product-distributor",
    bg_style: "midnight",
    name: "Distributor & Wholesale",
    category: "Product",
    blurb: "B2B trade cards with MOQ and dealer enquiry.",
    theme: "dark",
    patch: {
      job_title: "Proprietor",
      company: "Trading Co.",
      tagline: "Wholesale rates, dependable supply.",
      about:
        "Supplying retailers and institutions since day one. Minimum order quantities, GST invoicing and transport arranged. Message on WhatsApp for the current rate list.",
    },
    products: [
      { name: "Rate list (current)", description: "Latest wholesale rates — request on WhatsApp." },
      { name: "Starter stock kit", description: "Assorted fast-moving items for new retailers.", mrp: 25000, offer_price: 21000 },
    ],
  },
];
