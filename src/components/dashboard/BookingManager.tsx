import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { prettyDate, prettyTime, waLink, type Booking, type Card } from "@/lib/cards";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

const DEFAULT_SLOTS = "10:00,11:00,12:00,15:00,16:00,17:00";

export function BookingManager({ card, enabled }: { card: Card; enabled: boolean }) {
  const qc = useQueryClient();
  const [local, setLocal] = useState({
    booking_enabled: Boolean(card.booking_enabled),
    booking_note: card.booking_note ?? "",
    booking_duration: card.booking_duration ?? 30,
    booking_slots: card.booking_slots ?? DEFAULT_SLOTS,
  });

  const saveSettings = useMutation({
    mutationFn: async (patch: Partial<typeof local>) => {
      const next = { ...local, ...patch };
      setLocal(next);
      const { error } = await supabase
        .from("cards")
        .update({
          booking_enabled: next.booking_enabled,
          booking_note: next.booking_note.slice(0, 300),
          booking_duration: Math.min(240, Math.max(5, Number(next.booking_duration) || 30)),
          booking_slots: next.booking_slots.slice(0, 300),
        })
        .eq("id", card.id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card", card.id] }),
    onError: () => toast.error("Could not save scheduler settings"),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["card-bookings", card.id],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_bookings")
        .select("*")
        .eq("card_id", card.id)
        .order("slot_date", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("card_bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card-bookings", card.id] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("card_bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card-bookings", card.id] }),
  });

  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <section className="surface-panel mt-6 space-y-5 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">
          Meeting scheduler{pending > 0 ? ` · ${pending} new` : ""}
        </h2>
        <Button
          size="sm"
          variant={local.booking_enabled ? "gold" : "goldOutline"}
          onClick={() => saveSettings.mutate({ booking_enabled: !local.booking_enabled })}
        >
          {local.booking_enabled ? "Booking on" : "Booking off"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Meeting length (minutes)
          </span>
          <input
            className={inputCls}
            value={local.booking_duration}
            maxLength={3}
            onChange={(e) => setLocal({ ...local, booking_duration: Number(e.target.value) || 0 })}
            onBlur={() => saveSettings.mutate({})}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Available times (24h, comma separated)
          </span>
          <input
            className={inputCls}
            value={local.booking_slots}
            maxLength={300}
            placeholder={DEFAULT_SLOTS}
            onChange={(e) => setLocal({ ...local, booking_slots: e.target.value })}
            onBlur={() => saveSettings.mutate({})}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Note shown above the slots
        </span>
        <input
          className={inputCls}
          value={local.booking_note}
          maxLength={300}
          placeholder="30-min intro call, Mon–Sat"
          onChange={(e) => setLocal({ ...local, booking_note: e.target.value })}
          onBlur={() => saveSettings.mutate({})}
        />
      </label>

      <ul className="space-y-2">
        {bookings.map((b) => (
          <li key={b.id} className="rounded-xl border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {prettyDate(b.slot_date)} · {prettyTime(b.slot_time)}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  b.status === "confirmed"
                    ? "bg-primary/15 text-primary"
                    : b.status === "declined"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {b.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {b.name} · {b.phone}
              {b.email ? ` · ${b.email}` : ""}
            </p>
            {b.purpose && <p className="mt-1 text-xs text-muted-foreground">{b.purpose}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="gold" asChild>
                <a
                  href={waLink(
                    b.phone,
                    `Hi ${b.name}, confirming our meeting on ${prettyDate(b.slot_date)} at ${prettyTime(b.slot_time)}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
              <Button
                size="sm"
                variant="goldOutline"
                onClick={() => setStatus.mutate({ id: b.id, status: "confirmed" })}
              >
                <Check className="mr-1 h-3.5 w-3.5" /> Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus.mutate({ id: b.id, status: "declined" })}
              >
                <X className="mr-1 h-3.5 w-3.5" /> Decline
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(b.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
        {bookings.length === 0 && (
          <li className="text-sm text-muted-foreground">No meeting requests yet.</li>
        )}
      </ul>
    </section>
  );
}
