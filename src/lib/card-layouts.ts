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
  /** Shape of the quick-action buttons. */
  tiles: "tile" | "circle" | "pill" | "list";
  /** Outer panel radius / border feel. */
  panel: "soft" | "sharp" | "pill";
};

export const cardLayouts: CardLayout[] = [
  {
    id: "classic",
    name: "Classic",
    hint: "Banner + avatar, left aligned",
    hero: "banner",
    avatar: "rounded",
    align: "left",
    tiles: "tile",
    panel: "soft",
  },
  {
    id: "portrait",
    name: "Portrait Cover",
    hint: "Full photo cover, name over image",
    hero: "cover",
    avatar: "circle",
    align: "left",
    tiles: "circle",
    panel: "soft",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    hint: "Centred, big round photo",
    hero: "centered",
    avatar: "circle",
    align: "center",
    tiles: "circle",
    panel: "pill",
  },
  {
    id: "executive",
    name: "Executive Split",
    hint: "Photo beside name, corporate",
    hero: "split",
    avatar: "square",
    align: "left",
    tiles: "list",
    panel: "sharp",
  },
  {
    id: "mono",
    name: "Mono Minimal",
    hint: "No banner, typography first",
    hero: "mono",
    avatar: "square",
    align: "left",
    tiles: "pill",
    panel: "sharp",
  },
  {
    id: "ticket",
    name: "Gold Ticket",
    hint: "Perforated luxury ticket",
    hero: "ticket",
    avatar: "circle",
    align: "center",
    tiles: "pill",
    panel: "soft",
  },
];

export const getCardLayout = (id?: string | null): CardLayout =>
  cardLayouts.find((l) => l.id === id) ?? (cardLayouts[0] as CardLayout);

export const panelRadius = (p: CardLayout["panel"]) =>
  p === "sharp" ? "rounded-lg" : p === "pill" ? "rounded-[2.75rem]" : "rounded-[2rem]";

export const avatarRadius = (a: CardLayout["avatar"]) =>
  a === "circle" ? "rounded-full" : a === "square" ? "rounded-md" : "rounded-3xl";
