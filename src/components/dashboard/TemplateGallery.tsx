import { useState } from "react";
import { Check, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cardTemplates, type CardTemplate } from "@/lib/card-templates";

const categories = ["All", "Minimal", "Corporate", "Creative", "Service", "Product"] as const;

export function TemplateGallery({
  onApply,
  applyingId,
}: {
  onApply: (template: CardTemplate) => void;
  applyingId?: string | null;
}) {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const list = cardTemplates.filter((t) => filter === "All" || t.category === filter);

  return (
    <section className="surface-panel mt-6 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
          <LayoutTemplate className="h-4 w-4 text-primary" /> Template gallery
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                filter === c
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Applying a template fills empty fields with ready copy and adds starter items. Your name,
        link and contact details are never overwritten.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((t) => (
          <li key={t.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-primary">
                  {t.category} · {t.theme === "light" ? "Light" : "Dark"}
                </p>
              </div>
              <Button
                size="sm"
                variant="goldOutline"
                disabled={applyingId === t.id}
                onClick={() => onApply(t)}
              >
                {applyingId === t.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "Use"
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.blurb}</p>
            <p className="mt-2 line-clamp-2 text-xs italic text-foreground/80">“{t.patch.tagline}”</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
