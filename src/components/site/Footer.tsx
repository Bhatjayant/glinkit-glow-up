import { Link } from "@tanstack/react-router";
import { NAV_LINKS, EMAIL, WHATSAPP_URL } from "@/lib/site";
import willpower from "@/assets/willpower-mark.png.asset.json";
import wordmark from "@/assets/glinkit-logo.png.asset.json";

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <img
            src={wordmark.url}
            alt="Glinkit"
            width={1120}
            height={400}
            loading="lazy"
            className="h-8 w-auto rounded-md"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Smart digital business cards for corporates and startups. Built in India, shared
            worldwide.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="block text-primary hover:underline"
          >
            Chat on WhatsApp
          </a>
          <a href={`mailto:${EMAIL}`} className="mt-1 block text-muted-foreground hover:text-primary">
            {EMAIL}
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            <span className="text-foreground/80">Our offices:</span> Pune | Thane | Hubballi
          </p>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <img
              src={willpower.url}
              alt="Willpower Group Venture"
              width={64}
              height={64}
              loading="lazy"
              className="h-8 w-8 rounded-md object-contain"
            />
            <p className="text-xs text-muted-foreground">
              Glinkit — A product of Willpower Group Venture — 2026
            </p>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} glinkit.com</p>
        </div>
      </div>
    </footer>
  );
}