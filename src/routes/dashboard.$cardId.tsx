import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { slugify, type Card, type Media, type Product } from "@/lib/cards";

export const Route = createFileRoute("/dashboard/$cardId")({
  head: () => ({
    meta: [
      { title: "Edit card — Glinkit dashboard" },
      { name: "description", content: "Edit your Glinkit digital visiting card content." },
      { property: "og:title", content: "Edit card — Glinkit dashboard" },
      { property: "og:description", content: "Edit your Glinkit digital visiting card." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditCardPage,
});

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

const cardSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Link must be at least 3 characters")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  display_name: z.string().trim().min(1, "Add a name").max(100),
  job_title: z.string().trim().max(100),
  company: z.string().trim().max(100),
  tagline: z.string().trim().max(160),
  about: z.string().trim().max(2000),
  photo_url: z.string().trim().max(500),
  logo_url: z.string().trim().max(500),
  phone: z.string().trim().max(20),
  whatsapp: z.string().trim().max(20),
  email: z.string().trim().max(255),
  website: z.string().trim().max(300),
  address: z.string().trim().max(300),
  maps_url: z.string().trim().max(500),
  upi_id: z.string().trim().max(120),
  bank_details: z.string().trim().max(500),
  theme: z.enum(["dark", "light"]),
});

function Field({
  label,
  value,
  onChange,
  textarea,
  max,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  max?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          className={inputCls}
          rows={4}
          value={value}
          maxLength={max ?? 2000}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputCls}
          value={value}
          maxLength={max ?? 200}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function EditCardPage() {
  const { cardId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Card | null>(null);
  const [autoStatus, setAutoStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data } = useQuery({
    queryKey: ["card", cardId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("id", cardId).single();
      if (error) throw error;
      return data as Card;
    },
  });

  useEffect(() => {
    if (data && !dirtyRef.current) setForm(data);
  }, [data]);

  const { data: products = [] } = useQuery({
    queryKey: ["card-products", cardId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_products")
        .select("*")
        .eq("card_id", cardId)
        .order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: media = [] } = useQuery({
    queryKey: ["card-media", cardId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_media")
        .select("*")
        .eq("card_id", cardId)
        .order("sort_order");
      if (error) throw error;
      return data as Media[];
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["card-leads", cardId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_leads")
        .select("*")
        .eq("card_id", cardId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as {
        id: string;
        name: string;
        phone: string;
        email: string;
        message: string;
        created_at: string;
      }[];
    },
  });

  const save = useMutation({
    mutationFn: async (publish?: boolean) => {
      if (!form) return;
      const parsed = cardSchema.safeParse({
        slug: form.slug,
        display_name: form.display_name,
        job_title: form.job_title ?? "",
        company: form.company ?? "",
        tagline: form.tagline ?? "",
        about: form.about ?? "",
        photo_url: form.photo_url ?? "",
        logo_url: form.logo_url ?? "",
        phone: form.phone ?? "",
        whatsapp: form.whatsapp ?? "",
        email: form.email ?? "",
        website: form.website ?? "",
        address: form.address ?? "",
        maps_url: form.maps_url ?? "",
        upi_id: form.upi_id ?? "",
        bank_details: form.bank_details ?? "",
        theme: form.theme === "light" ? "light" : "dark",
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check your details");
      const { error } = await supabase
        .from("cards")
        .update({
          ...parsed.data,
          published: publish ?? form.published,
        })
        .eq("id", cardId);
      if (error) throw error;
      return publish ?? form.published;
    },
    onSuccess: (published) => {
      toast.success(published ? "Saved and published" : "Saved");
      dirtyRef.current = false;
      setAutoStatus("saved");
      void qc.invalidateQueries({ queryKey: ["card", cardId] });
      void qc.invalidateQueries({ queryKey: ["my-cards"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const autoSave = useCallback(
    async (current: Card) => {
      const parsed = cardSchema.safeParse({
        slug: current.slug,
        display_name: current.display_name,
        job_title: current.job_title ?? "",
        company: current.company ?? "",
        tagline: current.tagline ?? "",
        about: current.about ?? "",
        photo_url: current.photo_url ?? "",
        logo_url: current.logo_url ?? "",
        phone: current.phone ?? "",
        whatsapp: current.whatsapp ?? "",
        email: current.email ?? "",
        website: current.website ?? "",
        address: current.address ?? "",
        maps_url: current.maps_url ?? "",
        upi_id: current.upi_id ?? "",
        bank_details: current.bank_details ?? "",
        theme: current.theme === "light" ? "light" : "dark",
      });
      if (!parsed.success) return;
      setAutoStatus("saving");
      const { error } = await supabase.from("cards").update(parsed.data).eq("id", cardId);
      if (error) {
        setAutoStatus("error");
        return;
      }
      dirtyRef.current = false;
      setAutoStatus("saved");
      void qc.invalidateQueries({ queryKey: ["my-cards"] });
    },
    [cardId, qc],
  );

  useEffect(() => {
    if (!form || !dirtyRef.current) return;
    const t = setTimeout(() => void autoSave(form), 1200);
    return () => clearTimeout(t);
  }, [form, autoSave]);

  const addProduct = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("card_products").insert({
        card_id: cardId,
        name: "New item",
        sort_order: products.length,
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card-products", cardId] }),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Product> }) => {
      const { error } = await supabase.from("card_products").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card-products", cardId] }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("card_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card-products", cardId] }),
  });

  const [newMedia, setNewMedia] = useState({ kind: "image", url: "", title: "" });
  const addMedia = useMutation({
    mutationFn: async () => {
      const url = newMedia.url.trim();
      if (!/^https?:\/\//.test(url)) throw new Error("Enter a valid https URL");
      const { error } = await supabase.from("card_media").insert({
        card_id: cardId,
        kind: newMedia.kind,
        url,
        title: newMedia.title.trim().slice(0, 120),
        sort_order: media.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMedia({ kind: "image", url: "", title: "" });
      void qc.invalidateQueries({ queryKey: ["card-media", cardId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add media"),
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("card_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["card-media", cardId] }),
  });

  if (!form) {
    return <div className="px-5 py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  const set = (patch: Partial<Card>) => {
    dirtyRef.current = true;
    setAutoStatus("saving");
    setForm({ ...form, ...patch });
  };

  return (
    <div className="glow-emerald px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All cards
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Edit card</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {autoStatus === "saving"
                ? "Auto-saving…"
                : autoStatus === "saved"
                  ? "All changes saved automatically"
                  : autoStatus === "error"
                    ? "Auto-save failed — press Save"
                    : "Changes save automatically as you type"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/$slug" params={{ slug: form.slug }}>
                Preview
              </Link>
            </Button>
            <Button variant="goldOutline" onClick={() => save.mutate(undefined)}>
              Save
            </Button>
            <Button variant="gold" onClick={() => save.mutate(!form.published)}>
              {form.published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>

        <section className="surface-panel mt-8 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Card appearance</p>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={(form.theme ?? "dark") === t ? "gold" : "goldOutline"}
                  onClick={() => set({ theme: t })}
                >
                  {t === "dark" ? "Dark green" : "Light ivory"}
                </Button>
              ))}
            </div>
          </div>
          <Field
            label="Card link (glinkit.com/…)"
            value={form.slug}
            max={40}
            onChange={(v) => set({ slug: slugify(v) })}
          />
          <Field
            label="Full name"
            value={form.display_name}
            max={100}
            onChange={(v) => set({ display_name: v })}
          />
          <Field
            label="Job title"
            value={form.job_title ?? ""}
            max={100}
            onChange={(v) => set({ job_title: v })}
          />
          <Field
            label="Company"
            value={form.company ?? ""}
            max={100}
            onChange={(v) => set({ company: v })}
          />
          <Field
            label="Tagline"
            value={form.tagline ?? ""}
            max={160}
            onChange={(v) => set({ tagline: v })}
          />
          <Field
            label="About"
            textarea
            value={form.about ?? ""}
            max={2000}
            onChange={(v) => set({ about: v })}
          />
          <Field
            label="Photo URL"
            value={form.photo_url ?? ""}
            max={500}
            onChange={(v) => set({ photo_url: v })}
          />
          <Field
            label="Logo URL"
            value={form.logo_url ?? ""}
            max={500}
            onChange={(v) => set({ logo_url: v })}
          />
        </section>

        <section className="surface-panel mt-6 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Contact</h2>
          <Field label="Phone" value={form.phone ?? ""} max={20} onChange={(v) => set({ phone: v })} />
          <Field
            label="WhatsApp number"
            value={form.whatsapp ?? ""}
            max={20}
            onChange={(v) => set({ whatsapp: v })}
          />
          <Field label="Email" value={form.email ?? ""} max={255} onChange={(v) => set({ email: v })} />
          <Field
            label="Website"
            value={form.website ?? ""}
            max={300}
            onChange={(v) => set({ website: v })}
          />
          <Field
            label="Address"
            value={form.address ?? ""}
            max={300}
            onChange={(v) => set({ address: v })}
          />
          <Field
            label="Google Maps link"
            value={form.maps_url ?? ""}
            max={500}
            onChange={(v) => set({ maps_url: v })}
          />
        </section>

        <section className="surface-panel mt-6 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Payments</h2>
          <Field
            label="UPI ID"
            value={form.upi_id ?? ""}
            max={120}
            placeholder="name@bank"
            onChange={(v) => set({ upi_id: v })}
          />
          <Field
            label="Bank details (shown as text)"
            textarea
            value={form.bank_details ?? ""}
            max={500}
            onChange={(v) => set({ bank_details: v })}
          />
        </section>

        <section className="surface-panel mt-6 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Products & services</h2>
            <Button size="sm" variant="goldOutline" onClick={() => addProduct.mutate()}>
              <Plus className="mr-1.5 h-4 w-4" /> Add
            </Button>
          </div>
          <ul className="mt-4 space-y-4">
            {products.map((p) => (
              <li key={p.id} className="rounded-2xl border border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Name"
                    value={p.name}
                    max={120}
                    onChange={(v) => updateProduct.mutate({ id: p.id, patch: { name: v } })}
                  />
                  <Field
                    label="Image URL"
                    value={p.image_url ?? ""}
                    max={500}
                    onChange={(v) => updateProduct.mutate({ id: p.id, patch: { image_url: v } })}
                  />
                  <Field
                    label="MRP (₹)"
                    value={p.mrp?.toString() ?? ""}
                    max={12}
                    onChange={(v) =>
                      updateProduct.mutate({ id: p.id, patch: { mrp: v ? Number(v) : null } })
                    }
                  />
                  <Field
                    label="Offer price (₹)"
                    value={p.offer_price?.toString() ?? ""}
                    max={12}
                    onChange={(v) =>
                      updateProduct.mutate({
                        id: p.id,
                        patch: { offer_price: v ? Number(v) : null },
                      })
                    }
                  />
                </div>
                <div className="mt-3">
                  <Field
                    label="Description"
                    textarea
                    value={p.description ?? ""}
                    max={500}
                    onChange={(v) => updateProduct.mutate({ id: p.id, patch: { description: v } })}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.allow_buy}
                      onChange={(e) =>
                        updateProduct.mutate({ id: p.id, patch: { allow_buy: e.target.checked } })
                      }
                    />
                    Show Buy now (UPI)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.allow_enquiry}
                      onChange={(e) =>
                        updateProduct.mutate({
                          id: p.id,
                          patch: { allow_enquiry: e.target.checked },
                        })
                      }
                    />
                    Show Enquire (WhatsApp)
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => deleteProduct.mutate(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
            {products.length === 0 && (
              <li className="text-sm text-muted-foreground">No items yet.</li>
            )}
          </ul>
        </section>

        <section className="surface-panel mt-6 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Gallery, videos & brochures</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <select
              className={inputCls}
              value={newMedia.kind}
              onChange={(e) => setNewMedia({ ...newMedia, kind: e.target.value })}
            >
              <option value="image">Image</option>
              <option value="youtube">YouTube</option>
              <option value="pdf">PDF</option>
            </select>
            <input
              className={`${inputCls} sm:col-span-2`}
              placeholder="https://…"
              maxLength={500}
              value={newMedia.url}
              onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Title"
              maxLength={120}
              value={newMedia.title}
              onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
            />
          </div>
          <Button size="sm" variant="goldOutline" className="mt-3" onClick={() => addMedia.mutate()}>
            <Plus className="mr-1.5 h-4 w-4" /> Add media
          </Button>
          <ul className="mt-4 space-y-2">
            {media.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm"
              >
                <span className="truncate">
                  <span className="text-primary">[{m.kind}]</span> {m.title || m.url}
                </span>
                <Button size="sm" variant="ghost" onClick={() => deleteMedia.mutate(m.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-panel mt-6 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Enquiries ({leads.length})</h2>
          <ul className="mt-4 space-y-2">
            {leads.map((l) => (
              <li key={l.id} className="rounded-xl border border-border p-3 text-sm">
                <p className="font-medium">
                  {l.name} · {l.phone}
                </p>
                {l.email && <p className="text-xs text-muted-foreground">{l.email}</p>}
                {l.message && <p className="mt-1 text-xs text-muted-foreground">{l.message}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
            {leads.length === 0 && (
              <li className="text-sm text-muted-foreground">No enquiries yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}