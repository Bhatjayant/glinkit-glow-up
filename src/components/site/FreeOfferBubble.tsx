import { Gift } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/site";

export function FreeOfferBubble() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Claim free usage for three months on WhatsApp"
      className="animate-float-bob offer-bubble fixed bottom-5 left-4 z-50 inline-flex max-w-[15rem] items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold sm:text-sm"
    >
      <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Free for 3 months — tap to claim</span>
    </a>
  );
}