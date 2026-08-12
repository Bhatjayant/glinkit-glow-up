import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  BadgeCheck,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { backgroundCss, getCardBackground } from "@/lib/card-backgrounds";
import {
  discountPct,
  fetchPublicCard,
  inr,
  upiPayUrl,
  vcard,
  waLink,
  type Card,
} from "@/lib/cards";

export const Route = createFileRoute("/$slug")({
  head: ({ params }) => {
    const t = `${params.slug} — Digital visiting card | Glinkit`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `Digital visiting card powered by Glinkit.` },
        { property: "og:title", content: t },
        { property: "og:description", content: "Digital visiting card powered by Glinkit." },
      ],
    };
  },
  component: PublicCardPage,
});

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(100),
  phone: z.string().trim().max(20),
  email: z.string().trim().max(255),
  message: z.string().trim().max(1000),
});

function ActionTile({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href?: string;
  icon: typeof Phone;
  label: string;
  onClick?: () => void;
}) {
  const cls =
    "group flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/[0.06] px-2 py-3 text-center text-[11px] font-medium transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/12 hover:shadow-[0_10px_24px_-14px_var(--primary)]";
  const inner = (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        <Icon className="h-4 w-4" />
      </span>
      <span className="leading-none">{label}</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  );
}

function SectionHeading({ icon: Icon, children }: { icon?: typeof Phone; children: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />}
      <h2 className="font-display text-[11px] font-semibold tracking-[0.18em] uppercase">
        {children}
      </h2>
      <span className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
    </div>
  );
}

