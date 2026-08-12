import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  field: z.enum(["tagline", "about", "product"]),
  text: z.string().trim().max(2000),
  context: z.string().trim().max(400).optional(),
});

const rules: Record<string, string> = {
  tagline:
    "Write ONE punchy tagline for a digital visiting card. Max 90 characters, no quotes, no emoji, no hashtags. Make it concrete and sales-driving.",
  about:
    "Write a warm, credible 'About' paragraph for a digital visiting card. 40-70 words, plain English, second person where natural, one clear call to action to message on WhatsApp. No emoji, no headings, no bullet points.",
  product:
    "Write a short product/service description for a digital visiting card. 20-35 words, benefit-led, one concrete detail (turnaround, warranty, inclusion). No emoji, no price.",
};

export const improveCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a copywriter for Indian small businesses and corporate teams. You return only the rewritten copy, nothing else — no preamble, no options, no markdown.",
          },
          {
            role: "user",
            content: [
              rules[data.field],
              data.context ? `Card context: ${data.context}` : "",
              data.text ? `Improve this draft:\n${data.text}` : "There is no draft — write it from the card context.",
            ]
              .filter(Boolean)
              .join("\n\n"),
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    if (!res.ok) throw new Error("AI could not rewrite that. Try again.");

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const out = json.choices?.[0]?.message?.content?.trim();
    if (!out) throw new Error("AI returned an empty response.");
    return { text: out.replace(/^["'`]+|["'`]+$/g, "") };
  });
