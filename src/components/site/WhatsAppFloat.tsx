import { WHATSAPP_URL } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2">
      <span
        aria-hidden="true"
        className="animate-bubble-ring absolute inset-0 rounded-full bg-[#25D366]/60"
      />
      <span
        aria-hidden="true"
        className="animate-bubble-ring absolute inset-0 rounded-full bg-[#25D366]/40 [animation-delay:1.1s]"
      />
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Glinkit on WhatsApp"
        className="animate-simmer relative grid h-14 w-14 place-items-center rounded-full bg-[#2bf177] shadow-[0_0_28px_rgba(37,211,102,0.75)] ring-2 ring-white/40 transition-transform hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#04331a]" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.15-.15.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.19-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.62.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z" />
          <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.93L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.19h.01c5.43 0 9.84-4.4 9.84-9.84A9.78 9.78 0 0 0 12.04 2Zm0 17.98h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.08.8.82-3.01-.19-.31a8.11 8.11 0 0 1-1.24-4.31c0-4.5 3.66-8.16 8.15-8.16a8.16 8.16 0 0 1 8.15 8.17c0 4.5-3.66 8.13-8.16 8.13Z" />
        </svg>
      </a>
    </div>
  );
}