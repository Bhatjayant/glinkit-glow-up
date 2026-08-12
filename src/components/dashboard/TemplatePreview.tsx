import type { CardTemplate } from "@/lib/card-templates";
import { backgroundCss, getCardBackground } from "@/lib/card-backgrounds";

const skin = (theme: "dark" | "light") =>
  theme === "light"
    ? {
        bg: "#eaf3ea",
        panel: "#ffffff",
        text: "#123122",
        muted: "rgba(18,49,34,0.55)",
        gold: "#a9812f",
        line: "rgba(18,49,34,0.12)",
      }
    : {
        bg: "#0d1a13",
        panel: "rgba(255,255,255,0.06)",
        text: "#eaf3ea",
        muted: "rgba(234,243,234,0.55)",
        gold: "#e0b558",
        line: "rgba(224,181,88,0.22)",
      };

/** Small non-interactive mockup of how the published card will look. */
export function TemplatePreview({
  template,
  size = "sm",
}: {
  template: CardTemplate;
  size?: "sm" | "lg";
}) {
  const c = skin(template.theme);
  const bg = getCardBackground(template.bg_style);
  const products = template.products.slice(0, size === "lg" ? 3 : 2);
  const centred = template.category === "Minimal" || template.category === "Creative";
  const pad = size === "lg" ? 18 : 12;
  const scale = size === "lg" ? 1.35 : 1;

  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-xl border"
      style={{
        background: backgroundCss(template.bg_style, template.theme),
        borderColor: c.line,
        padding: pad,
        color: c.text,
      }}
    >
      {bg.shimmer && (
        <span
          className="animate-mild-sheen pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(224,181,88,0.18) 50%, transparent 65%)",
          }}
        />
      )}
      {/* header */}
      <div
        className="flex items-center gap-2"
        style={{ flexDirection: centred ? "column" : "row", textAlign: centred ? "center" : "left" }}
      >
        <div
          style={{
            width: 26 * scale,
            height: 26 * scale,
            borderRadius: 999,
            background: `linear-gradient(135deg, ${c.gold}, ${c.gold}55)`,
            flex: "0 0 auto",
          }}
        />
        <div style={{ width: centred ? "100%" : "auto", flex: 1 }}>
          <div
            style={{
              height: 6 * scale,
              width: centred ? "55%" : "62%",
              margin: centred ? "0 auto" : undefined,
              borderRadius: 999,
              background: c.text,
              opacity: 0.85,
            }}
          />
          <div
            style={{
              marginTop: 4,
              height: 4 * scale,
              width: centred ? "38%" : "45%",
              margin: centred ? "4px auto 0" : "4px 0 0",
              borderRadius: 999,
              background: c.gold,
              opacity: 0.8,
            }}
          />
        </div>
      </div>

      {/* tagline */}
      <p
        className="line-clamp-2"
        style={{
          marginTop: 8,
          fontSize: 8 * scale,
          lineHeight: 1.4,
          color: c.muted,
          textAlign: centred ? "center" : "left",
        }}
      >
        {template.patch.tagline ?? ""}
      </p>

      {/* action row */}
      <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: centred ? "center" : "flex-start" }}>
        {["Call", "WhatsApp", "Save"].map((label) => (
          <span
            key={label}
            style={{
              fontSize: 6.5 * scale,
              padding: `${3 * scale}px ${6 * scale}px`,
              borderRadius: 999,
              border: `1px solid ${c.line}`,
              background: c.panel,
              color: c.text,
              opacity: 0.9,
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* body blocks / products */}
      {products.length > 0 ? (
        <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
          {products.map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
                borderRadius: 8,
                border: `1px solid ${c.line}`,
                background: c.panel,
                padding: `${4 * scale}px ${6 * scale}px`,
              }}
            >
              <span style={{ fontSize: 7 * scale }} className="line-clamp-1">
                {p.name}
              </span>
              <span style={{ fontSize: 6.5 * scale, color: c.gold, whiteSpace: "nowrap" }}>
                {p.offer_price === 0 ? "Free" : p.offer_price ? `₹${p.offer_price}` : "Enquire"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
          {[92, 78, 60].map((w) => (
            <div
              key={w}
              style={{ height: 3.5 * scale, width: `${w}%`, borderRadius: 999, background: c.muted, opacity: 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}