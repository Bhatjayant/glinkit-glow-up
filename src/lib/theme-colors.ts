export const THEME_COLOR_KEY = "glinkit-theme-colors";
export const THEME_COLOR_EVENT = "glinkit-theme-change";

export type ThemeColors = { dark: string; light: string };

export const DEFAULT_THEME_COLORS: ThemeColors = {
  dark: "#0d2b21",
  light: "#dff0e2",
};

export const DARK_PRESETS = ["#0d2b21", "#08211c", "#12241f", "#0a1f2b", "#191a14"];
export const LIGHT_PRESETS = ["#dff0e2", "#eaf6e6", "#f3f6ec", "#e6f1f5", "#f6efe4"];

export function readThemeColors(): ThemeColors {
  if (typeof window === "undefined") return DEFAULT_THEME_COLORS;
  try {
    const raw = window.localStorage.getItem(THEME_COLOR_KEY);
    if (!raw) return DEFAULT_THEME_COLORS;
    const parsed = JSON.parse(raw) as Partial<ThemeColors>;
    return {
      dark: parsed.dark ?? DEFAULT_THEME_COLORS.dark,
      light: parsed.light ?? DEFAULT_THEME_COLORS.light,
    };
  } catch {
    return DEFAULT_THEME_COLORS;
  }
}

export function isLightMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("theme-light");
}

/** Applies the stored colors for the currently active mode to the root element. */
export function applyThemeColors(colors: ThemeColors = readThemeColors()) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const light = isLightMode();
  const bg = light ? colors.light : colors.dark;
  const isDefault = bg === (light ? DEFAULT_THEME_COLORS.light : DEFAULT_THEME_COLORS.dark);

  if (isDefault) {
    root.style.removeProperty("--background");
    root.style.removeProperty("--card");
    root.style.removeProperty("--popover");
    root.style.removeProperty("--surface");
    root.style.removeProperty("--sidebar");
    root.style.removeProperty("--gradient-emerald");
    return;
  }

  const mixTarget = light ? "black" : "white";
  const lift = (pct: number) => `color-mix(in oklab, ${bg} ${100 - pct}%, ${mixTarget})`;

  root.style.setProperty("--background", bg);
  root.style.setProperty("--card", lift(6));
  root.style.setProperty("--popover", lift(4));
  root.style.setProperty("--surface", lift(5));
  root.style.setProperty("--sidebar", lift(4));
  root.style.setProperty(
    "--gradient-emerald",
    `linear-gradient(160deg, ${lift(8)} 0%, ${bg} 60%, ${lift(-6)} 100%)`,
  );
}

export function saveThemeColors(colors: ThemeColors) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_COLOR_KEY, JSON.stringify(colors));
  }
  applyThemeColors(colors);
}