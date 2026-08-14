import { Check, Circle } from "lucide-react";
import { profileCompletion, type CompletionItem } from "@/lib/profile";
import type { Card, Media, Product } from "@/lib/cards";

/** Honest progress meter with the next best actions, not a vanity bar. */
export function CompletionCard({
  card,
  products,
  media,
  services,
  compact = false,
}: {
  card: Card;
  products?: Product[];
  media?: Media[];
  services?: { id: string }[];
  compact?: boolean;
}) {
  const { percent, pending, essential, recommended, optional, readyToPublish } = profileCompletion(card, {
    products: products ?? [],
    media: media ?? [],
    services: services ?? [],
  });

  const group = (title: string, note: string, list: CompletionItem[]) => (
    <div key={title}>
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {title} <span className="normal-case opacity-70">· {note}</span>
      </p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {list.map((i) => (
          <li key={i.label} className="flex items-start gap-2 text-xs">
            {i.done ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            ) : (
              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            )}
            <span className="min-w-0">
              <span className={i.done ? "text-muted-foreground" : ""}>{i.label}</span>
              {!i.done && (
                <span className="block text-[11px] text-muted-foreground">{i.hint}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className="surface-panel mt-6 rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="font-display truncate text-lg font-semibold">
          {readyToPublish ? "Your Glinkit is ready to share" : "Finish the essentials to go live"}
        </h2>
        <span className="font-display shrink-0 text-2xl font-bold text-primary">{percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {compact ? (
        <ul className="mt-4 space-y-1.5">
          {pending.slice(0, 3).map((i) => (
            <li key={i.label} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Circle className="mt-0.5 h-3 w-3 shrink-0 text-primary/60" />
              <span>
                <span className="text-foreground">{i.label}</span> — {i.hint}
              </span>
            </li>
          ))}
          {pending.length === 0 && (
            <li className="text-xs text-muted-foreground">
              Everything is in place. Share your link and watch the leads arrive.
            </li>
          )}
        </ul>
      ) : (
        <div className="mt-5 space-y-5">
          {group("Essential", "needed to publish", essential)}
          {group("Recommended", "helps you win business", recommended)}
          {group("Optional", "add these whenever you like", optional)}
        </div>
      )}
    </section>
  );
}
