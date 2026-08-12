import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { improveCopy } from "@/lib/ai-copy.functions";

export function AiImprove({
  field,
  text,
  context,
  onResult,
  label = "Improve with AI",
}: {
  field: "tagline" | "about" | "product";
  text: string;
  context?: string;
  onResult: (value: string) => void;
  label?: string;
}) {
  const run = useServerFn(improveCopy);
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await run({ data: { field, text, context } });
          onResult(res.text);
          toast.success("Rewritten — edit it if you like");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "AI could not rewrite that");
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2.5 py-1 text-[11px] font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
    >
      <Sparkles className={`h-3 w-3 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Writing…" : label}
    </button>
  );
}
