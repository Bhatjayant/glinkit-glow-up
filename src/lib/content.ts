export const FEATURES = [
  { title: "Click to call", desc: "One tap dials your line — no typing, no lost digits." },
  { title: "WhatsApp in one tap", desc: "Prospects start a chat straight from your card." },
  { title: "Email & navigation", desc: "Mail you or route to your office with a single tap." },
  { title: "Save to contacts", desc: "Your details land in their phonebook, correctly spelled." },
  { title: "Website & social links", desc: "Every profile that matters, in one shareable place." },
  { title: "Unlimited sharing", desc: "QR, link, or NFC — share as often as you like." },
  { title: "Live updates", desc: "Change role or number instantly. No reprints, ever." },
  { title: "Photo & video gallery", desc: "20 images and 5 YouTube videos to show your work." },
  { title: "Products & catalogue", desc: "List offerings with images, pricing and descriptions." },
  { title: "Payments section", desc: "Collect UPI or bank payments right from the card." },
  { title: "Enquiry form", desc: "Capture leads with a built-in form and visitor counter." },
  { title: "Ratings & PDFs", desc: "Reviews plus 2 brochure uploads for credibility." },
] as const;

export const STEPS = [
  {
    n: "01",
    title: "Send us your details",
    desc: "Share your logo, photo and contact info on WhatsApp. Takes about two minutes.",
  },
  {
    n: "02",
    title: "We design and publish",
    desc: "Pick a template, we set up your card and hand over the dashboard.",
  },
  {
    n: "03",
    title: "Share and track",
    desc: "Send the link or QR anywhere and watch enquiries and visits come in.",
  },
] as const;

export const PLAN_INCLUDES = [
  "Unlimited sharing and updates",
  "Profile photo and logo",
  "20-image photo gallery",
  "5 YouTube videos",
  "Products with images and descriptions",
  "Payments section (UPI / bank)",
  "Enquiry form and lead capture",
  "Ratings and reviews",
  "2 PDF / brochure uploads",
  "Visitor counter and analytics",
  "Choice of premium templates",
  "Dashboard access and support",
] as const;

export const AUDIENCES = [
  {
    title: "For corporates",
    desc: "Roll out a consistent card for every employee, with brand-locked templates, bulk onboarding and instant updates when people change roles.",
    points: ["Brand-controlled templates", "Team rollout & bulk setup", "Central updates, zero reprints"],
  },
  {
    title: "For startups & founders",
    desc: "Look established from day one. Pitch decks, product catalogue, payment links and booking — all behind one link you can send in a DM.",
    points: ["Investor-ready profile", "Product catalogue & PDFs", "Lead form on every card"],
  },
] as const;