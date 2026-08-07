import { Link } from "@tanstack/react-router";
import { NAV_LINKS, PHONE, PHONE_DISPLAY, EMAIL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg font-bold">
            glinkit<span className="text-primary">.</span>
          </p>
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
          <a href={`tel:${PHONE}`} className="block text-primary hover:underline">
            {PHONE_DISPLAY}
          </a>
          <a href={`mailto:${EMAIL}`} className="mt-1 block text-muted-foreground hover:text-primary">
            {EMAIL}
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} glinkit.com
          </p>
        </div>
      </div>
    </footer>
  );
}