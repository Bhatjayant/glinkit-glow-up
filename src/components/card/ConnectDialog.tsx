import { useState } from "react";
import { CheckCircle2, Download, Handshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { resolveSource, trackEvent } from "@/lib/analytics";
import { LEAD_INTERESTS } from "@/lib/leads";
import type { Card } from "@/lib/cards";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

const schema = z
  .object({
    name: z.string().trim().min(2, "Please add your name").max(120),
    company: z.string().trim().max(120),
    designation: z.string().trim().max(120),
    phone: z.string().trim().max(20),
    email: z.string().trim().max(160),
    message: z.string().trim().max(1500),
    interest: z.string().trim().max(30),
  })
  .refine((v) => v.phone.length >= 6 || /.+@.+\..+/.test(v.email), {
    message: "Add a mobile number or a valid email",
    path: ["phone"],
  });

const empty = {
  name: "",
  company: "",
  designation: "",
  phone: "",
  email: "",
  message: "",
  interest: "general",
};

export function ConnectDialog({
  card,
  slug,
  open,
  onOpenChange,
  onSaveContact,
}: {
  card: Card;
  slug: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaveContact: () => void;
}) {
  const [form, setForm] = useState(empty);
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (patch: Partial<typeof empty>) => setForm({ ...form, ...patch });

  const submit = async () => {
    if (honeypot.trim()) {
      setDone(true);
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("card_leads").insert({
      card_id: card.id,
      ...parsed.data,
      source: resolveSource(slug),
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("already received")
          ? "We already have your details — thank you!"
          : "Could not send right now. Please try WhatsApp.",
      );
      return;
    }
    void trackEvent(card.id, slug, "connect", parsed.data.interest);
    setForm(empty);
    setDone(true);
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setDone(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[88vh] max-w-md overflow-y-auto">
        {done ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h2 className="font-display mt-3 text-lg font-semibold">You're connected</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {card.display_name} now has your details and will get back to you shortly. Keep their
              contact too.
            </p>
            <Button
              variant="gold"
              className="mt-5 w-full"
              onClick={() => {
                onSaveContact();
                close(false);
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Save {card.display_name.split(" ")[0]}'s contact
            </Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => close(false)}>
              Back to profile
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <Handshake className="h-4.5 w-4.5 text-primary" />
                Exchange contact details
              </DialogTitle>
              <DialogDescription>
                Share your details and you'll have{" "}
                {card.display_name.split(" ")[0] || card.display_name}'s contact too — no app or
                sign-up needed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <input
                className={inputCls}
                placeholder="Your name*"
                autoComplete="name"
                maxLength={120}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputCls}
                  placeholder="Company"
                  maxLength={120}
                  value={form.company}
                  onChange={(e) => set({ company: e.target.value })}
                />
                <input
                  className={inputCls}
                  placeholder="Designation"
                  maxLength={120}
                  value={form.designation}
                  onChange={(e) => set({ designation: e.target.value })}
                />
              </div>
              <input
                className={inputCls}
                placeholder="Mobile"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Email"
                inputMode="email"
                autoComplete="email"
                maxLength={160}
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
              />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  I'm interested in
                </span>
                <select
                  className={inputCls}
                  value={form.interest}
                  onChange={(e) => set({ interest: e.target.value })}
                >
                  {LEAD_INTERESTS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                className={inputCls}
                rows={3}
                placeholder="Message (optional)"
                maxLength={1500}
                value={form.message}
                onChange={(e) => set({ message: e.target.value })}
              />
              {/* honeypot — hidden from humans */}
              <input
                aria-hidden
                tabIndex={-1}
                autoComplete="off"
                className="pointer-events-none absolute h-0 w-0 opacity-0"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
              <Button variant="gold" className="w-full" disabled={busy} onClick={submit}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {busy ? "Sharing…" : "Exchange details"}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Your details go only to {card.display_name}. Never shared with anyone else.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}