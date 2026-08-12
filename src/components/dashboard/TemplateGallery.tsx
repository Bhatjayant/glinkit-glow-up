import { useState } from "react";
import { Check, Eye, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TemplatePreview } from "./TemplatePreview";
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
  const [preview, setPreview] = useState<CardTemplate | null>(null);
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
        Each thumbnail shows how the published card will look. Applying a template fills empty
        fields with ready copy and adds starter items. Your name, link and contact details are
        never overwritten.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <li key={t.id} className="rounded-2xl border border-border p-3">
            <button
              type="button"
              onClick={() => setPreview(t)}
              className="block w-full text-left transition hover:opacity-90"
              aria-label={`Preview ${t.name} design`}
            >
              <TemplatePreview template={t} />
            </button>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-primary">
                  {t.category} · {t.theme === "light" ? "Light" : "Dark"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" variant="ghost" onClick={() => setPreview(t)} aria-label="Preview design">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="goldOutline"
                  disabled={applyingId === t.id}
                  onClick={() => onApply(t)}
                >
                  {applyingId === t.id ? <Check className="h-4 w-4" /> : "Use"}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.blurb}</p>
            <p className="mt-2 line-clamp-2 text-xs italic text-foreground/80">“{t.patch.tagline}”</p>
          </li>
        ))}
      </ul>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-sm">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{preview.name}</DialogTitle>
                <DialogDescription>
                  {preview.category} · {preview.theme === "light" ? "Light theme" : "Dark theme"} —{" "}
                  {preview.blurb}
                </DialogDescription>
              </DialogHeader>
              <TemplatePreview template={preview} size="lg" />
              <Button
                variant="gold"
                disabled={applyingId === preview.id}
                onClick={() => {
                  onApply(preview);
                  setPreview(null);
                }}
              >
                Use this design
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
