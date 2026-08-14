import { Target } from "lucide-react";
import { CTA_OPTIONS, PROFILE_TYPES, profileType } from "@/lib/profile";
import type { Card } from "@/lib/cards";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

/** Profile type + the single objective every visitor should act on. */
export function ProfileGoal({
  card,
  onChange,
}: {
  card: Card;
  onChange: (patch: Partial<Card>) => void;
}) {
  const type = profileType(card.profile_type);
  const custom = card.primary_cta === "custom";

  return (
    <section className="surface-panel mt-6 rounded-2xl p-5 sm:p-6">
      <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
        <Target className="h-4.5 w-4.5 text-primary" /> Your objective
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Glinkit profiles convert because one action is obvious. Pick yours.
      </p>

      <p className="mt-5 text-xs font-medium text-muted-foreground">Profile type</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PROFILE_TYPES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ profile_type: p.value, primary_cta: p.cta })}
            className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
              type.value === p.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {type.hint} · Suggested sections: {type.sections.join(", ")}
      </p>

      <p className="mt-5 text-xs font-medium text-muted-foreground">Primary action button</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {CTA_OPTIONS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange({ primary_cta: c.value })}
            className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
              (card.primary_cta ?? "whatsapp") === c.value
                ? "border-primary bg-primary/12 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Button text (optional)
          </span>
          <input
            className={inputCls}
            maxLength={40}
            placeholder="Talk to me on WhatsApp"
            value={card.primary_cta_label ?? ""}
            onChange={(e) => onChange({ primary_cta_label: e.target.value })}
          />
        </label>
        {custom && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Custom link
            </span>
            <input
              className={inputCls}
              maxLength={500}
              placeholder="https://…"
              value={card.primary_cta_url ?? ""}
              onChange={(e) => onChange({ primary_cta_url: e.target.value })}
            />
          </label>
        )}
      </div>

      <p className="mt-5 text-xs font-medium text-muted-foreground">What I offer</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(
          [
            { value: "services", label: "Services only" },
            { value: "products", label: "Products only" },
            { value: "both", label: "Both" },
          ] as const
        ).map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange({ offer_mode: o.value })}
            className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
              (card.offer_mode ?? "both") === o.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  );
}
