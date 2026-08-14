import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarClock,
  ExternalLink,
  Eye,
  Handshake,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { slugify, type Card } from "@/lib/cards";
import { GrowthPanel } from "@/components/dashboard/GrowthPanel";
import { CompletionCard } from "@/components/dashboard/CompletionCard";
import { STATUS_CLASSES, STATUS_LABELS, interestLabel, type Lead, type LeadStatus } from "@/lib/leads";
import { SOURCE_LABELS, type TrafficSource } from "@/lib/analytics";

const title = "My cards — Glinkit dashboard";
const description = "Create, edit and publish your Glinkit digital visiting cards.";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: cards = [] } = useQuery({
    queryKey: ["my-cards", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Card[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const clean = name.trim();
      if (!clean) throw new Error("Enter a name for the card");
      const base = slugify(clean) || "card";
      const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase
        .from("cards")
        .insert({ owner_id: user!.id, slug, display_name: clean })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      setName("");
      void qc.invalidateQueries({ queryKey: ["my-cards"] });
      void navigate({ to: "/dashboard/$cardId", params: { cardId: id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create card"),
  });

  const cardIds = cards.map((c) => c.id);

  const primaryId = cards[0]?.id ?? "";
  const { data: content } = useQuery({
    queryKey: ["dash-content", primaryId],
    enabled: Boolean(primaryId),
    queryFn: async () => {
      const [services, products, media] = await Promise.all([
        supabase.from("card_services").select("id").eq("card_id", primaryId),
        supabase.from("card_products").select("id").eq("card_id", primaryId),
        supabase.from("card_media").select("id, kind").eq("card_id", primaryId),
      ]);
      return {
        services: (services.data ?? []) as { id: string }[],
        products: (products.data ?? []) as never[],
        media: (media.data ?? []) as never[],
      };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["dash-stats", cardIds.join(",")],
    enabled: cardIds.length > 0,
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const [events, leads, bookings] = await Promise.all([
        supabase
          .from("card_events")
          .select("event_type, source, created_at, card_id")
          .in("card_id", cardIds)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase
          .from("card_leads")
          .select("*")
          .in("card_id", cardIds)
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("card_bookings")
          .select("id, status, slot_date, slot_time, name, card_id")
          .in("card_id", cardIds)
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      if (events.error) throw events.error;
      if (leads.error) throw leads.error;
      if (bookings.error) throw bookings.error;
      const rows = (events.data ?? []) as {
        event_type: string;
        source: string;
        created_at: string;
      }[];
      const count = (type: string) => rows.filter((r) => r.event_type === type).length;
      const views = count("view");
      return {
        rows,
        views,
        saves: count("save_contact"),
        connects: count("connect"),
        engagement: views ? Math.round(((rows.length - views) / views) * 100) : 0,
        leads: (leads.data ?? []) as Lead[],
        bookings: (bookings.data ?? []) as {
          id: string;
          status: string;
          slot_date: string;
          slot_time: string;
          name: string;
        }[],
      };
    },
  });

  const primary = cards[0];
  const pendingBookings = (stats?.bookings ?? []).filter((b) => b.status === "pending").length;

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Card deleted");
      void qc.invalidateQueries({ queryKey: ["my-cards"] });
    },
  });

  return (
    <div className="glow-emerald px-5 py-14">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as {user?.email ?? "…"}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="goldOutline" asChild>
                <Link to="/admin">Admin panel</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                void navigate({ to: "/auth" });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>

        {cards.length > 0 && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Profile views", value: stats?.views ?? 0, icon: Eye },
                { label: "Contact saves", value: stats?.saves ?? 0, icon: Handshake },
                { label: "Connections", value: stats?.connects ?? 0, icon: Users },
                { label: "Leads", value: stats?.leads.length ?? 0, icon: Users },
                { label: "Bookings", value: stats?.bookings.length ?? 0, icon: CalendarClock },
                { label: "Engagement", value: `${stats?.engagement ?? 0}%`, icon: BarChart3 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="surface-panel rounded-2xl p-4"
                >
                  <s.icon className="h-4 w-4 text-primary" />
                  <p className="font-display mt-2 text-2xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Live activity from the last 30 days
              {pendingBookings > 0 ? ` · ${pendingBookings} booking request(s) awaiting your reply` : ""}
            </p>

            {primary && (
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" variant="gold" asChild>
                  <Link to="/dashboard/$cardId" params={{ cardId: primary.id }}>
                    Edit profile
                  </Link>
                </Button>
                <Button size="sm" variant="goldOutline" asChild>
                  <Link to="/$slug" params={{ slug: primary.slug }}>
                    View profile
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await navigator.clipboard?.writeText(`${window.location.origin}/${primary.slug}`);
                    toast.success("Profile link copied");
                  }}
                >
                  Share link
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/dashboard/$cardId" params={{ cardId: primary.id }} hash="leads">
                    Leads & analytics
                  </Link>
                </Button>
              </div>
            )}

            {primary && (
              <div className="grid gap-4 lg:grid-cols-2">
                <GrowthPanel
                  views={stats?.views ?? 0}
                  saves={stats?.saves ?? 0}
                  connects={stats?.connects ?? 0}
                  leads={stats?.leads.length ?? 0}
                  recommendation={
                    (stats?.views ?? 0) < 20
                      ? "Share your Glinkit link in your WhatsApp status and email signature — visibility comes before leads."
                      : (stats?.connects ?? 0) === 0
                        ? "Views are coming in but nobody is connecting. Sharpen your headline and set one clear primary action."
                        : (stats?.leads.length ?? 0) > 0
                          ? "You have live leads. Reply to the newest ones today and move them along in your CRM."
                          : "Momentum is good. Add a booking slot so interested visitors can meet you without messaging first."
                  }
                />
                <CompletionCard
                  card={primary}
                  compact
                  services={content?.services}
                  products={content?.products}
                  media={content?.media}
                />
              </div>
            )}

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <section className="surface-panel rounded-2xl p-5">
                <h2 className="font-display text-base font-semibold">Recent leads</h2>
                <ul className="mt-3 space-y-2">
                  {(stats?.leads ?? []).slice(0, 6).map((l) => {
                    const st = (l.status as LeadStatus) ?? "new";
                    return (
                      <li
                        key={l.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {l.name || "Unnamed"}
                            {l.company ? ` · ${l.company}` : ""}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {interestLabel(l.interest)} ·{" "}
                            {SOURCE_LABELS[l.source as TrafficSource] ?? l.source}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${STATUS_CLASSES[st] ?? ""}`}
                        >
                          {STATUS_LABELS[st] ?? l.status}
                        </span>
                      </li>
                    );
                  })}
                  {(stats?.leads.length ?? 0) === 0 && (
                    <li className="text-sm text-muted-foreground">
                      No leads yet — share your profile link or QR.
                    </li>
                  )}
                </ul>
              </section>

              <section className="surface-panel rounded-2xl p-5">
                <h2 className="font-display text-base font-semibold">Recent activity</h2>
                <ul className="mt-3 space-y-2">
                  {(stats?.rows ?? []).slice(0, 6).map((r, i) => (
                    <li
                      key={`${r.created_at}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm"
                    >
                      <span className="capitalize">{r.event_type.replace(/_/g, " ")}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {SOURCE_LABELS[r.source as TrafficSource] ?? r.source} ·{" "}
                        {new Date(r.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                  {(stats?.rows.length ?? 0) === 0 && (
                    <li className="text-sm text-muted-foreground">
                      No activity yet. Every view, tap and connect request will appear here.
                    </li>
                  )}
                </ul>
              </section>
            </div>
          </>
        )}

        <div className="surface-panel mt-8 flex flex-wrap items-center gap-3 rounded-2xl p-5">
          <input
            className="min-w-56 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
            placeholder="Name on the new card (e.g. Rohan Sharma)"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button variant="gold" disabled={create.isPending} onClick={() => create.mutate()}>
            <Plus className="mr-2 h-4 w-4" /> Create card
          </Button>
        </div>

        <ul className="mt-6 space-y-3">
          {cards.map((c) => (
            <li
              key={c.id}
              className="surface-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5"
            >
              <div>
                <p className="font-display font-semibold">{c.display_name || "Untitled card"}</p>
                <p className="text-xs text-muted-foreground">
                  /{c.slug} · {c.published ? "Published" : "Draft"} ·{" "}
                  <Eye className="inline h-3 w-3" /> {c.view_count}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="goldOutline" asChild>
                  <Link to="/dashboard/$cardId" params={{ cardId: c.id }}>
                    Edit
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/$slug" params={{ slug: c.slug }}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this card?")) remove.mutate(c.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
          {cards.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No cards yet. Create your first digital visiting card above.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}