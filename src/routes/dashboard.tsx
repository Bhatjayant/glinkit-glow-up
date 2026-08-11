import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { slugify, type Card } from "@/lib/cards";

const title = "My cards — Glinkit dashboard";
const description = "Create, edit and publish your Glinkit digital visiting cards.";

export const Route = createFileRoute("/dashboard")({
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
            <h1 className="font-display text-3xl font-bold">My cards</h1>
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