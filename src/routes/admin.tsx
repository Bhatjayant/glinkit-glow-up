import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Card } from "@/lib/cards";

const title = "Admin — Glinkit cards";
const description = "Admin panel to manage every Glinkit digital visiting card and enquiry.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: cards = [] } = useQuery({
    queryKey: ["admin-cards"],
    enabled: Boolean(user) && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Card[];
    },
  });

  const { data: leadCount = 0 } = useQuery({
    queryKey: ["admin-lead-count"],
    enabled: Boolean(user) && isAdmin,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("card_leads")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (card: Card) => {
      const { error } = await supabase
        .from("cards")
        .update({ published: !card.published })
        .eq("id", card.id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-cards"] }),
    onError: () => toast.error("Could not update card"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Card deleted");
      void qc.invalidateQueries({ queryKey: ["admin-cards"] });
    },
  });

  if (!loading && user && !isAdmin) {
    return (
      <div className="px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account doesn't have the admin role.
        </p>
        <Button variant="goldOutline" className="mt-6" asChild>
          <Link to="/dashboard">Back to my cards</Link>
        </Button>
      </div>
    );
  }

  const published = cards.filter((c) => c.published).length;
  const views = cards.reduce((sum, c) => sum + c.view_count, 0);

  return (
    <div className="glow-emerald px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Admin panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">All cards across every account.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Cards", value: cards.length },
            { label: "Published", value: published },
            { label: "Total views", value: views },
            { label: "Enquiries", value: leadCount },
          ].map((s) => (
            <div key={s.label} className="surface-panel rounded-2xl p-5">
              <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <ul className="mt-8 space-y-3">
          {cards.map((c) => (
            <li
              key={c.id}
              className="surface-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5"
            >
              <div>
                <p className="font-display font-semibold">{c.display_name || "Untitled"}</p>
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
                <Button size="sm" variant="ghost" onClick={() => togglePublish.mutate(c)}>
                  {c.published ? "Unpublish" : "Publish"}
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
        </ul>
      </div>
    </div>
  );
}