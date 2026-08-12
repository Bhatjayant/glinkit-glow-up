import { useEffect, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  DARK_PRESETS,
  DEFAULT_THEME_COLORS,
  LIGHT_PRESETS,
  THEME_COLOR_EVENT,
  applyThemeColors,
  readThemeColors,
  saveThemeColors,
  type ThemeColors,
} from "@/lib/theme-colors";

function Swatches({
  presets,
  value,
  onPick,
}: {
  presets: string[];
  value: string;
  onPick: (hex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((hex) => (
        <button
          key={hex}
          type="button"
          onClick={() => onPick(hex)}
          aria-label={`Use ${hex}`}
          style={{ background: hex }}
          className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
            value.toLowerCase() === hex.toLowerCase()
              ? "border-primary ring-2 ring-primary/50"
              : "border-border"
          }`}
        />
      ))}
    </div>
  );
}

export function ThemeColorPicker({ className = "" }: { className?: string }) {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME_COLORS);

  useEffect(() => {
    const stored = readThemeColors();
    setColors(stored);
    applyThemeColors(stored);
    const reapply = () => applyThemeColors();
    window.addEventListener(THEME_COLOR_EVENT, reapply);
    return () => window.removeEventListener(THEME_COLOR_EVENT, reapply);
  }, []);

  const update = (patch: Partial<ThemeColors>) => {
    const next = { ...colors, ...patch };
    setColors(next);
    saveThemeColors(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Customize background colors"
          title="Customize background colors"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/60 hover:text-primary ${className}`}
        >
          <Palette className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Background colors</p>
          <p className="text-xs text-muted-foreground">
            Applies instantly and is saved on this device.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Night (dark)</span>
            <input
              type="color"
              value={colors.dark}
              onChange={(e) => update({ dark: e.target.value })}
              aria-label="Night background color"
              className="h-7 w-10 cursor-pointer rounded border border-border bg-transparent"
            />
          </div>
          <Swatches presets={DARK_PRESETS} value={colors.dark} onPick={(dark) => update({ dark })} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Day (light)</span>
            <input
              type="color"
              value={colors.light}
              onChange={(e) => update({ light: e.target.value })}
              aria-label="Day background color"
              className="h-7 w-10 cursor-pointer rounded border border-border bg-transparent"
            />
          </div>
          <Swatches
            presets={LIGHT_PRESETS}
            value={colors.light}
            onPick={(light) => update({ light })}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setColors(DEFAULT_THEME_COLORS);
            saveThemeColors(DEFAULT_THEME_COLORS);
          }}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset to brand colors
        </Button>
      </PopoverContent>
    </Popover>
  );
}