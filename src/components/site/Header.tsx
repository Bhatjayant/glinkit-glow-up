import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, WHATSAPP_URL } from "@/lib/site";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { ThemeColorPicker } from "@/components/site/ThemeColorPicker";
import wordmark from "@/assets/glinkit-logo.png.asset.json";

function Wordmark() {
  return (
    <Link to="/" className="flex min-w-0 items-center" aria-label="Glinkit home">
      <img
        src={wordmark.url}
        alt="Glinkit"
        width={1120}
        height={400}
        className="h-8 w-auto shrink-0 rounded-md sm:h-9"
      />
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-8">
          <Wordmark />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.slice(1).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <ThemeColorPicker />
          <Link
            to="/dashboard"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-primary sm:inline"
          >
            Card builder
          </Link>
          <Button variant="gold" size="sm" className="hidden sm:inline-flex" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Get a demo
            </a>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/70 px-5 py-3 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm text-muted-foreground"
                  activeProps={{ className: "text-primary" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="block py-2.5 text-sm text-muted-foreground"
          >
            Card builder
          </Link>
          <Button variant="gold" className="mt-2 w-full" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Get a demo
            </a>
          </Button>
        </nav>
      )}
    </header>
  );
}