export type CardBackground = {
  id: string;
  name: string;
  hint: string;
  /** Full CSS background value for dark cards. */
  dark: string;
  /** Full CSS background value for light cards. */
  light: string;
  /** Adds a soft shimmer sweep over the backdrop. */
  shimmer?: boolean;
};

export const cardBackgrounds: CardBackground[] = [
  {
    id: "classic",
    name: "Classic",
    hint: "Plain brand backdrop",
    dark: "radial-gradient(120% 80% at 50% 0%, #14261b 0%, #0b1510 60%, #081109 100%)",
    light: "linear-gradient(180deg, #eef6ee 0%, #e3efe4 100%)",
  },
  {
    id: "aurora",
    name: "Emerald Aurora",
    hint: "Flowing green light bands",
    dark: "radial-gradient(80% 50% at 15% 0%, rgba(224,181,88,0.22) 0%, transparent 60%), radial-gradient(70% 60% at 90% 20%, rgba(46,160,105,0.28) 0%, transparent 65%), linear-gradient(165deg, #0a1710 0%, #10251a 55%, #071009 100%)",
    light:
      "radial-gradient(70% 50% at 10% 0%, rgba(224,181,88,0.28) 0%, transparent 60%), radial-gradient(70% 60% at 95% 15%, rgba(46,160,105,0.22) 0%, transparent 65%), linear-gradient(165deg, #f3faf3 0%, #e2f0e5 100%)",
    shimmer: true,
  },
  {
    id: "goldsilk",
    name: "Gold Silk",
    hint: "Diagonal satin gold sheen",
    dark: "repeating-linear-gradient(115deg, rgba(224,181,88,0.10) 0 2px, transparent 2px 22px), linear-gradient(135deg, #0d1a12 0%, #1b2a1c 45%, #0a1410 100%)",
    light:
      "repeating-linear-gradient(115deg, rgba(169,129,47,0.10) 0 2px, transparent 2px 22px), linear-gradient(135deg, #f7f4e9 0%, #eaf2e6 60%, #f3f8f1 100%)",
    shimmer: true,
  },
  {
    id: "midnight",
    name: "Midnight Marble",
    hint: "Deep stone with gold veins",
    dark: "radial-gradient(60% 40% at 80% 90%, rgba(224,181,88,0.16) 0%, transparent 70%), conic-gradient(from 210deg at 30% 30%, #12211a 0deg, #0a1210 120deg, #16241c 240deg, #0a1210 360deg)",
    light:
      "radial-gradient(60% 40% at 80% 90%, rgba(169,129,47,0.18) 0%, transparent 70%), conic-gradient(from 210deg at 30% 30%, #f4f7f2 0deg, #e7efe8 120deg, #f8f9f3 240deg, #e9f1ea 360deg)",
  },
  {
    id: "sunrise",
    name: "Sunrise Fade",
    hint: "Warm amber into green",
    dark: "linear-gradient(170deg, #2a1c0c 0%, #14261b 45%, #08110c 100%)",
    light: "linear-gradient(170deg, #fdf3dd 0%, #eff7ec 55%, #e6f1e7 100%)",
  },
  {
    id: "carbon",
    name: "Carbon Grid",
    hint: "Technical grid, corporate",
    dark: "linear-gradient(rgba(224,181,88,0.07) 1px, transparent 1px) 0 0/28px 28px, linear-gradient(90deg, rgba(224,181,88,0.07) 1px, transparent 1px) 0 0/28px 28px, linear-gradient(180deg, #0b1510 0%, #101d16 100%)",
    light:
      "linear-gradient(rgba(18,49,34,0.07) 1px, transparent 1px) 0 0/28px 28px, linear-gradient(90deg, rgba(18,49,34,0.07) 1px, transparent 1px) 0 0/28px 28px, linear-gradient(180deg, #f5f9f4 0%, #e8f1e9 100%)",
  },
  {
    id: "spotlight",
    name: "Studio Spotlight",
    hint: "Centre glow, portfolio look",
    dark: "radial-gradient(60% 45% at 50% 12%, rgba(224,181,88,0.30) 0%, rgba(12,26,18,0.2) 55%, #070f0b 100%)",
    light: "radial-gradient(60% 45% at 50% 10%, rgba(255,255,255,0.95) 0%, #eaf3ea 60%, #dfeade 100%)",
    shimmer: true,
  },
  {
    id: "velvet",
    name: "Velvet Wave",
    hint: "Soft luxury curves",
    dark: "radial-gradient(100% 60% at 0% 100%, rgba(46,160,105,0.30) 0%, transparent 60%), radial-gradient(90% 55% at 100% 0%, rgba(224,181,88,0.24) 0%, transparent 62%), #0a1410",
    light:
      "radial-gradient(100% 60% at 0% 100%, rgba(46,160,105,0.24) 0%, transparent 60%), radial-gradient(90% 55% at 100% 0%, rgba(224,181,88,0.30) 0%, transparent 62%), #f3f8f2",
    shimmer: true,
  },
];

export const getCardBackground = (id?: string | null) =>
  cardBackgrounds.find((b) => b.id === id) ?? cardBackgrounds[0];

export const backgroundCss = (id: string | null | undefined, theme: "dark" | "light") =>
  theme === "light" ? getCardBackground(id).light : getCardBackground(id).dark;