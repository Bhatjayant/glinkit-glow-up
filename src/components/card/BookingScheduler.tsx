import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { parseSlots, prettyDate, prettyTime, waLink, type Card } from "@/lib/cards";

const schema = z.object({
  name: z.string().trim().min(2, "Add your name").max(100),
  phone: z.string().trim().min(6, "Add a phone number").max(20),
  email: z.string().trim().max(255),
  purpose: z.string().trim().max(500),
});

const inputCls =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/60";

function nextDays(count: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  }
  return out;
}

export function BookingScheduler({ card, slug }: { card: Card; slug: string }) {
  const days = useMemo(() => nextDays(14), []);
  const slots = useMemo(() => parseSlots(card.booking_slots), [card.booking_slots]);
  const [date, setDate] = useState(days[0] ?? "");
  const [time, setTime] = useState(slots[0] ?? "");
  const [form, setForm] = useState({ name: "", phone: "", email: "", purpose: "" });
  const [busy, setBusy] = useState(false);

  const { data: blocked = [] } = useQuery({
    queryKey: ["card-blocked", card.id],
    enabled: Boolean(card.booking_enabled),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("card_blocked_days", { _card_id: card.id });
      if (error) throw error;
      return (data ?? []) as string[];
    },
  });

  const { data: taken = [], refetch: refetchTaken } = useQuery({
    queryKey: ["card-taken", card.id, date],
    enabled: Boolean(card.booking_enabled && date),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("card_taken_slots", {
        _card_id: card.id,
        _date: date,
      });
      if (error) throw error;
      return (data ?? []) as string[];
    },
  });

  const openDays = useMemo(() => days.filter((d) => !blocked.includes(d)), [days, blocked]);

  useEffect(() => {
    if (date && blocked.includes(date)) setDate(openDays[0] ?? "");
  }, [blocked, date, openDays]);

  useEffect(() => {
    if (time && taken.includes(time)) {
      setTime(slots.find((s) => !taken.includes(s)) ?? "");
    }
  }, [taken, time, slots]);

  if (!card.booking_enabled || slots.length === 0) return null;

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    if (!date || !time) {
      toast.error("Pick a date and time");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("card_bookings").insert({
      card_id: card.id,
      ...parsed.data,
      slot_date: date,
      slot_time: time,
    });
    setBusy(false);
    if (error) {
      void refetchTaken();
      toast.error(
        error.code === "23505" || error.message.toLowerCase().includes("duplicate")
          ? "That slot was just taken — please pick another time."
          : error.message.includes("not available") || error.message.includes("future date")
            ? error.message
            : "Could not send the request. Please try WhatsApp.",
      );
      return;
    }
    void trackEvent(card.id, slug, "booking", `${date} ${time}`);
    void refetchTaken();
    toast.success("Meeting request sent.");
    const text = `Hi ${card.display_name}, I'd like to book a meeting.\nDate: ${prettyDate(date)}\nTime: ${prettyTime(time)}\nName: ${parsed.data.name}\nPhone: ${parsed.data.phone}${parsed.data.purpose ? `\nPurpose: ${parsed.data.purpose}` : ""}`;
    if (card.whatsapp) window.open(waLink(card.whatsapp, text), "_blank", "noreferrer");
    setForm({ name: "", phone: "", email: "", purpose: "" });
  };

  return (
    <section className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
          Book a meeting
        </h2>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {card.booking_note?.trim()
          ? card.booking_note
          : `Pick a slot — ${card.booking_duration ?? 30} minutes with ${card.display_name}.`}
      </p>

      <p className="mt-4 mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Choose a day
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {openDays.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDate(d)}
            className={`shrink-0 rounded-xl border px-3 py-2 text-xs whitespace-nowrap transition-colors ${
              date === d
                ? "border-primary bg-primary/15 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            {prettyDate(d)}
          </button>
        ))}
      </div>

      <p className="mt-4 mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Choose a time
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => {
          const isTaken = taken.includes(s);
          return (
            <button
              key={s}
              type="button"
              disabled={isTaken}
              onClick={() => setTime(s)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                isTaken
                  ? "cursor-not-allowed border-border/60 text-muted-foreground line-through opacity-60"
                  : time === s
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border hover:border-primary/50"
              }`}
            >
              <Clock className="h-3 w-3" /> {prettyTime(s)}
            </button>
          );
        })}
        {slots.every((s) => taken.includes(s)) && (
          <p className="text-xs text-muted-foreground">
            All slots booked for this day — try another date.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <input
          className={inputCls}
          placeholder="Your name"
          maxLength={100}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="Phone"
          maxLength={20}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="Email (optional)"
          maxLength={255}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <textarea
          className={inputCls}
          rows={3}
          placeholder="What would you like to discuss? (optional)"
          maxLength={500}
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        />
        <Button variant="gold" className="w-full" disabled={busy} onClick={submit}>
          <MessageCircle className="mr-1.5 h-4 w-4" />
          {busy ? "Sending…" : "Request this slot"}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          You'll get a confirmation on WhatsApp.
        </p>
      </div>
    </section>
  );
}
