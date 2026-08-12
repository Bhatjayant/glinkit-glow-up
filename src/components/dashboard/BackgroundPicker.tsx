import { Check, Sparkles } from "lucide-react";
import { cardBackgrounds } from "@/lib/card-backgrounds";

export function BackgroundPicker({
  value,
  theme,
  onChange,
}: {
  value: string | null | undefined;
  theme: "dark" | "light";
  onChange: (id: string) => void;
}) {
  const active = value ?? "classic";
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> Designer background
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
        {cardBackgrounds.map((bg) => (
          <button
            key={bg.id}
            type="button"
            title={`${bg.name} — ${bg.hint}`}
            onClick={() => onChange(bg.id)}
            className={`group relative overflow-hidden rounded-xl border transition ${
              active === bg.id
                ? "border-primary ring-2 ring-primary/40"
                : "border-border hover:border-primary/60"
            }`}
          >
            <span
              className="block h-14 w-full"
              style={{ background: theme === "light" ? bg.light : bg.dark }}
            />
            {active === bg.id && (
              <Check className="absolute top-1 right-1 h-3.5 w-3.5 text-primary" />
            )}
            <span className="block px-1.5 py-1 text-[10px] leading-tight text-muted-foreground">
              {bg.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}