import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl px-5 py-16 sm:py-20", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary uppercase">{children}</p>
  );
}

export function SectionTitle({ children, lead }: { children: ReactNode; lead?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold sm:text-4xl">{children}</h2>
      {lead && <p className="mt-3 text-base text-muted-foreground">{lead}</p>}
    </div>
  );
}