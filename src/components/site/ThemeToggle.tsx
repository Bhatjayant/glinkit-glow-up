import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "glinkit-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    const isLight = stored === "light";
    setLight(isLight);
    document.documentElement.classList.toggle("theme-light", isLight);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("theme-light", next);
    window.localStorage.setItem(KEY, next ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      title={light ? "Dark green theme" : "Light ivory theme"}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/60 hover:text-primary ${className}`}
    >
      {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}