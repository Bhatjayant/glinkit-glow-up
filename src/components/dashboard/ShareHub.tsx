import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, MessageCircle, Nfc, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";

/** One place to put a Glinkit profile in front of people. */
export function ShareHub({ slug, name }: { slug: string; name: string }) {
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef<HTMLDivElement | null>(null);
  // The permanent profile URL — QR codes and NFC tags must never encode a preview link.
  const url = `${SITE_URL}/${slug}`;

  const copy = async () => {
    await navigator.clipboard?.writeText(url);
    toast.success("Profile link copied");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    await copy();
  };

  const downloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 64, 64, 896, 896);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `glinkit-${slug}-qr.png`;
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
  };

  return (
    <section className="surface-panel mt-6 rounded-2xl p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold">Share your Glinkit</h2>
      <p className="mt-1 truncate text-xs text-muted-foreground">{url}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="goldOutline" className="h-11" onClick={copy}>
          <Copy className="mr-1.5 h-4 w-4" /> Copy link
        </Button>
        <Button variant="goldOutline" className="h-11" asChild>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${name} — my Glinkit profile: ${url}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
          </a>
        </Button>
        <Button variant="goldOutline" className="h-11" onClick={() => setShowQr((v) => !v)}>
          <QrCode className="mr-1.5 h-4 w-4" /> QR code
        </Button>
        <Button variant="gold" className="h-11" onClick={shareNative}>
          <Share2 className="mr-1.5 h-4 w-4" /> Share
        </Button>
      </div>

      {showQr && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <div ref={qrRef} className="rounded-2xl bg-white p-4">
            <QRCodeSVG value={url} size={180} level="M" />
          </div>
          <Button size="sm" variant="goldOutline" onClick={downloadQr}>
            <Download className="mr-1.5 h-4 w-4" /> Download QR (PNG)
          </Button>
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-primary/[0.04] p-3 text-[11px] text-muted-foreground">
        <Nfc className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        NFC ready: write this exact link to any NFC card or tag and a tap opens your profile — no
        app needed for you or the person tapping.
      </p>
    </section>
  );
}
