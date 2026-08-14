import { useState } from "react";
import { ArrowLeft, ArrowRight, PartyPopper, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LayoutPicker } from "@/components/dashboard/LayoutPicker";
import { CTA_OPTIONS, PROFILE_TYPES, profileCompletion } from "@/lib/profile";
import type { Card } from "@/lib/cards";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

const STEPS = [
  "Who are you?",
  "What do you do?",
  "What should visitors do?",
  "What do you want to showcase?",
  "Choose your design",
] as const;

/** Guided first-run flow. Nothing optional is required before publishing. */
export function SetupWizard({
  card,
  onChange,
  onPublish,
  onDismiss,
  publishing,
}: {
  card: Card;
  onChange: (patch: Partial<Card>) => void;
  onPublish: () => void;
  onDismiss: () => void;
  publishing?: boolean;
}) {
  const [step, setStep] = useState(0);
  const { readyToPublish, essentialPending } = profileCompletion(card);
  const last = step === STEPS.length - 1;

  return (
    <section className="surface-panel mt-6 rounded-2xl border-primary/30 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-4.5 w-4.5 text-primary" /> Set up your Glinkit
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length} · {STEPS[step]} — everything else can wait.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Skip guided setup"
          className="rounded-lg p-1.5 text-muted-foreground hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-primary/15"}`}
          />
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {step === 0 && (
          <>
            <input
              className={inputCls}
              placeholder="Full name"
              maxLength={100}
              value={card.display_name ?? ""}
              onChange={(e) => onChange({ display_name: e.target.value })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder="Designation"
                maxLength={100}
                value={card.job_title ?? ""}
                onChange={(e) => onChange({ job_title: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Company"
                maxLength={100}
                value={card.company ?? ""}
                onChange={(e) => onChange({ company: e.target.value })}
              />
            </div>
            <input
              className={inputCls}
              placeholder="Photo or logo URL"
              maxLength={500}
              value={card.photo_url ?? ""}
              onChange={(e) => onChange({ photo_url: e.target.value })}
            />
            <p className="text-xs font-medium text-muted-foreground">Profile type</p>
            <div className="flex flex-wrap gap-2">
              {PROFILE_TYPES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onChange({ profile_type: p.value, primary_cta: p.cta })}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                    (card.profile_type ?? "professional") === p.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <input
              className={inputCls}
              placeholder="Professional headline — e.g. Commercial real estate consultant · Pune"
              maxLength={120}
              value={card.headline ?? ""}
              onChange={(e) => onChange({ headline: e.target.value })}
            />
            <textarea
              className={inputCls}
              rows={3}
              placeholder="Short introduction (one or two lines)"
              maxLength={200}
              value={card.short_bio ?? ""}
              onChange={(e) => onChange({ short_bio: e.target.value })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder="WhatsApp number"
                maxLength={20}
                value={card.whatsapp ?? ""}
                onChange={(e) => onChange({ whatsapp: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Email"
                maxLength={255}
                value={card.email ?? ""}
                onChange={(e) => onChange({ email: e.target.value })}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs text-muted-foreground">
              Glinkit profiles convert because one action is obvious.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
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
            <input
              className={inputCls}
              placeholder="Button text (optional)"
              maxLength={40}
              value={card.primary_cta_label ?? ""}
              onChange={(e) => onChange({ primary_cta_label: e.target.value })}
            />
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-xs text-muted-foreground">
              Pick what your profile shows. You can add the actual items below at any time —
              nothing here blocks publishing.
            </p>
            <div className="flex flex-wrap gap-2">
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
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={Boolean(card.booking_enabled)}
                onChange={(e) => onChange({ booking_enabled: e.target.checked })}
              />
              Let visitors request a meeting slot
            </label>
            <input
              className={inputCls}
              placeholder="Website or main link (optional)"
              maxLength={300}
              value={card.website ?? ""}
              onChange={(e) => onChange({ website: e.target.value })}
            />
          </>
        )}

        {step === 4 && (
          <>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={(card.theme ?? "dark") === t ? "gold" : "goldOutline"}
                  onClick={() => onChange({ theme: t })}
                >
                  {t === "dark" ? "Dark green" : "Light ivory"}
                </Button>
              ))}
            </div>
            <LayoutPicker value={card.layout} onChange={(id) => onChange({ layout: id })} />
            <div className="rounded-xl border border-primary/30 bg-primary/[0.07] p-3 text-xs">
              {readyToPublish ? (
                <span className="flex items-center gap-2">
                  <PartyPopper className="h-4 w-4 text-primary" /> Your Glinkit is ready — publish it
                  and start sharing.
                </span>
              ) : (
                <span>
                  Still needed before publishing: {essentialPending.map((i) => i.label).join(", ")}.
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {step > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
          </Button>
        )}
        {!last ? (
          <Button size="sm" variant="gold" onClick={() => setStep(step + 1)}>
            Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="gold" disabled={!readyToPublish || publishing} onClick={onPublish}>
            {publishing ? "Publishing…" : "Publish my Glinkit"}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Skip to full editor
        </Button>
      </div>
    </section>
  );
}
