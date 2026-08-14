import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, MessageCircle, Phone, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  LEAD_STATUSES,
  STATUS_CLASSES,
  STATUS_LABELS,
  interestLabel,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { SOURCE_LABELS, type TrafficSource } from "@/lib/analytics";
import { waLink } from "@/lib/cards";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60";

export function LeadsCrm({ cardId }: { cardId: string }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: leads = [] } = useQuery({
    queryKey: ["card-leads", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_leads")
        .select("*")
        .eq("card_id", cardId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Lead> }) => {
      const { error } = await supabase.from("card_leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card-leads", cardId] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update lead"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("card_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead deleted");
      void qc.invalidateQueries({ queryKey: ["card-leads", cardId] });
    },
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (Boolean(l.archived) !== showArchived) return false;
      if (status !== "all" && l.status !== status) return false;
      if (!needle) return true;
      return [l.name, l.company, l.designation, l.phone, l.email, l.message]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [leads, q, status, showArchived]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: 0 };
    for (const l of leads) {
      if (l.archived) continue;
      base["all"] = (base["all"] ?? 0) + 1;
      base[l.status] = (base[l.status] ?? 0) + 1;
    }
    return base;
  }, [leads]);

  return (
    <section className="surface-panel mt-6 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
          <Users className="h-4.5 w-4.5 text-primary" /> Leads
        </h2>
        <Button
          size="sm"
          variant={showArchived ? "gold" : "ghost"}
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="mr-1.5 h-3.5 w-3.5" />
          {showArchived ? "Viewing archive" : "Archive"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="relative flex-1 min-w-48">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search name, company, phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </span>
        {(["all", ...LEAD_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              status === s
                ? "border-primary bg-primary/15 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((l) => {
          const open = openId === l.id;
          const st = (LEAD_STATUSES as readonly string[]).includes(l.status)
            ? (l.status as LeadStatus)
            : "new";
          return (
            <li key={l.id} className="rounded-2xl border border-border bg-primary/[0.03]">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : l.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="font-display block truncate text-sm font-semibold">
                    {l.name || "Unnamed"}
                    {l.company ? ` · ${l.company}` : ""}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {interestLabel(l.interest)} ·{" "}
                    {SOURCE_LABELS[l.source as TrafficSource] ?? l.source} ·{" "}
                    {new Date(l.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${STATUS_CLASSES[st]}`}
                >
                  {STATUS_LABELS[st]}
                </span>
              </button>

              {open && (
                <div className="space-y-3 border-t border-border/70 px-4 py-4">
                  <div className="grid gap-1 text-xs text-muted-foreground">
                    {l.designation && <p>{l.designation}</p>}
                    {l.phone && <p>Phone: {l.phone}</p>}
                    {l.email && <p>Email: {l.email}</p>}
                    {l.message && <p className="whitespace-pre-line">“{l.message}”</p>}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {LEAD_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update.mutate({ id: l.id, patch: { status: s } })}
                        className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                          st === s
                            ? STATUS_CLASSES[s]
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Follow-up date
                    </span>
                    <input
                      type="date"
                      className={inputCls}
                      value={l.follow_up_date ?? ""}
                      onChange={(e) =>
                        update.mutate({
                          id: l.id,
                          patch: { follow_up_date: e.target.value || null },
                        })
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Private notes
                    </span>
                    <textarea
                      className={inputCls}
                      rows={3}
                      defaultValue={l.notes ?? ""}
                      maxLength={2000}
                      placeholder="Call summary, next step…"
                      onBlur={(e) => {
                        if (e.target.value !== (l.notes ?? ""))
                          update.mutate({ id: l.id, patch: { notes: e.target.value } });
                      }}
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {l.phone && (
                      <>
                        <Button size="sm" variant="gold" asChild>
                          <a
                            href={waLink(
                              l.phone,
                              `Hi ${l.name}, thanks for connecting on my Glinkit profile.`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </Button>
                        <Button size="sm" variant="goldOutline" asChild>
                          <a href={`tel:${l.phone}`}>
                            <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
                          </a>
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        update.mutate({ id: l.id, patch: { archived: !l.archived } })
                      }
                    >
                      <Archive className="mr-1.5 h-3.5 w-3.5" />
                      {l.archived ? "Restore" : "Archive"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this lead permanently?")) remove.mutate(l.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {showArchived ? "Nothing archived yet." : "No leads match this view yet."}
          </li>
        )}
      </ul>
    </section>
  );
}