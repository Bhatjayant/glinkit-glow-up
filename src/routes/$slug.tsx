import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { BookingScheduler } from "@/components/card/BookingScheduler";
import { ConnectDialog } from "@/components/card/ConnectDialog";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Handshake,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { onceThisSession, resolveSource, trackEvent, type EventType } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site";
import { backgroundCss, getCardBackground } from "@/lib/card-backgrounds";
import {
  avatarRadius,
  bodyPad,
  getCardLayout,
  nameClass,
  panelRadius,
  sectionGap,
  type SectionKey,
} from "@/lib/card-layouts";
import { resolveCta } from "@/lib/profile";
import {
  discountPct,
  externalUrl,
  fetchPublicCard,
  inr,
  mapsUrl,
  upiPayUrl,
  vcard,
  waLink,
  type Card,
} from "@/lib/cards";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => fetchPublicCard(params.slug),
  head: ({ params, loaderData }) => {
    const card = loaderData?.card;
    const name = card?.display_name?.trim() || params.slug;
    const role = [card?.job_title?.trim(), card?.company?.trim()].filter(Boolean).join(" · ");
    const t = role ? `${name} | ${role}` : `${name} | Glinkit profile`;
    const desc =
      card?.seo_description?.trim() ||
      card?.headline?.trim() ||
      card?.short_bio?.trim() ||
      card?.tagline?.trim() ||
      card?.about?.trim() ||
      [name, role].filter(Boolean).join(" — ");
    const url = `${SITE_URL}/${params.slug}`;
    const image = card?.photo_url?.startsWith("https://") ? card.photo_url : null;
    return {
      meta: [
        { title: t },
        { name: "description", content: desc.slice(0, 155) },
        { property: "og:title", content: t },
        { property: "og:description", content: desc.slice(0, 155) },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PublicCardPage,
});

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

function PublicCardPage() {
  const { slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const [qrOpen, setQrOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [layoutOverride, setLayoutOverride] = useState<string | null>(null);
  useEffect(() => {
    setLayoutOverride(new URLSearchParams(window.location.search).get("layout"));
  }, []);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);
  const offerRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["public-card", slug],
    queryFn: () => fetchPublicCard(slug),
    initialData: initial ?? undefined,
  });

  useEffect(() => {
    const id = data?.card?.id;
    if (!id) return;
    if (!onceThisSession(`glinkit:view:${slug}`)) return;
    void supabase.rpc("increment_card_view", { _slug: slug });
    void trackEvent(id, slug, "view");
    if (resolveSource(slug) === "qr") void trackEvent(id, slug, "qr");
  }, [data?.card?.id, slug]);

  if (isLoading) {
    return (
      <div className="px-5 py-24 text-center text-sm text-muted-foreground">Loading profile…</div>
    );
  }
  if (!data) throw notFound();

  const { card, products, media, services } = data;
  const track = (type: EventType, label = "") => void trackEvent(card.id, slug, type, label);
  const images = media.filter((m) => m.kind === "image");
  const videos = media.filter((m) => m.kind === "youtube");
  const pdfs = media.filter((m) => m.kind === "pdf");
  const links = media.filter((m) => m.kind === "link");
  const highlights = media.filter((m) => m.kind === "highlight");
  const isLight = card.theme === "light";
  const L = getCardLayout(layoutOverride ?? card.layout);
  const gap = sectionGap(L.density);
  const offerMode = card.offer_mode ?? "both";
  const showProducts = offerMode !== "services" && products.length > 0;
  const showServices = offerMode !== "products" && services.length > 0;
  const firstName = card.display_name.split(" ")[0] || card.display_name;
  // "Verification" is shown only for profiles with a real photo and organisation.
  const verified = Boolean(card.photo_url && card.company?.trim());
  const photoFallback = (size: string) => (
    <div className="grid h-full w-full place-items-center bg-primary/10">
      <UserRound className={`${size} text-primary/55`} strokeWidth={1.25} />
    </div>
  );

  const logo = card.logo_url ? (
    <img
      src={card.logo_url}
      alt={`${card.company} logo`}
      className="absolute top-4 left-5 h-9 w-auto rounded"
    />
  ) : null;
  const viewChip = (
    <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/60 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur">
      <Eye className="h-3 w-3 text-primary" /> {card.view_count + 1} views
    </span>
  );

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
    track("save_contact");
    const blob = new Blob(
      [
        vcard(
          card,
          links.map((l) => ({ url: l.url, title: l.title })),
        ),
      ],
      {
        type: "text/vcard",
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.slug}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    track("share");
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

  const cta = resolveCta(card);
  const runCta = () => {
    track("cta", cta.event);
    if (cta.kind === "connect") return setConnectOpen(true);
    if (cta.kind === "booking")
      return bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (cta.kind === "products")
      return offerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const ctaButton =
    cta.kind === "link" ? (
      <Button variant="gold" className="h-12 w-full text-[15px]" asChild>
        <a href={cta.href} target="_blank" rel="noreferrer" onClick={() => track("cta", cta.event)}>
          {cta.label} <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    ) : (
      <Button variant="gold" className="h-12 w-full text-[15px]" onClick={runCta}>
        {cta.label} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    );

  const identityBlock = (
    <>
      {card.headline?.trim() && (
        <p
          className={`mt-4 text-[15px] leading-snug font-medium text-foreground ${L.align === "center" ? "text-center" : ""}`}
        >
          {card.headline}
        </p>
      )}
      {(card.short_bio?.trim() || card.tagline?.trim()) && (
        <p
          className={`mt-2 text-[13px] leading-relaxed text-muted-foreground ${L.align === "center" ? "text-center" : ""}`}
        >
          {card.short_bio?.trim() || card.tagline}
        </p>
      )}
    </>
  );

  // Single source of truth for every connect action — rendered once, in the floating rail.
  type RailAction = {
    label: string;
    icon: typeof Phone;
    href?: string;
    onClick?: () => void;
    primary?: boolean;
  };
  const directions = mapsUrl(card);
  const website = externalUrl(card.website);
  const rail: RailAction[] = [
    { label: "Connect", icon: Handshake, onClick: () => setConnectOpen(true), primary: true },
  ];
  if (card.whatsapp)
    rail.push({
      label: "WhatsApp",
      icon: MessageCircle,
      href: waLink(card.whatsapp, `Hi ${firstName}, I found your Glinkit profile.`),
      onClick: () => track("whatsapp"),
    });
  if (card.phone)
    rail.push({
      label: "Call",
      icon: Phone,
      href: `tel:${card.phone}`,
      onClick: () => track("call"),
    });
  if (card.email)
    rail.push({
      label: "Email",
      icon: Mail,
      href: `mailto:${card.email}`,
      onClick: () => track("email"),
    });
  rail.push({ label: "Save contact", icon: Download, onClick: saveContact });
  if (directions) rail.push({ label: "Directions", icon: MapPin, href: directions });
  if (website) rail.push({ label: "Website", icon: Globe, href: website });
  rail.push({ label: "QR code", icon: QrCode, onClick: () => setQrOpen(true) });
  rail.push({ label: "Share", icon: Share2, onClick: share });

  const railItem = (r: RailAction, size: string) => {
    const cls = `grid ${size} place-items-center rounded-full border transition-all hover:-translate-y-0.5 ${
      r.primary
        ? "border-primary bg-primary text-primary-foreground"
        : "border-primary/25 bg-primary/[0.08] text-primary hover:border-primary/60 hover:bg-primary/20"
    }`;
    return r.href ? (
      <a
        href={r.href}
        target="_blank"
        rel="noreferrer"
        title={r.label}
        aria-label={r.label}
        onClick={r.onClick}
        className={cls}
      >
        <r.icon className="h-4.5 w-4.5" />
      </a>
    ) : (
      <button
        type="button"
        title={r.label}
        aria-label={r.label}
        onClick={r.onClick}
        className={cls}
      >
        <r.icon className="h-4.5 w-4.5" />
      </button>
    );
  };

  const sections: Partial<Record<SectionKey, React.ReactNode>> = {};

  if (showServices)
    sections.services = (
      <section key="services" className={gap}>
        <SectionHeading icon={Sparkles}>What I do</SectionHeading>
        <ul className="mt-4 space-y-3">
          {services.map((s) => {
            const sHref =
              externalUrl(s.cta_url) ||
              contactLink(`Hi ${firstName}, I'd like to know about ${s.title}.`);
            return (
              <li
                key={s.id}
                className="overflow-hidden rounded-2xl border border-border bg-primary/[0.035] p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  {s.image_url && (
                    <img
                      src={s.image_url}
                      alt={s.title}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-semibold">{s.title}</p>
                    {s.description && (
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                    {sHref && (
                      <a
                        href={sHref}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => track("service_click", s.title)}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        {s.cta_label || "Know more"} <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );

  if (highlights.length > 0)
    sections.about = (
      <div key="about">
        <section className={gap}>
          <SectionHeading icon={Sparkles}>Speciality</SectionHeading>
          <ul className="mt-3 flex flex-wrap gap-2">
            {highlights.map((h) => (
              <li
                key={h.id}
                className="rounded-full border border-primary/30 bg-primary/[0.07] px-3 py-1.5 text-xs"
              >
                {h.title || h.url}
              </li>
            ))}
          </ul>
        </section>
        {card.about && (
          <section className={gap}>
            <SectionHeading>About</SectionHeading>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {card.about}
            </p>
          </section>
        )}
      </div>
    );
  else if (card.about)
    sections.about = (
      <section key="about" className={gap}>
        <SectionHeading>About</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {card.about}
        </p>
      </section>
    );

  if (links.length > 0)
    sections.links = (
      <section key="links" className={gap}>
        <SectionHeading icon={Link2}>Links</SectionHeading>
        <div className="mt-3 grid gap-2">
          {links.map(
            (l) =>
              externalUrl(l.url) && (
                <a
                  key={l.id}
                  href={externalUrl(l.url)!}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("social", l.title || l.url)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary/[0.03] px-4 py-3 text-sm transition-colors hover:border-primary/50"
                >
                  <span className="truncate">{l.title || l.url}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                </a>
              ),
          )}
        </div>
      </section>
    );

  if (showProducts)
    sections.products = (
      <section key="products" ref={offerRef} className={gap}>
        <SectionHeading>What I offer</SectionHeading>
        <ul className="mt-3 space-y-3">
          {products.map((p) => {
            const off = discountPct(p.mrp, p.offer_price);
            return (
              <li
                key={p.id}
                className="overflow-hidden rounded-2xl border border-border bg-primary/[0.03] p-4 transition-colors hover:border-primary/40"
              >
                {p.image_url && (
                  <button
                    type="button"
                    onClick={() => setLightbox(p.image_url)}
                    className="mb-3 block w-full"
                  >
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  </button>
                )}
                <p className="font-display text-sm font-semibold">{p.name}</p>
                {p.description && (
                  <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                    {p.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  {p.offer_price != null && (
                    <span className="font-display text-lg font-bold text-primary">
                      {inr(p.offer_price)}
                    </span>
                  )}
                  {p.mrp != null && (
                    <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
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
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              track("product_click", p.name);
                              if (card.upi_id) track("payment", p.name);
                            }}
                          >
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
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => track("product_click", p.name)}
                          >
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
    );

  if (images.length > 0)
    sections.gallery = (
      <section key="gallery" className={gap}>
        <SectionHeading>Gallery</SectionHeading>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((m) => (
            <button key={m.id} type="button" onClick={() => setLightbox(m.url)}>
              <img
                src={m.url}
                alt={m.title || "Gallery image"}
                loading="lazy"
                className="aspect-square w-full rounded-xl border border-border object-cover transition-transform hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      </section>
    );

  if (videos.length > 0)
    sections.videos = (
      <section key="videos" className={`${gap} space-y-3`}>
        <SectionHeading>Videos</SectionHeading>
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
    );

  if (pdfs.length > 0)
    sections.docs = (
      <section key="docs" className={`${gap} space-y-3`}>
        <SectionHeading>Brochures</SectionHeading>
        {pdfs.map((m) => (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("document", m.title || m.url)}
            className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:border-primary/50"
          >
            <FileText className="h-4 w-4 text-primary" />
            {m.title || "Download PDF"}
          </a>
        ))}
      </section>
    );

  if (card.upi_id || card.bank_details)
    sections.payments = (
      <section
        key="payments"
        className={`${gap} rounded-2xl border border-primary/25 bg-primary/5 p-4`}
      >
        <SectionHeading>Payments</SectionHeading>
        {card.upi_id && (
          <>
            <p className="mt-2 text-sm">UPI: {card.upi_id}</p>
            <Button variant="gold" size="sm" className="mt-3" asChild>
              <a
                href={upiPayUrl(card.upi_id, card.display_name, null, "Payment")}
                onClick={() => track("payment")}
              >
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
    );

  sections.booking = (
    <div key="booking" ref={bookingRef}>
      <BookingScheduler card={card} slug={slug} />
    </div>
  );

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
      <div className="relative mx-auto max-w-md px-3 pt-6 pb-16 sm:max-w-2xl sm:px-6 sm:pt-10">
        {/* The DVC itself: one self-contained card. Actions live inside this boundary. */}
        <div className="rounded-[28px] border border-primary/20 bg-background/35 p-2 shadow-[0_40px_90px_-45px_var(--primary)] backdrop-blur-sm sm:p-3">
          <div className="flex items-start gap-2 sm:gap-3">
            {/* Desktop action rail — part of the card, sticky within the full DVC height so it follows the scroll. */}
            <nav aria-label="Ways to connect" className="hidden self-stretch sm:block">
              <ul className="sticky top-4 flex flex-col gap-1.5 rounded-full border border-primary/25 bg-background/70 p-1.5">
                {rail.map((r) => (
                  <li key={r.label}>{railItem(r, "h-11 w-11")}</li>
                ))}
              </ul>
            </nav>
            <div className="min-w-0 flex-1">
        <div className={`surface-panel overflow-hidden ${panelRadius(L.panel)}`}>
          {L.hero === "banner" && (
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary/35 via-primary/10 to-transparent">
              <span
                aria-hidden
                className="animate-mild-sheen pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)",
                }}
              />
              <span
                aria-hidden
                className="absolute -top-16 -right-10 h-40 w-40 rounded-full border border-primary/30"
              />
              <span
                aria-hidden
                className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full border border-primary/20"
              />
              {logo}
              {viewChip}
            </div>
          )}

          {L.hero === "cover" && (
            <div className="relative h-64 overflow-hidden sm:h-72">
              {card.photo_url ? (
                <img
                  src={card.photo_url}
                  alt={card.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                photoFallback("h-20 w-20")
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
              {logo}
              {viewChip}
              <div className="absolute inset-x-5 bottom-4">
                <h1 className={`${nameClass(L.nameType)} flex items-center gap-1.5 drop-shadow`}>
                  <span className="truncate">{card.display_name}</span>
                  {verified && <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-primary" />}
                </h1>
                <p className="mt-0.5 text-[13px] text-primary">
                  {[card.job_title, card.company].filter((v) => v?.trim()).join(" • ")}
                </p>
              </div>
            </div>
          )}

          {L.hero === "ticket" && (
            <div className="relative border-b border-dashed border-primary/40 bg-primary/[0.07] py-4 text-center">
              <p className="font-display text-[10px] tracking-[0.32em] uppercase text-primary">
                Professional identity
              </p>
              {viewChip}
              <span
                aria-hidden
                className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-[var(--background)]"
              />
              <span
                aria-hidden
                className="absolute -right-2.5 -bottom-2.5 h-5 w-5 rounded-full bg-[var(--background)]"
              />
            </div>
          )}

          <div
            className={`${bodyPad(L.density)} ${L.hero === "banner" || L.hero === "cover" ? "" : "pt-6"}`}
          >
            {L.hero === "split" ? (
              <div className="flex items-start gap-4">
                <div
                  className={`h-20 w-20 shrink-0 overflow-hidden border border-primary/40 bg-background ${avatarRadius(L.avatar)}`}
                >
                  {card.photo_url ? (
                    <img
                      src={card.photo_url}
                      alt={card.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    photoFallback("h-8 w-8")
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className={`${nameClass(L.nameType)} flex items-center gap-1.5`}>
                    <span className="truncate">{card.display_name}</span>
                    {verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </h1>
                  {card.job_title && (
                    <p className="text-[12px] tracking-wide text-primary uppercase">
                      {card.job_title}
                    </p>
                  )}
                  {card.company && <p className="text-sm text-muted-foreground">{card.company}</p>}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3 text-primary" /> {card.view_count + 1} views
                  </div>
                </div>
              </div>
            ) : L.hero === "mono" ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display truncate text-[10px] tracking-[0.3em] uppercase text-primary">
                    {card.company || "Professional identity"}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3 text-primary" /> {card.view_count + 1}
                  </span>
                </div>
                <span aria-hidden className="mt-3 block h-px w-full bg-primary/30" />
                <h1 className={`${nameClass(L.nameType)} mt-4`}>{card.display_name}</h1>
                {card.job_title && (
                  <p className="mt-1 text-xs tracking-[0.18em] uppercase text-muted-foreground">
                    {card.job_title}
                  </p>
                )}
                <span aria-hidden className="mt-4 block h-px w-16 bg-primary" />
              </div>
            ) : L.hero === "cover" ? null : (
              <div className={L.align === "center" ? "text-center" : ""}>
                <div
                  className={`${L.hero === "banner" ? "-mt-12" : ""} mb-4 h-24 w-24 overflow-hidden border border-primary/40 bg-background shadow-[0_18px_40px_-20px_var(--primary)] ring-4 ring-background ${avatarRadius(L.avatar)} ${L.align === "center" ? "mx-auto h-28 w-28" : ""}`}
                >
                  {card.photo_url ? (
                    <img
                      src={card.photo_url}
                      alt={card.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    photoFallback("h-10 w-10")
                  )}
                </div>

                <h1
                  className={`${nameClass(L.nameType)} flex items-center gap-1.5 ${L.align === "center" ? "justify-center" : ""}`}
                >
                  <span className="truncate">{card.display_name}</span>
                  {verified && <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-primary" />}
                </h1>
                <p className={`mt-1 text-[13px] text-primary ${L.align === "center" ? "" : ""}`}>
                  {[card.job_title, card.company].filter((v) => v?.trim()).join(" • ")}
                </p>
              </div>
            )}

            {identityBlock}

            {/* Primary actions — never more than three on the first screen. */}
            <div
              className={`mt-5 grid gap-2 ${L.ctaStyle === "banner" ? "rounded-2xl border border-primary/25 bg-primary/[0.06] p-3" : ""}`}
            >
              {L.ctaStyle !== "quiet" && ctaButton}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="goldOutline" className="h-11" onClick={saveContact}>
                  <Download className="mr-1.5 h-4 w-4" /> Save contact
                </Button>
                <Button
                  variant={L.ctaStyle === "quiet" ? "gold" : "goldOutline"}
                  className="h-11"
                  onClick={() => setConnectOpen(true)}
                >
                  <Handshake className="mr-1.5 h-4 w-4" /> Connect
                </Button>
              </div>
              {L.ctaStyle === "quiet" && cta.kind !== "connect" && (
                <button
                  type="button"
                  onClick={runCta}
                  className="mt-0.5 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  {cta.label} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mobile: in-card compact action row (no external rail). */}
            <nav aria-label="Ways to connect" className="mt-4 sm:hidden">
              <ul className="-mx-1 flex flex-wrap gap-2 px-1">
                {rail.map((r) => (
                  <li key={r.label}>{railItem(r, "h-10 w-10")}</li>
                ))}
              </ul>
            </nav>

            {L.order.map((key) => sections[key] ?? null)}

            <p className="mt-8 text-center text-[11px] text-muted-foreground">
              Powered by <span className="text-primary">Glinkit</span> · Create. Share. Connect.
            </p>
          </div>
        </div>
            </div>
          </div>
        </div>
      </div>

      <ConnectDialog
        card={card}
        slug={slug}
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onSaveContact={saveContact}
      />

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-display">Scan to open this profile</DialogTitle>
            <DialogDescription>Point any phone camera at the code.</DialogDescription>
          </DialogHeader>
          <div className="mx-auto rounded-2xl bg-white p-4">
            <QRCodeSVG value={`${SITE_URL}/${slug}`} size={200} level="M" />
          </div>
          <Button variant="goldOutline" onClick={share}>
            <Share2 className="mr-2 h-4 w-4" /> Share link
          </Button>
        </DialogContent>
      </Dialog>

      {lightbox && (
        <button
          type="button"
          aria-label="Close image"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-6 backdrop-blur"
        >
          <X className="absolute top-5 right-5 h-5 w-5 text-primary" />
          <img
            src={lightbox}
            alt="Preview"
            className="max-h-[80vh] w-auto rounded-2xl border border-primary/30 object-contain"
          />
        </button>
      )}
    </div>
  );
}
