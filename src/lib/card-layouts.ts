export type CardLayout = {
  id: string;
  name: string;
  hint: string;
  /** Hero treatment on the public card page. */
  hero: "banner" | "cover" | "centered" | "split" | "mono" | "ticket";
  /** Avatar corner treatment. */
  avatar: "rounded" | "circle" | "square";
  /** Alignment of the identity block. */
  align: "left" | "center";
  /** Shape of the secondary quick-action buttons. */
  tiles: "tile" | "circle" | "pill" | "list";
  /** Outer panel radius / border feel. */
  panel: "soft" | "sharp" | "pill";
  /** Name typography treatment — templates must differ in hierarchy, not colour. */
  nameType: "bold" | "tracked" | "caps" | "light";
  /** Vertical rhythm. */
  density: "compact" | "comfortable" | "airy";
  /** How the primary objective button is presented. */
  ctaStyle: "block" | "banner" | "quiet";
  /** Section arrangement below the first screen. */
  order: SectionKey[];
};

export type SectionKey =
  | "services"
  | "about"
  | "products"
  | "gallery"
  | "links"
  | "videos"
  | "docs"
  | "payments"
  | "booking";

const DEFAULT_ORDER: SectionKey[] = [
  "services",
  "about",
  "products",
  "gallery",
  "links",
  "videos",
  "docs",
  "payments",
  "booking",
];

export const cardLayouts: CardLayout[] = [
  {
    id: "executive",
    name: "Executive",
    hint: "Photo beside name, corporate hierarchy, list actions",
    hero: "split",
    avatar: "square",
    align: "left",
    tiles: "list",
    panel: "sharp",
    nameType: "bold",
    density: "compact",
    ctaStyle: "banner",
    order: ["about", "services", "booking", "products", "links", "docs", "gallery", "videos", "payments"],
  },
  {
    id: "ticket",
    name: "Luxury",
    hint: "Perforated gold ticket, centred, airy",
    hero: "ticket",
    avatar: "circle",
    align: "center",
    tiles: "pill",
    panel: "soft",
    nameType: "light",
    density: "airy",
    ctaStyle: "banner",
    order: ["services", "products", "about", "gallery", "links", "videos", "docs", "payments", "booking"],
  },
  {
    id: "mono",
    name: "Minimal",
    hint: "Typography first, no banner, quiet CTA",
    hero: "mono",
    avatar: "square",
    align: "left",
    tiles: "pill",
    panel: "sharp",
    nameType: "tracked",
    density: "compact",
    ctaStyle: "quiet",
    order: ["about", "services", "links", "products", "gallery", "videos", "docs", "booking", "payments"],
  },
  {
    id: "classic",
    name: "Corporate",
    hint: "Banner + avatar, balanced business layout",
    hero: "banner",
    avatar: "rounded",
    align: "left",
    tiles: "tile",
    panel: "soft",
    nameType: "bold",
    density: "comfortable",
    ctaStyle: "block",
    order: DEFAULT_ORDER,
  },
  {
    id: "portrait",
    name: "Modern",
    hint: "Full photo cover, name over image, circular actions",
    hero: "cover",
    avatar: "circle",
    align: "left",
    tiles: "circle",
    panel: "soft",
    nameType: "bold",
    density: "comfortable",
    ctaStyle: "block",
    order: ["services", "about", "gallery", "products", "links", "videos", "docs", "booking", "payments"],
  },
  {
    id: "spotlight",
    name: "Creative",
    hint: "Centred, big round photo, gallery led",
    hero: "centered",
    avatar: "circle",
    align: "center",
    tiles: "circle",
    panel: "pill",
    nameType: "caps",
    density: "airy",
    ctaStyle: "block",
    order: ["gallery", "services", "about", "videos", "links", "products", "docs", "booking", "payments"],
  },
];

export const getCardLayout = (id?: string | null): CardLayout =>
  cardLayouts.find((l) => l.id === id) ?? (cardLayouts[3] as CardLayout);

export const panelRadius = (p: CardLayout["panel"]) =>
  p === "sharp" ? "rounded-lg" : p === "pill" ? "rounded-[2.75rem]" : "rounded-[2rem]";

export const avatarRadius = (a: CardLayout["avatar"]) =>
  a === "circle" ? "rounded-full" : a === "square" ? "rounded-md" : "rounded-3xl";

export const nameClass = (n: CardLayout["nameType"]) =>
  n === "tracked"
    ? "font-display text-[1.7rem] leading-tight font-bold tracking-tight"
    : n === "caps"
      ? "font-display text-2xl leading-tight font-bold tracking-[0.06em] uppercase"
      : n === "light"
        ? "font-display text-[1.6rem] leading-tight font-semibold tracking-wide"
        : "font-display text-2xl leading-tight font-bold";

export const sectionGap = (d: CardLayout["density"]) =>
  d === "compact" ? "mt-6" : d === "airy" ? "mt-10" : "mt-8";

export const bodyPad = (d: CardLayout["density"]) =>
  d === "compact" ? "px-5 pb-6 sm:px-6" : d === "airy" ? "px-6 pb-8 sm:px-8" : "px-5 pb-6 sm:px-7";
