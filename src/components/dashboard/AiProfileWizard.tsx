import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateProfile } from "@/lib/ai-profile.functions";

type Draft = {
  headline: string;
  short_bio: string;
  about: string;
  tagline: string;
  cta: string;
  seo_description: string;
  services: { name: string; description: string }[];
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

const FIELDS: { key: keyof Omit<Draft, "services">; label: string }[] = [
  { key: "headline", label: "Professional headline" },
  { key: "short_bio", label: "Short bio" },
  { key: "tagline", label: "Tagline / CTA line" },
  { key: "about", label: "About" },
  { key: "cta", label: "Call to action" },
  { key: "seo_description", label: "SEO description" },
];

export function AiProfileWizard({
  onApply,
}: {
  onApply: (
    draft: Draft,
    accepted: { fields: (keyof Omit<Draft, "services">)[]; services: boolean },
  ) => void;
}) {
  const run = useServerFn(generateProfile);
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [withServices, setWithServices] = useState(true);

  const generate = async () => {
    setBusy(true);
    try {
      const result = (await run({ data: { brief } })) as Draft;
      setDraft(result);
      setPicked(Object.fromEntries(FIELDS.map((f) => [f.key, Boolean(result[f.key])])));
      setWithServices(result.services.length > 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI could not generate that");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="surface-panel mt-6 rounded-2xl p-6">
      <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="h-4.5 w-4.5 text-primary" /> Create my Glinkit with AI
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Describe yourself or your business in your own words. Nothing is saved until you approve it.
      </p>

      <textarea
        className={`${inputCls} mt-4`}
        rows={3}
        maxLength={1200}
        placeholder="e.g. I am a real estate consultant in Pune specialising in commercial properties."
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
      />
      <Button
        variant="gold"
        className="mt-3"
        disabled={busy || brief.trim().length < 10}
        onClick={generate}
      >
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        {busy ? "Writing…" : draft ? "Regenerate" : "Generate my profile"}
      </Button>

      {draft && (
        <div className="mt-5 space-y-3">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Review and choose what to keep
          </p>
          {FIELDS.filter((f) => draft[f.key]).map((f) => (
            <label
              key={f.key}
              className="flex cursor-pointer gap-3 rounded-xl border border-border bg-primary/[0.03] p-3"
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                checked={Boolean(picked[f.key])}
                onChange={(e) => setPicked({ ...picked, [f.key]: e.target.checked })}
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-muted-foreground">{f.label}</span>
                <span className="mt-1 block text-sm whitespace-pre-line">{draft[f.key]}</span>
              </span>
            </label>
          ))}

          {draft.services.length > 0 && (
            <label className="flex cursor-pointer gap-3 rounded-xl border border-border bg-primary/[0.03] p-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                checked={withServices}
                onChange={(e) => setWithServices(e.target.checked)}
              />
              <span>
                <span className="block text-xs font-medium text-muted-foreground">
                  Add {draft.services.length} services / products
                </span>
                <ul className="mt-1 space-y-1 text-sm">
                  {draft.services.map((s) => (
                    <li key={s.name}>
                      <span className="font-medium">{s.name}</span>
                      {s.description ? ` — ${s.description}` : ""}
                    </li>
                  ))}
                </ul>
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="gold"
              onClick={() => {
                onApply(draft, {
                  fields: FIELDS.filter((f) => picked[f.key]).map((f) => f.key),
                  services: withServices,
                });
                setDraft(null);
              }}
            >
              Apply selected
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}