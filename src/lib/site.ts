export const PHONE = "+918808748088";
export const PHONE_DISPLAY = "+91 88087 48088";
export const EMAIL = "care@glinkit.com";

export const SITE_URL = "https://glinkit.com";

const WA_TEXT = encodeURIComponent(
  "Hi Glinkit, I'd like a demo of the smart digital business card for my team.",
);

export const WHATSAPP_URL = `https://wa.me/918808748088?text=${WA_TEXT}`;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/mini-website-card", label: "Mini website card" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;