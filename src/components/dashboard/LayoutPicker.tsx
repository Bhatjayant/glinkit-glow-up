import { LayoutTemplate } from "lucide-react";
import { cardLayouts } from "@/lib/card-layouts";

export function LayoutPicker({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (id: string) => void;
}) {
  const active = value ?? "classic";
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <LayoutTemplate className="h-3.5 w-3.5 text-primary" /> Card layout
      </p>
      <div className="grid grid-cols-3 gap-2">
        {cardLayouts.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            className={`rounded-xl border p-2.5 text-left transition-colors ${
              active === l.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="block text-[11px] font-semibold">{l.name}</span>
            <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
              {l.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
