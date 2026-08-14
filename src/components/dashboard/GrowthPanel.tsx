import { TrendingUp } from "lucide-react";

/** "My growth" — plain-language insights plus exactly one recommendation. */
export function GrowthPanel({
  views,
  saves,
  connects,
  leads,
  recommendation,
}: {
  views: number;
  saves: number;
  connects: number;
  leads: number;
  recommendation: string;
}) {
  const lines = [
    views
      ? `Your profile was viewed ${views} ${views === 1 ? "time" : "times"} in the last 30 days.`
      : "No views yet in the last 30 days — sharing your link is the first step.",
    `${saves} ${saves === 1 ? "person" : "people"} saved your contact.`,
    `${connects} ${connects === 1 ? "person" : "people"} connected with you${leads ? `, and ${leads} ${leads === 1 ? "lead is" : "leads are"} in your CRM` : ""}.`,
    views >= 20
      ? `That is a ${Math.round((connects / views) * 1000) / 10}% connection rate.`
      : "Connection rate shows up once you pass 20 views.",
  ];

  return (
    <section className="surface-panel mt-6 rounded-2xl p-5 sm:p-6">
      <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
        <TrendingUp className="h-4.5 w-4.5 text-primary" /> My growth
      </h2>
      <ul className="mt-4 space-y-2">
        {lines.map((l) => (
          <li key={l} className="text-sm text-muted-foreground">
            {l}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl border border-primary/30 bg-primary/[0.07] p-3 text-xs">
        <span className="font-medium text-primary">Do this next: </span>
        {recommendation}
      </p>
    </section>
  );
}