function LeadForm({ card }: { card: Card }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("card_leads").insert({
      card_id: card.id,
      ...parsed.data,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not send. Please try WhatsApp.");
      return;
    }
    setForm({ name: "", phone: "", email: "", message: "" });
    toast.success("Enquiry sent.");
  };

  return (
    <section className="mt-8">
      <h2 className="font-display text-sm font-semibold tracking-wide uppercase">Send an enquiry</h2>
      <div className="mt-3 space-y-3">
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
          placeholder="What do you need?"
          maxLength={1000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <Button variant="gold" className="w-full" disabled={busy} onClick={submit}>
          Send enquiry
        </Button>
      </div>
    </section>
  );
}

function PublicCardPage() {
  const { slug } = Route.useParams();
  const [qrOpen, setQrOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["public-card", slug],
    queryFn: () => fetchPublicCard(slug),
  });

  useEffect(() => {
    if (data?.card) void supabase.rpc("increment_card_view", { _slug: slug });
  }, [data?.card?.id, slug]);

  if (isLoading) {
    return <div className="px-5 py-24 text-center text-sm text-muted-foreground">Loading card…</div>;
  }
  if (!data) throw notFound();

  const { card, products, media } = data;
  const images = media.filter((m) => m.kind === "image");
  const videos = media.filter((m) => m.kind === "youtube");
  const pdfs = media.filter((m) => m.kind === "pdf");
  const links = media.filter((m) => m.kind === "link");
  const highlights = media.filter((m) => m.kind === "highlight");
  const isLight = card.theme === "light";

  const contactLink = (text: string) => {
    if (card.whatsapp) return waLink(card.whatsapp, text);
    if (card.email)
      return `mailto:${card.email}?subject=${encodeURIComponent("Enquiry")}&body=${encodeURIComponent(text)}`;
    if (card.phone) return `tel:${card.phone}`;
    return null;
  };

  const buyLink = (name: string, amount: number | null) => {
    if (card.upi_id) return upiPayUrl(card.upi_id, card.display_name, amount, `${name} payment`);
    return contactLink(`Hi ${card.display_name}, I want to buy ${name}.`);
  };

  const saveContact = () => {
    const blob = new Blob([vcard(card)], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.slug}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const link = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: card.display_name, url: link });
        return;
      } catch {
        /* dismissed */
      }
    }
    await navigator.clipboard?.writeText(link);
    toast.success("Link copied");
  };

  return (
    <div
      className={`relative min-h-screen ${isLight ? "card-theme-light" : ""}`}
      style={{ background: backgroundCss(card.bg_style, isLight ? "light" : "dark") }}
    >
      {getCardBackground(card.bg_style).shimmer && (
        <div
          aria-hidden
          className="animate-mild-sheen pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(224,181,88,0.16) 50%, transparent 65%)",
          }}
        />
      )}
      <div className="relative mx-auto max-w-md px-4 py-10">
        <div className="surface-panel overflow-hidden rounded-[2rem]">
          <div className="relative h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
            {card.logo_url && (
              <img
                src={card.logo_url}
                alt={`${card.company} logo`}
                className="absolute top-4 left-5 h-8 w-auto rounded"
              />
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 h-20 w-20 overflow-hidden rounded-2xl border border-primary/40 bg-background">
              {card.photo_url ? (
                <img
                  src={card.photo_url}
                  alt={card.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-2xl font-bold text-primary">
                  {card.display_name.slice(0, 1) || "G"}
                </div>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold">{card.display_name}</h1>
            {card.job_title && <p className="mt-1 text-sm text-primary">{card.job_title}</p>}
            {card.company && <p className="text-sm text-muted-foreground">{card.company}</p>}
            {card.tagline && <p className="mt-2 text-sm text-muted-foreground">{card.tagline}</p>}
            {card.address && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {card.address}
              </p>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3">
              {card.phone && <ActionTile href={`tel:${card.phone}`} icon={Phone} label="Call" />}
              {card.whatsapp && (
                <ActionTile
                  href={waLink(card.whatsapp, `Hi ${card.display_name}, I saw your card.`)}
                  icon={MessageCircle}
                  label="WhatsApp"
                />
              )}
              {card.email && <ActionTile href={`mailto:${card.email}`} icon={Mail} label="Email" />}
              {(card.maps_url || card.address) && (
                <ActionTile
                  href={
                    card.maps_url ??
                    `https://maps.google.com/?q=${encodeURIComponent(card.address ?? "")}`
                  }
                  icon={MapPin}
                  label="Directions"
                />
              )}
              {card.website && <ActionTile href={card.website} icon={Globe} label="Website" />}
              <ActionTile icon={Share2} label="Share" onClick={share} />
            </div>

            <Button variant="gold" className="mt-4 w-full" onClick={saveContact}>
              <Download className="mr-2 h-4 w-4" /> Save to contacts
            </Button>

            {card.about && (
              <section className="mt-8">
                <h2 className="font-display text-sm font-semibold tracking-wide uppercase">About</h2>
                <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{card.about}</p>
              </section>
            )}

            {products.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                  Products & services
                </h2>
                <ul className="mt-3 space-y-3">
                  {products.map((p) => {
                    const off = discountPct(p.mrp, p.offer_price);
                    return (
                      <li key={p.id} className="rounded-2xl border border-border p-4">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="mb-3 h-36 w-full rounded-xl object-cover"
                          />
                        )}
                        <p className="text-sm font-semibold">{p.name}</p>
                        {p.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-baseline gap-2">
                          {p.offer_price != null && (
                            <span className="font-display text-lg font-bold text-primary">
                              {inr(p.offer_price)}
                            </span>
                          )}
                          {p.mrp != null && (
                            <span className="text-xs text-muted-foreground line-through">
                              {inr(p.mrp)}
                            </span>
                          )}
                          {off > 0 && (
                            <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[11px] text-primary">
                              {off}% off
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.allow_buy &&
                            (() => {
                              const href = buyLink(p.name, p.offer_price ?? p.mrp);
                              if (!href) return null;
                              return (
                                <Button size="sm" variant="gold" asChild>
                                  <a href={href} target="_blank" rel="noreferrer">
                                    Buy now
                                  </a>
                                </Button>
                              );
                            })()}
                          {p.allow_enquiry &&
                            (() => {
                              const href = contactLink(
                                `Hi ${card.display_name}, I'd like to enquire about ${p.name}.`,
                              );
                              if (!href) return null;
                              return (
                                <Button size="sm" variant="goldOutline" asChild>
                                  <a href={href} target="_blank" rel="noreferrer">
                                    Enquire
                                  </a>
                                </Button>
                              );
                            })()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Payments go directly to {card.display_name}; the invoice is issued by them.
                </p>
              </section>
            )}

            {images.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                  Gallery
                </h2>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((m) => (
                    <img
                      key={m.id}
                      src={m.url}
                      alt={m.title || "Gallery image"}
                      loading="lazy"
                      className="aspect-square w-full rounded-xl border border-border object-cover"
                    />
                  ))}
                </div>
              </section>
            )}

            {videos.length > 0 && (
              <section className="mt-8 space-y-3">
                <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                  Videos
                </h2>
                {videos.map((m) => (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:border-primary/50"
                  >
                    <ExternalLink className="h-4 w-4 text-primary" />
                    {m.title || "Watch video"}
                  </a>
                ))}
              </section>
            )}

            {pdfs.length > 0 && (
              <section className="mt-8 space-y-3">
                <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                  Brochures
                </h2>
                {pdfs.map((m) => (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:border-primary/50"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    {m.title || "Download PDF"}
                  </a>
                ))}
              </section>
            )}

            {(card.upi_id || card.bank_details) && (
              <section className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-4">
                <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
                  Payments
                </h2>
                {card.upi_id && (
                  <>
                    <p className="mt-2 text-sm">UPI: {card.upi_id}</p>
                    <Button variant="gold" size="sm" className="mt-3" asChild>
                      <a href={upiPayUrl(card.upi_id, card.display_name, null, "Payment")}>
                        Pay via UPI
                      </a>
                    </Button>
                  </>
                )}
                {card.bank_details && (
                  <p className="mt-3 text-xs whitespace-pre-line text-muted-foreground">
                    {card.bank_details}
                  </p>
                )}
              </section>
            )}

            <LeadForm card={card} />

            <p className="mt-8 text-center text-[11px] text-muted-foreground">
              {card.view_count + 1} visits · Powered by Glinkit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}