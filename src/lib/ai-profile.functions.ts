import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  brief: z.string().trim().min(10, "Tell us a little more").max(1200),
});

const shape = `{
  "headline": "professional headline, max 80 chars",
  "short_bio": "one-line bio, max 140 chars",
  "about": "40-70 word about paragraph",
  "tagline": "punchy tagline, max 90 chars",
  "cta": "call to action, max 60 chars",
  "seo_description": "meta description, max 155 chars",
  "services": [{ "name": "service name", "description": "20-30 word benefit-led description" }]
}`;

export const generateProfile = createServerFn({ method: "POST" })
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
              "You write professional digital identity profiles for Indian professionals and companies. Reply with ONLY minified JSON matching the requested shape — no markdown, no commentary. Plain English, no emoji, no hashtags, never invent awards, client names or numbers.",
          },
          {
            role: "user",
            content: `Create profile copy from this brief:\n${data.brief}\n\nReturn exactly this JSON shape (3 to 5 services):\n${shape}`,
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    if (!res.ok) throw new Error("AI could not generate the profile. Try again.");

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const body = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      throw new Error("AI returned an unexpected response. Try again.");
    }

    const out = z
      .object({
        headline: z.string().max(120).default(""),
        short_bio: z.string().max(200).default(""),
        about: z.string().max(1200).default(""),
        tagline: z.string().max(160).default(""),
        cta: z.string().max(80).default(""),
        seo_description: z.string().max(200).default(""),
        services: z
          .array(
            z.object({
              name: z.string().max(80),
              description: z.string().max(400).default(""),
            }),
          )
          .max(6)
          .default([]),
      })
      .parse(parsed);

    return out;
  });