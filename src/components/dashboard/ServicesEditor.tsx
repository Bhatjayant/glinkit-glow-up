import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AiImprove } from "@/components/dashboard/AiImprove";
import type { Service } from "@/lib/cards";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

export function useServices(cardId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["card-services", cardId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_services")
        .select("*")
        .eq("card_id", cardId)
        .order("sort_order");
      if (error) throw error;
      return data as Service[];
    },
  });
}

/** "What I do" — the owner's professional capabilities, shown above products. */
export function ServicesEditor({
  cardId,
  enabled,
  context,
}: {
  cardId: string;
  enabled: boolean;
  context: string;
}) {
  const qc = useQueryClient();
  const { data: services = [] } = useServices(cardId, enabled);
  const refresh = () => void qc.invalidateQueries({ queryKey: ["card-services", cardId] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("card_services")
        .insert({ card_id: cardId, title: "New capability", sort_order: services.length });
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: () => toast.error("Could not add that"),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Service> }) => {
      const { error } = await supabase.from("card_services").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("card_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const move = (index: number, dir: -1 | 1) => {
    const a = services[index];
    const b = services[index + dir];
    if (!a || !b) return;
    void update.mutateAsync({ id: a.id, patch: { sort_order: b.sort_order } });
    void update.mutateAsync({ id: b.id, patch: { sort_order: a.sort_order } });
  };

  return (
    <section className="surface-panel mt-6 rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">What I do</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Three capabilities is the sweet spot — visitors understand your value instantly.
          </p>
        </div>
        <Button size="sm" variant="goldOutline" onClick={() => add.mutate()}>
          <Plus className="mr-1.5 h-4 w-4" /> Add
        </Button>
      </div>

      <ul className="mt-4 space-y-4">
        {services.map((s, i) => (
          <li key={s.id} className="rounded-2xl border border-border p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <input
                className={inputCls}
                placeholder="Business Strategy"
                maxLength={120}
                defaultValue={s.title}
                onBlur={(e) => update.mutate({ id: s.id, patch: { title: e.target.value } })}
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  className="text-muted-foreground hover:text-primary disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <span className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">Short description</span>
                <AiImprove
                  field="product"
                  text={s.description ?? ""}
                  context={`${s.title} — ${context}`}
                  onResult={(v) =>
                    update.mutate({ id: s.id, patch: { description: v.slice(0, 400) } })
                  }
                />
              </span>
              <textarea
                className={inputCls}
                rows={2}
                maxLength={400}
                placeholder="Helping businesses identify and execute growth opportunities."
                defaultValue={s.description}
                onBlur={(e) => update.mutate({ id: s.id, patch: { description: e.target.value } })}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input
                className={inputCls}
                placeholder="Image URL (optional)"
                maxLength={500}
                defaultValue={s.image_url ?? ""}
                onBlur={(e) => update.mutate({ id: s.id, patch: { image_url: e.target.value } })}
              />
              <input
                className={inputCls}
                placeholder="Button text (optional)"
                maxLength={40}
                defaultValue={s.cta_label}
                onBlur={(e) => update.mutate({ id: s.id, patch: { cta_label: e.target.value } })}
              />
              <input
                className={inputCls}
                placeholder="Button link (optional)"
                maxLength={500}
                defaultValue={s.cta_url}
                onBlur={(e) => update.mutate({ id: s.id, patch: { cta_url: e.target.value } })}
              />
            </div>
          </li>
        ))}
        {services.length === 0 && (
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Nothing here yet — add your first
            capability.
          </li>
        )}
      </ul>
    </section>
  );
}
