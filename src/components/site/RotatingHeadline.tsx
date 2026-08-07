import { useEffect, useState } from "react";

export const HEADLINES: { lead: string; accent: string }[] = [
  { lead: "Your first impression,", accent: "engineered to convert" },
  { lead: "One tap and they can call, chat,", accent: "pay you instantly" },
  { lead: "Stop reprinting cards —", accent: "update yours in seconds" },
  { lead: "Give every employee a card that", accent: "brings back leads" },
  { lead: "Look established from day one,", accent: "close deals faster" },
];

export function RotatingHeadline() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HEADLINES.length), 3800);
    return () => clearInterval(t);
  }, []);

  const h = HEADLINES[i]!;

  return (
    <h1
      aria-live="polite"
      className="mt-5 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl"
    >
      {/* Reserve space for the tallest headline so the page never jumps */}
      <span className="grid">
        <span className="invisible col-start-1 row-start-1" aria-hidden="true">
          Give every employee a card that brings back leads
        </span>
        <span key={i} className="animate-fade-in col-start-1 row-start-1">
          {h.lead} <span className="text-gold-gradient">{h.accent}</span>
        </span>
      </span>
    </h1>
  );
}