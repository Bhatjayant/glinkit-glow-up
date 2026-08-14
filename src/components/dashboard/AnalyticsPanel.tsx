import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SOURCE_LABELS, type EventType, type TrafficSource } from "@/lib/analytics";

type Row = { event_type: string; source: string; created_at: string };

const HEADLINE: { key: EventType; label: string }[] = [
  { key: "view", label: "Profile views" },
  { key: "save_contact", label: "Contact saves" },
  { key: "connect", label: "Connections" },
  { key: "whatsapp", label: "WhatsApp clicks" },
  { key: "call", label: "Call clicks" },
  { key: "email", label: "Email clicks" },
  { key: "website", label: "Website clicks" },
  { key: "social", label: "Social clicks" },
  { key: "product_click", label: "Product clicks" },
  { key: "booking", label: "Booking requests" },
  { key: "payment", label: "Payment clicks" },
  { key: "qr", label: "QR opens" },
];

export function AnalyticsPanel({ cardId }: { cardId: string }) {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["card-events", cardId],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data, error } = await supabase
        .from("card_events")
        .select("event_type, source, created_at")
        .eq("card_id", cardId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data as Row[];
    },
  });

  const { byType, bySource, byDay, maxDay } = useMemo(() => {
    const t: Record<string, number> = {};
    const s: Record<string, number> = {};
    const d: Record<string, number> = {};
    for (let i = 13; i >= 0; i -= 1) {
      const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      d[day] = 0;
    }
    for (const r of rows) {
      t[r.event_type] = (t[r.event_type] ?? 0) + 1;
      s[r.source] = (s[r.source] ?? 0) + 1;
      const day = r.created_at.slice(0, 10);
      if (day in d) d[day] = (d[day] ?? 0) + 1;
    }
    const days = Object.entries(d);
    return {
      byType: t,
      bySource: Object.entries(s).sort((a, b) => b[1] - a[1]),
      byDay: days,
      maxDay: Math.max(1, ...days.map(([, v]) => v)),
    };
  }, [rows]);

  const views = byType["view"] ?? 0;
  // Only show rates once there is enough traffic for them to mean anything.
  const rate = (n: number) => (views >= 20 ? `${Math.round((n / views) * 1000) / 10}%` : null);
  const saveRate = rate(byType["save_contact"] ?? 0);
  const connectRate = rate(byType["connect"] ?? 0);

  return (
    <section className="surface-panel mt-6 rounded-2xl p-6">
      <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="h-4.5 w-4.5 text-primary" /> Analytics
        <span className="text-xs font-normal text-muted-foreground">· last 30 days</span>
      </h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading activity…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No activity recorded yet. Share your profile link or QR — every view, tap and connect
          request will appear here.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {HEADLINE.filter((h) => (byType[h.key] ?? 0) > 0).map((h) => (
              <div key={h.key} className="rounded-xl border border-primary/20 bg-primary/[0.05] p-3">
                <p className="font-display text-xl font-bold text-primary">{byType[h.key]}</p>
                <p className="text-[11px] text-muted-foreground">{h.label}</p>
              </div>
            ))}
            {saveRate && (
              <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-3">
                <p className="font-display text-xl font-bold text-primary">{saveRate}</p>
                <p className="text-[11px] text-muted-foreground">Views that saved your contact</p>
              </div>
            )}
            {connectRate && (
              <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-3">
                <p className="font-display text-xl font-bold text-primary">{connectRate}</p>
                <p className="text-[11px] text-muted-foreground">Views that connected</p>
              </div>
            )}
          </div>
          {views > 0 && views < 20 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Conversion rates appear once you cross 20 profile views — until then the raw counts
              above are the honest picture.
            </p>
          )}

          <p className="mt-6 mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Last 14 days
          </p>
          <div className="flex h-24 items-end gap-1">
            {byDay.map(([day, v]) => (
              <span
                key={day}
                title={`${day}: ${v} interactions`}
                className="flex-1 rounded-t bg-primary/60"
                style={{ height: `${Math.max(3, (v / maxDay) * 100)}%` }}
              />
            ))}
          </div>

          <p className="mt-6 mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Traffic sources
          </p>
          <ul className="space-y-1.5">
            {bySource.map(([src, count]) => (
              <li key={src} className="flex items-center gap-3 text-xs">
                <span className="w-24 shrink-0 text-muted-foreground">
                  {SOURCE_LABELS[src as TrafficSource] ?? src}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(count / rows.length) * 100}%` }}
                  />
                </span>
                <span className="w-8 text-right">{count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}